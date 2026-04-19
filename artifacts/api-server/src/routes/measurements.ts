import { Router } from "express";
import { db } from "@workspace/db";
import { measurementsTable, signsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

function computeStatus(value: number, minRequired: number): string {
  if (value >= minRequired) return "compliant";
  if (value >= minRequired * 0.6) return "warning";
  return "critical";
}

router.get("/measurements", async (req, res) => {
  try {
    const { route_id, sign_id, condition, status, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const conditions = [];
    if (route_id) conditions.push(eq(measurementsTable.route_id, route_id));
    if (sign_id) conditions.push(eq(measurementsTable.sign_id, sign_id));
    if (condition) conditions.push(eq(measurementsTable.condition, condition));
    if (status) conditions.push(eq(measurementsTable.status, status));

    const measurements = await db
      .select()
      .from(measurementsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(measurementsTable.created_at))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const total = await db.$count(measurementsTable, conditions.length > 0 ? and(...conditions) : undefined);

    res.json({ measurements, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/measurements", async (req, res) => {
  try {
    const body = req.body;
    const status = computeStatus(body.value, body.min_required);
    const id = randomUUID();

    const [measurement] = await db.insert(measurementsTable).values({
      id,
      sign_id: body.sign_id,
      route_id: body.route_id,
      value: body.value,
      condition: body.condition,
      method: body.method,
      status,
      irc_standard: body.irc_standard,
      min_required: body.min_required,
      latitude: body.latitude,
      longitude: body.longitude,
      image_url: body.image_url,
      notes: body.notes,
      recorded_by: body.recorded_by,
    }).returning();

    // Update sign's last measurement
    await db.update(signsTable)
      .set({ last_measured_at: new Date(), last_value: body.value, status })
      .where(eq(signsTable.id, body.sign_id));

    // Create alert if needed
    if (status === "critical" || status === "warning") {
      const { alertsTable, routesTable } = await import("@workspace/db");
      const sign = await db.select().from(signsTable).where(eq(signsTable.id, body.sign_id)).limit(1);
      const route = await db.select().from(routesTable).where(eq(routesTable.id, body.route_id)).limit(1);
      if (sign[0] && route[0]) {
        await db.insert(alertsTable).values({
          id: randomUUID(),
          sign_id: body.sign_id,
          route_id: body.route_id,
          sign_name: sign[0].name,
          route_name: route[0].name,
          severity: status === "critical" ? "critical" : "warning",
          title: `${status === "critical" ? "Critical" : "Low"} retroreflectivity on ${sign[0].name}`,
          description: `Measured ${body.value} mcd/lx/m² (required: ${body.min_required} mcd/lx/m²) under ${body.condition} conditions`,
          current_value: body.value,
          required_value: body.min_required,
          resolved: false,
        });
      }
    }

    res.status(201).json(measurement);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/measurements/:id", async (req, res) => {
  try {
    const [measurement] = await db.select().from(measurementsTable).where(eq(measurementsTable.id, req.params.id)).limit(1);
    if (!measurement) return res.status(404).json({ error: "Not found" });
    res.json(measurement);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/measurements/:id", async (req, res) => {
  try {
    const [measurement] = await db.update(measurementsTable)
      .set({ ...req.body })
      .where(eq(measurementsTable.id, req.params.id))
      .returning();
    if (!measurement) return res.status(404).json({ error: "Not found" });
    res.json(measurement);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/measurements/:id", async (req, res) => {
  try {
    await db.delete(measurementsTable).where(eq(measurementsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
