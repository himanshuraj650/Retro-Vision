import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const { severity, resolved, limit = "50" } = req.query as Record<string, string>;
    const conditions = [];
    if (severity) conditions.push(eq(alertsTable.severity, severity));
    if (resolved !== undefined) conditions.push(eq(alertsTable.resolved, resolved === "true"));

    const alerts = await db.select().from(alertsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alertsTable.created_at))
      .limit(parseInt(limit));

    const total = await db.$count(alertsTable, conditions.length > 0 ? and(...conditions) : undefined);

    res.json({ alerts, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alerts/:id/resolve", async (req, res) => {
  try {
    const { resolved_by, resolution_note } = req.body;
    const [alert] = await db.update(alertsTable)
      .set({ resolved: true, resolved_at: new Date(), resolved_by, resolution_note })
      .where(eq(alertsTable.id, req.params.id))
      .returning();
    if (!alert) return res.status(404).json({ error: "Not found" });
    res.json(alert);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
