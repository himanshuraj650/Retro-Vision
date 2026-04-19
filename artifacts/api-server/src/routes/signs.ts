import { Router } from "express";
import { db } from "@workspace/db";
import { signsTable, measurementsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/signs", async (req, res) => {
  try {
    const { route_id, type, status, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const conditions = [];
    if (route_id) conditions.push(eq(signsTable.route_id, route_id));
    if (type) conditions.push(eq(signsTable.type, type));
    if (status) conditions.push(eq(signsTable.status, status));

    const signs = await db
      .select()
      .from(signsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(signsTable.created_at))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const total = await db.$count(signsTable, conditions.length > 0 ? and(...conditions) : undefined);

    res.json({ signs, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signs", async (req, res) => {
  try {
    const body = req.body;
    const id = randomUUID();
    const [sign] = await db.insert(signsTable).values({
      id,
      route_id: body.route_id,
      name: body.name,
      type: body.type,
      location_description: body.location_description,
      chainage: body.chainage,
      latitude: body.latitude,
      longitude: body.longitude,
      image_url: body.image_url,
      status: "unknown",
    }).returning();
    res.status(201).json(sign);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/signs/:id", async (req, res) => {
  try {
    const [sign] = await db.select().from(signsTable).where(eq(signsTable.id, req.params.id)).limit(1);
    if (!sign) return res.status(404).json({ error: "Not found" });
    res.json(sign);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/signs/:id", async (req, res) => {
  try {
    const [sign] = await db.update(signsTable)
      .set({ ...req.body })
      .where(eq(signsTable.id, req.params.id))
      .returning();
    if (!sign) return res.status(404).json({ error: "Not found" });
    res.json(sign);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/signs/:id", async (req, res) => {
  try {
    await db.delete(signsTable).where(eq(signsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/signs/:id/measurements", async (req, res) => {
  try {
    const measurements = await db.select().from(measurementsTable)
      .where(eq(measurementsTable.sign_id, req.params.id))
      .orderBy(desc(measurementsTable.created_at));
    res.json({ measurements, total: measurements.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
