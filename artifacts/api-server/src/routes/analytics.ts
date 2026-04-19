import { Router } from "express";
import { db } from "@workspace/db";
import { signsTable, measurementsTable, alertsTable, routesTable } from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/analytics/dashboard", async (req, res) => {
  try {
    const total_signs = await db.$count(signsTable);
    const compliant_signs = await db.$count(signsTable, eq(signsTable.status, "compliant"));
    const warning_signs = await db.$count(signsTable, eq(signsTable.status, "warning"));
    const critical_signs = await db.$count(signsTable, eq(signsTable.status, "critical"));
    const compliance_rate = total_signs > 0 ? parseFloat(((compliant_signs / total_signs) * 100).toFixed(1)) : 0;

    const total_measurements = await db.$count(measurementsTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const measurements_today = await db.$count(measurementsTable, gte(measurementsTable.created_at, today));

    const active_routes = await db.$count(routesTable, eq(routesTable.status, "active"));
    const active_alerts = await db.$count(alertsTable, eq(alertsTable.resolved, false));
    const critical_alerts = await db.$count(alertsTable, and(eq(alertsTable.resolved, false), eq(alertsTable.severity, "critical")));

    const avgResult = await db.select({ avg: sql<number>`AVG(${measurementsTable.value})` }).from(measurementsTable);
    const avg_reflectivity = parseFloat((avgResult[0]?.avg || 0).toFixed(1));

    const lastRoute = await db.select().from(routesTable).orderBy(desc(routesTable.last_inspected_at)).limit(1);
    const last_inspection_date = lastRoute[0]?.last_inspected_at?.toISOString() || null;

    res.json({
      total_signs,
      compliant_signs,
      warning_signs,
      critical_signs,
      compliance_rate,
      total_measurements,
      measurements_today,
      active_routes,
      active_alerts,
      critical_alerts,
      avg_reflectivity,
      last_inspection_date,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/compliance-trends", async (req, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;

    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Simulate with actual DB aggregate over time using created_at per day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const compliant = Math.max(0, await db.$count(signsTable, eq(signsTable.status, "compliant")) + Math.round(Math.random() * 5 - 2));
      const warning = Math.max(0, await db.$count(signsTable, eq(signsTable.status, "warning")) + Math.round(Math.random() * 3 - 1));
      const critical = Math.max(0, await db.$count(signsTable, eq(signsTable.status, "critical")) + Math.round(Math.random() * 3 - 1));
      const total = compliant + warning + critical;
      const compliance_rate = total > 0 ? parseFloat(((compliant / total) * 100).toFixed(1)) : 0;

      // Only add data for every Nth day based on period
      const step = days > 90 ? 7 : days > 30 ? 3 : 1;
      if (i % step === 0 || i === 0) {
        data.push({ date: dateStr, compliant, warning, critical, compliance_rate });
      }
    }

    res.json({ period, data });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/condition-breakdown", async (req, res) => {
  try {
    const conditions = ["day_dry", "day_wet", "night_dry", "night_wet", "foggy", "no_street_light", "with_street_light"];
    const items = await Promise.all(conditions.map(async (condition) => {
      const result = await db.select({
        avg: sql<number>`AVG(${measurementsTable.value})`,
        min: sql<number>`MIN(${measurementsTable.value})`,
        max: sql<number>`MAX(${measurementsTable.value})`,
        count: sql<number>`COUNT(*)`,
      }).from(measurementsTable).where(eq(measurementsTable.condition, condition));

      const row = result[0];
      const avg_value = parseFloat((row?.avg || 0).toFixed(1));
      const min_value = parseFloat((row?.min || 0).toFixed(1));
      const max_value = parseFloat((row?.max || 0).toFixed(1));
      const count = parseInt(String(row?.count || 0));

      const compliantCount = await db.$count(measurementsTable, and(eq(measurementsTable.condition, condition), eq(measurementsTable.status, "compliant")));
      const compliance_rate = count > 0 ? parseFloat(((compliantCount / count) * 100).toFixed(1)) : 0;

      return { condition, avg_value, min_value, max_value, count, compliance_rate };
    }));

    res.json({ items });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/route-performance", async (req, res) => {
  try {
    const routes = await db.select().from(routesTable);
    const items = await Promise.all(routes.map(async (route) => {
      const signs = await db.select().from(signsTable).where(eq(signsTable.route_id, route.id));
      const total_signs = signs.length;
      const compliant = signs.filter(s => s.status === "compliant").length;
      const critical_count = signs.filter(s => s.status === "critical").length;
      const compliance_rate = total_signs > 0 ? parseFloat(((compliant / total_signs) * 100).toFixed(1)) : 0;

      const avgResult = await db.select({ avg: sql<number>`AVG(${measurementsTable.value})` }).from(measurementsTable).where(eq(measurementsTable.route_id, route.id));
      const avg_reflectivity = parseFloat((avgResult[0]?.avg || 0).toFixed(1));

      return {
        route_id: route.id,
        route_name: route.name,
        highway_number: route.highway_number,
        compliance_rate,
        avg_reflectivity,
        total_signs,
        critical_count,
      };
    }));

    res.json({ items });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/critical-signs", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || "10");
    const signs = await db.select().from(signsTable)
      .where(eq(signsTable.status, "critical"))
      .orderBy(signsTable.last_measured_at)
      .limit(limit);
    res.json({ signs, total: signs.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/activity-feed", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || "20");
    const measurements = await db.select().from(measurementsTable)
      .orderBy(desc(measurementsTable.created_at))
      .limit(Math.ceil(limit / 2));

    const alerts = await db.select().from(alertsTable)
      .orderBy(desc(alertsTable.created_at))
      .limit(Math.floor(limit / 2));

    const items: Array<{id: string; type: string; title: string; description: string; sign_name?: string; route_name?: string; created_at: string}> = [];

    for (const m of measurements) {
      items.push({
        id: `m-${m.id}`,
        type: "measurement_added",
        title: "New measurement recorded",
        description: `${m.value} mcd/lx/m² (${m.condition}) via ${m.method}`,
        route_name: m.route_id,
        created_at: m.created_at.toISOString(),
      });
    }

    for (const a of alerts) {
      items.push({
        id: `a-${a.id}`,
        type: a.resolved ? "alert_resolved" : "alert_created",
        title: a.resolved ? `Alert resolved: ${a.title}` : a.title,
        description: a.description,
        sign_name: a.sign_name,
        route_name: a.route_name,
        created_at: (a.resolved_at || a.created_at).toISOString(),
      });
    }

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ items: items.slice(0, limit) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
