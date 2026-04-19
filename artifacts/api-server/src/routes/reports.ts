import { Router } from "express";
import { db } from "@workspace/db";
import { reportsTable, signsTable, measurementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/reports", async (req, res) => {
  try {
    const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.created_at));
    res.json({ reports, total: reports.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const body = req.body;
    const id = randomUUID();

    // Compute compliance stats if route_id provided
    let total_signs = 0;
    let compliance_rate = 0;
    let critical_findings = 0;
    let route_name: string | undefined;

    if (body.route_id) {
      const { routesTable } = await import("@workspace/db");
      const [route] = await db.select().from(routesTable).where(eq(routesTable.id, body.route_id)).limit(1);
      route_name = route?.name;
      const signs = await db.select().from(signsTable).where(eq(signsTable.route_id, body.route_id));
      total_signs = signs.length;
      const compliant = signs.filter(s => s.status === "compliant").length;
      critical_findings = signs.filter(s => s.status === "critical").length;
      compliance_rate = total_signs > 0 ? (compliant / total_signs) * 100 : 0;
    }

    const [report] = await db.insert(reportsTable).values({
      id,
      title: body.title,
      route_id: body.route_id,
      route_name,
      type: body.type,
      status: "ready",
      period_start: body.period_start ? new Date(body.period_start) : undefined,
      period_end: body.period_end ? new Date(body.period_end) : undefined,
      total_signs,
      compliance_rate: parseFloat(compliance_rate.toFixed(1)),
      critical_findings,
      generated_by: body.generated_by,
    }).returning();

    res.status(201).json(report);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, req.params.id)).limit(1);
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json(report);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/reports/:id", async (req, res) => {
  try {
    await db.delete(reportsTable).where(eq(reportsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
