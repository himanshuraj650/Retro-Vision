import { Router } from "express";
import { db } from "@workspace/db";
import { routesTable, signsTable, measurementsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.get("/routes", async (req, res) => {
  try {
    const routes = await db.select().from(routesTable).orderBy(routesTable.name);

    // Annotate with counts
    const routesWithCounts = await Promise.all(routes.map(async (route) => {
      const total_signs = await db.$count(signsTable, eq(signsTable.route_id, route.id));
      const compliant_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "compliant")));
      const warning_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "warning")));
      const critical_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "critical")));
      return { ...route, total_signs, compliant_count, warning_count, critical_count };
    }));

    res.json({ routes: routesWithCounts, total: routes.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/routes", async (req, res) => {
  try {
    const body = req.body;
    const id = randomUUID();
    const [route] = await db.insert(routesTable).values({
      id,
      name: body.name,
      highway_number: body.highway_number,
      start_chainage: body.start_chainage,
      end_chainage: body.end_chainage,
      length_km: body.length_km,
      lane_count: body.lane_count,
      type: body.type,
      status: "active",
    }).returning();
    res.status(201).json({ ...route, total_signs: 0, compliant_count: 0, warning_count: 0, critical_count: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/routes/:id", async (req, res) => {
  try {
    const [route] = await db.select().from(routesTable).where(eq(routesTable.id, req.params.id)).limit(1);
    if (!route) return res.status(404).json({ error: "Not found" });

    const total_signs = await db.$count(signsTable, eq(signsTable.route_id, route.id));
    const compliant_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "compliant")));
    const warning_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "warning")));
    const critical_count = await db.$count(signsTable, and(eq(signsTable.route_id, route.id), eq(signsTable.status, "critical")));

    res.json({ ...route, total_signs, compliant_count, warning_count, critical_count });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/routes/:id", async (req, res) => {
  try {
    const [route] = await db.update(routesTable)
      .set({ ...req.body })
      .where(eq(routesTable.id, req.params.id))
      .returning();
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/routes/:id", async (req, res) => {
  try {
    await db.delete(routesTable).where(eq(routesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
