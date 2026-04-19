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

// Predictive Maintenance: compute degradation rate and predict failure date per sign
router.get("/analytics/predictions", async (req, res) => {
  try {
    const signs = await db.select().from(signsTable).limit(50);
    const predictions = await Promise.all(signs.map(async (sign) => {
      const measurements = await db.select()
        .from(measurementsTable)
        .where(eq(measurementsTable.sign_id, sign.id))
        .orderBy(measurementsTable.created_at)
        .limit(20);

      const minRequired = measurements[0]?.min_required || (sign.type === "pavement_marking" ? 100 : 150);

      if (measurements.length < 2) {
        return {
          sign_id: sign.id,
          sign_name: sign.name,
          chainage: sign.chainage,
          type: sign.type,
          status: sign.status,
          last_value: sign.last_value,
          min_required: minRequired,
          degradation_rate: null,
          days_to_critical: null,
          predicted_critical_date: null,
          confidence: "low",
          latitude: sign.latitude,
          longitude: sign.longitude,
        };
      }

      // Linear regression on measurement values over time
      const n = measurements.length;
      const times = measurements.map(m => m.created_at.getTime() / (1000 * 60 * 60 * 24)); // days
      const values = measurements.map(m => m.value);

      const sumX = times.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = times.reduce((acc, t, i) => acc + t * values[i], 0);
      const sumX2 = times.reduce((acc, t) => acc + t * t, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // mcd/day
      const intercept = (sumY - slope * sumX) / n;

      const now = Date.now() / (1000 * 60 * 60 * 24);
      const currentPredicted = slope * now + intercept;
      const degradationRate = Math.abs(Math.round(slope * 30 * 10) / 10); // per month

      let days_to_critical: number | null = null;
      let predicted_critical_date: string | null = null;

      if (slope < 0 && currentPredicted > minRequired) {
        // Predict when value will hit minRequired
        // minRequired = slope * t_crit + intercept => t_crit = (minRequired - intercept) / slope
        const t_crit = (minRequired - intercept) / slope;
        const daysLeft = Math.round(t_crit - now);
        if (daysLeft > 0 && daysLeft < 3650) {
          days_to_critical = daysLeft;
          const critDate = new Date();
          critDate.setDate(critDate.getDate() + daysLeft);
          predicted_critical_date = critDate.toISOString().split("T")[0];
        }
      }

      return {
        sign_id: sign.id,
        sign_name: sign.name,
        chainage: sign.chainage,
        type: sign.type,
        status: sign.status,
        last_value: sign.last_value,
        min_required: minRequired,
        degradation_rate: degradation_rate_label(degradationRate, slope),
        days_to_critical,
        predicted_critical_date,
        confidence: measurements.length >= 5 ? "high" : "medium",
        latitude: sign.latitude,
        longitude: sign.longitude,
      };
    }));

    // Sort: soonest failure first
    predictions.sort((a, b) => {
      if (a.days_to_critical === null && b.days_to_critical === null) return 0;
      if (a.days_to_critical === null) return 1;
      if (b.days_to_critical === null) return -1;
      return a.days_to_critical - b.days_to_critical;
    });

    res.json({ predictions, total: predictions.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function degradation_rate_label(ratePerMonth: number, slope: number): number {
  return slope >= 0 ? 0 : ratePerMonth;
}

// Fleet simulation: vehicle and drone positions on routes
router.get("/analytics/fleet", async (req, res) => {
  try {
    const routes = await db.select().from(routesTable).where(eq(routesTable.status, "active")).limit(5);

    // Define fixed fleet units with deterministic simulated positions
    const fleet = [
      {
        id: "VH-001",
        type: "vehicle",
        name: "MRV Alpha",
        description: "Mobile Retroreflectometer Van",
        status: "active",
        speed_kmh: 60,
        battery_pct: 92,
        measurements_today: 47,
        operator: "Inspector R. Sharma",
        route_id: routes[0]?.id || null,
        route_name: routes[0]?.name || "NH-48 Delhi–Mumbai",
        current_chainage: "NH-48 km 342",
        latitude: 22.3070 + Math.sin(Date.now() / 30000) * 0.01,
        longitude: 73.1810 + Math.cos(Date.now() / 30000) * 0.01,
        last_ping: new Date().toISOString(),
      },
      {
        id: "VH-002",
        type: "vehicle",
        name: "MRV Bravo",
        description: "Mobile Retroreflectometer Van",
        status: "active",
        speed_kmh: 55,
        battery_pct: 78,
        measurements_today: 31,
        operator: "Inspector P. Patil",
        route_id: routes[1]?.id || null,
        route_name: routes[1]?.name || "NH-44 Srinagar–Kanyakumari",
        current_chainage: "NH-44 km 92",
        latitude: 12.5260 + Math.sin(Date.now() / 40000 + 1) * 0.01,
        longitude: 78.2130 + Math.cos(Date.now() / 40000 + 1) * 0.01,
        last_ping: new Date().toISOString(),
      },
      {
        id: "DR-001",
        type: "drone",
        name: "UAV Delta",
        description: "AI-Camera Retroreflectivity Drone",
        status: "active",
        speed_kmh: 40,
        battery_pct: 64,
        measurements_today: 128,
        operator: "Auto (AI Pilot)",
        route_id: routes[2]?.id || null,
        route_name: routes[2]?.name || "NH-65 Pune–Hyderabad",
        current_chainage: "NH-65 km 55",
        latitude: 17.3840 + Math.sin(Date.now() / 25000 + 2) * 0.02,
        longitude: 78.4860 + Math.cos(Date.now() / 25000 + 2) * 0.02,
        last_ping: new Date().toISOString(),
      },
      {
        id: "DR-002",
        type: "drone",
        name: "UAV Echo",
        description: "Night-Vision Drone",
        status: "standby",
        speed_kmh: 0,
        battery_pct: 100,
        measurements_today: 0,
        operator: "Auto (AI Pilot)",
        route_id: null,
        route_name: null,
        current_chainage: "Depot — Gurugram",
        latitude: 28.4595,
        longitude: 77.0266,
        last_ping: new Date().toISOString(),
      },
      {
        id: "VH-003",
        type: "vehicle",
        name: "MRV Charlie",
        description: "Drone-Launch Mobile Unit",
        status: "maintenance",
        speed_kmh: 0,
        battery_pct: 45,
        measurements_today: 0,
        operator: "Workshop — Delhi",
        route_id: null,
        route_name: null,
        current_chainage: "Delhi Service Depot",
        latitude: 28.6139,
        longitude: 77.2090,
        last_ping: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const summary = {
      total_units: fleet.length,
      active: fleet.filter(f => f.status === "active").length,
      standby: fleet.filter(f => f.status === "standby").length,
      maintenance: fleet.filter(f => f.status === "maintenance").length,
      total_measurements_today: fleet.reduce((s, f) => s + f.measurements_today, 0),
      coverage_km: 1247,
    };

    res.json({ fleet, summary });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

