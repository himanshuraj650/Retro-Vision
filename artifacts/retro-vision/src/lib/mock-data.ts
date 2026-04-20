/**
 * Mock Data Layer — NHAI RetroVision
 * Provides realistic retroreflectivity data for all API endpoints
 * so the app works fully standalone without a backend.
 */

// ─── Helper: Date generators ──────────────────────────────────────────────
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
let _idCounter = 100;
const id = () => String(++_idCounter);

// ─── Routes (Real NHAI corridors) ──────────────────────────────────────────
const ROUTES = [
  { id: "r1", name: "Delhi-Jaipur Expressway", highway_number: "NH-48", length_km: 232, lane_count: 6, start_chainage: "Km 0+000", end_chainage: "Km 232+000", status: "active", type: "expressway", last_inspected_at: daysAgo(3), total_signs: 18, compliant_count: 12, warning_count: 4, critical_count: 2 },
  { id: "r2", name: "Mumbai-Pune Expressway", highway_number: "NH-48E", length_km: 94, lane_count: 6, start_chainage: "Km 0+000", end_chainage: "Km 94+500", status: "active", type: "expressway", last_inspected_at: daysAgo(1), total_signs: 14, compliant_count: 10, warning_count: 3, critical_count: 1 },
  { id: "r3", name: "Delhi-Agra (Yamuna Expressway)", highway_number: "NH-44", length_km: 165, lane_count: 6, start_chainage: "Km 0+000", end_chainage: "Km 165+000", status: "active", type: "expressway", last_inspected_at: daysAgo(5), total_signs: 16, compliant_count: 11, warning_count: 3, critical_count: 2 },
  { id: "r4", name: "Delhi-Meerut Expressway", highway_number: "NH-34", length_km: 96, lane_count: 8, start_chainage: "Km 0+000", end_chainage: "Km 96+000", status: "under_inspection", type: "expressway", last_inspected_at: daysAgo(0), total_signs: 12, compliant_count: 9, warning_count: 2, critical_count: 1 },
  { id: "r5", name: "Lucknow-Agra Expressway", highway_number: "NH-330A", length_km: 302, lane_count: 6, start_chainage: "Km 0+000", end_chainage: "Km 302+000", status: "active", type: "expressway", last_inspected_at: daysAgo(7), total_signs: 20, compliant_count: 14, warning_count: 4, critical_count: 2 },
];

// ─── Signs / Assets (Real GPS coordinates on Indian highways) ──────────────
const SIGNS = [
  // NH-48 Delhi-Jaipur
  { id: "s1", name: "NH-48 Gantry — Manesar Toll", type: "gantry", route_id: "r1", chainage: "Km 31+200", latitude: 28.3498, longitude: 76.9347, status: "compliant", last_value: 287, last_measured_at: daysAgo(2), location_description: "Overhead gantry at Manesar Toll Plaza" },
  { id: "s2", name: "Speed Limit 100 — Dharuhera", type: "traffic_sign", route_id: "r1", chainage: "Km 56+800", latitude: 28.2077, longitude: 76.7969, status: "compliant", last_value: 195, last_measured_at: daysAgo(3), location_description: "RHS speed limit sign near Dharuhera bypass" },
  { id: "s3", name: "Lane Marking — Behror Stretch", type: "pavement_marking", route_id: "r1", chainage: "Km 98+400", latitude: 27.8892, longitude: 76.2890, status: "warning", last_value: 112, last_measured_at: daysAgo(1), location_description: "Centre lane marking on 6-lane section" },
  { id: "s4", name: "Road Stud — Shahpura", type: "road_stud", route_id: "r1", chainage: "Km 145+000", latitude: 27.3955, longitude: 75.9607, status: "critical", last_value: 78, last_measured_at: daysAgo(4), location_description: "Reflective road studs on median divider" },
  { id: "s5", name: "Delineator Post — Neemrana", type: "delineator", route_id: "r1", chainage: "Km 122+300", latitude: 27.9892, longitude: 76.3845, status: "compliant", last_value: 220, last_measured_at: daysAgo(2), location_description: "LHS delineator at curve section" },
  { id: "s6", name: "Warning Sign — Jaipur Entry", type: "traffic_sign", route_id: "r1", chainage: "Km 228+600", latitude: 26.9253, longitude: 75.7974, status: "warning", last_value: 138, last_measured_at: daysAgo(5), location_description: "Merge warning sign before Jaipur Ring Road" },
  // Mumbai-Pune Expressway
  { id: "s7", name: "Gantry — Lonavala Tunnel Entry", type: "gantry", route_id: "r2", chainage: "Km 42+100", latitude: 18.7546, longitude: 73.4062, status: "compliant", last_value: 312, last_measured_at: daysAgo(1), location_description: "Tunnel approach gantry with overhead illumination" },
  { id: "s8", name: "Lane Marking — Khopoli Ghat", type: "pavement_marking", route_id: "r2", chainage: "Km 58+500", latitude: 18.7856, longitude: 73.3427, status: "critical", last_value: 64, last_measured_at: daysAgo(2), location_description: "Worn pavement marking on steep gradient section" },
  { id: "s9", name: "Shoulder Sign — Khandala", type: "shoulder_mounted", route_id: "r2", chainage: "Km 49+200", latitude: 18.7544, longitude: 73.3714, status: "compliant", last_value: 248, last_measured_at: daysAgo(1), location_description: "Shoulder-mounted exit sign for Khandala" },
  { id: "s10", name: "Road Stud — Bhor Ghat", type: "road_stud", route_id: "r2", chainage: "Km 65+800", latitude: 18.8144, longitude: 73.2860, status: "warning", last_value: 125, last_measured_at: daysAgo(3), location_description: "Median road studs on descending grade" },
  // Yamuna Expressway
  { id: "s11", name: "Gantry — Greater Noida Entry", type: "gantry", route_id: "r3", chainage: "Km 4+500", latitude: 28.4744, longitude: 77.5040, status: "compliant", last_value: 340, last_measured_at: daysAgo(2), location_description: "Entry gantry with VMS display" },
  { id: "s12", name: "Speed Limit — Jewar Section", type: "traffic_sign", route_id: "r3", chainage: "Km 55+200", latitude: 28.1259, longitude: 77.5490, status: "compliant", last_value: 178, last_measured_at: daysAgo(6), location_description: "120 km/h speed limit sign — Jewar airport zone" },
  { id: "s13", name: "Lane Marking — Mathura Stretch", type: "pavement_marking", route_id: "r3", chainage: "Km 130+700", latitude: 27.4925, longitude: 77.6735, status: "warning", last_value: 104, last_measured_at: daysAgo(3), location_description: "Edge marking on 6-lane section near Mathura" },
  { id: "s14", name: "Delineator — Agra Exit Ramp", type: "delineator", route_id: "r3", chainage: "Km 162+000", latitude: 27.2076, longitude: 78.0069, status: "critical", last_value: 85, last_measured_at: daysAgo(8), location_description: "Exit delineator posts at Agra off-ramp" },
  // Delhi-Meerut Expressway
  { id: "s15", name: "Gantry — Sarai Kale Khan", type: "gantry", route_id: "r4", chainage: "Km 2+000", latitude: 28.5918, longitude: 77.2507, status: "compliant", last_value: 305, last_measured_at: daysAgo(0), location_description: "Elevated gantry at Delhi-entry of DME" },
  { id: "s16", name: "Road Stud — Dasna", type: "road_stud", route_id: "r4", chainage: "Km 30+500", latitude: 28.6710, longitude: 77.5470, status: "compliant", last_value: 188, last_measured_at: daysAgo(1), location_description: "Road studs on 8-lane section near Dasna" },
  { id: "s17", name: "Lane Marking — Meerut Approach", type: "pavement_marking", route_id: "r4", chainage: "Km 85+200", latitude: 28.9845, longitude: 77.7064, status: "warning", last_value: 95, last_measured_at: daysAgo(2), location_description: "Worn centre marking near Meerut toll" },
  // Lucknow-Agra Expressway
  { id: "s18", name: "Gantry — Firozabad Entry", type: "gantry", route_id: "r5", chainage: "Km 35+000", latitude: 27.1540, longitude: 78.3952, status: "compliant", last_value: 275, last_measured_at: daysAgo(4), location_description: "Overhead gantry sign near Firozabad" },
  { id: "s19", name: "Delineator — Etawah", type: "delineator", route_id: "r5", chainage: "Km 120+600", latitude: 26.7764, longitude: 79.0233, status: "compliant", last_value: 210, last_measured_at: daysAgo(5), location_description: "Curve delineator posts at Etawah bypass" },
  { id: "s20", name: "Speed Limit 120 — Unnao Section", type: "traffic_sign", route_id: "r5", chainage: "Km 240+800", latitude: 26.5393, longitude: 80.4889, status: "critical", last_value: 72, last_measured_at: daysAgo(10), location_description: "Speed limit sign faded due to sun exposure" },
];

// ─── Measurements ─────────────────────────────────────────────────────────
const CONDITIONS = ["day_dry", "day_wet", "night_dry", "night_wet", "foggy", "no_street_light", "with_street_light"];
const METHODS = ["vehicle_mounted", "drone_ai", "hybrid_fusion", "handheld"];
const INSPECTORS = ["Insp. R. Sharma", "Insp. A. Verma", "MRV Alpha Auto", "MRV Bravo Auto", "UAV Delta AI", "Insp. P. Patel", "UAV Echo AI"];

function genMeasurements() {
  const out: any[] = [];
  SIGNS.forEach(sign => {
    const count = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const value = sign.last_value + Math.round((Math.random() - 0.5) * 40);
      const threshold = sign.type === "pavement_marking" ? 100 : 150;
      const st = value >= threshold * 1.2 ? "compliant" : value >= threshold ? "warning" : "critical";
      out.push({
        id: id(),
        sign_id: sign.id,
        sign_name: sign.name,
        value,
        irc_standard: sign.type === "pavement_marking" ? "IRC 35" : "IRC 67",
        condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
        method: METHODS[Math.floor(Math.random() * METHODS.length)],
        status: st,
        recorded_by: INSPECTORS[Math.floor(Math.random() * INSPECTORS.length)],
        created_at: daysAgo(Math.floor(Math.random() * 30)),
        notes: null,
      });
    }
  });
  return out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

const MEASUREMENTS = genMeasurements();

// ─── Alerts ───────────────────────────────────────────────────────────────
const ALERTS = [
  { id: "a1", title: "Critical — Road Stud Shahpura below IRC 67", description: "Road stud at Km 145+000 on NH-48 reads 78 mcd/lx/m², which is 48% below the IRC 67 minimum of 150 mcd/lx/m². Immediate replacement recommended.", severity: "critical", sign_id: "s4", sign_name: "Road Stud — Shahpura", route_name: "Delhi-Jaipur Expressway", current_value: 78, required_value: 150, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(2) },
  { id: "a2", title: "Critical — Pavement Marking Khopoli Ghat eroded", description: "Centre lane marking at Km 58+500 on Mumbai-Pune Expressway measured 64 mcd/lx/m², 36% below IRC 35 threshold. Heavy truck traffic and rain erosion noted.", severity: "critical", sign_id: "s8", sign_name: "Lane Marking — Khopoli Ghat", route_name: "Mumbai-Pune Expressway", current_value: 64, required_value: 100, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(1) },
  { id: "a3", title: "Critical — Speed Limit Sign Unnao faded", description: "Speed limit 120 sign at Km 240+800 on Lucknow-Agra Expressway reads 72 mcd/lx/m². UV degradation and industrial pollution identified as cause.", severity: "critical", sign_id: "s20", sign_name: "Speed Limit 120 — Unnao Section", route_name: "Lucknow-Agra Expressway", current_value: 72, required_value: 150, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(5) },
  { id: "a4", title: "Warning — Lane Marking Behror approaching threshold", description: "Centre lane marking at Km 98+400 reads 112 mcd/lx/m², only 12% above IRC 35 threshold. Degradation trend suggests failure within 45 days.", severity: "warning", sign_id: "s3", sign_name: "Lane Marking — Behror Stretch", route_name: "Delhi-Jaipur Expressway", current_value: 112, required_value: 100, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(3) },
  { id: "a5", title: "Warning — Delineator Agra Exit Ramp below minimum", description: "Delineator posts at Km 162+000 read 85 mcd/lx/m². Corrosion from exhaust fumes identified. Scheduled for maintenance.", severity: "warning", sign_id: "s14", sign_name: "Delineator — Agra Exit Ramp", route_name: "Delhi-Agra (Yamuna Expressway)", current_value: 85, required_value: 150, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(4) },
  { id: "a6", title: "Warning — Meerut Lane Marking degradation", description: "Centre marking at Km 85+200 on Delhi-Meerut Expressway measured 95 mcd/lx/m², below IRC 35 threshold. Tire erosion on 8-lane section.", severity: "warning", sign_id: "s17", sign_name: "Lane Marking — Meerut Approach", route_name: "Delhi-Meerut Expressway", current_value: 95, required_value: 100, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(1) },
  { id: "a7", title: "Resolved — Gantry Manesar reflective sheeting replaced", description: "Previous warning resolved. New high-intensity prismatic sheeting installed on overhead gantry at Km 31+200.", severity: "warning", sign_id: "s1", sign_name: "NH-48 Gantry — Manesar Toll", route_name: "Delhi-Jaipur Expressway", current_value: 287, required_value: 150, resolved: true, resolved_by: "NHAI PIU Delhi-Jaipur", resolution_note: "Replaced with HIP sheeting (3M 4090). Post-installation reading: 287 mcd/lx/m².", created_at: daysAgo(14) },
  { id: "a8", title: "Warning — Road Stud Bhor Ghat reflection loss", description: "Median road studs at Km 65+800 show 125 mcd/lx/m². Wet weather impact reducing visibility. IRC 67 threshold at 150 mcd/lx/m².", severity: "warning", sign_id: "s10", sign_name: "Road Stud — Bhor Ghat", route_name: "Mumbai-Pune Expressway", current_value: 125, required_value: 150, resolved: false, resolved_by: null, resolution_note: null, created_at: daysAgo(2) },
];

// ─── Fleet ────────────────────────────────────────────────────────────────
const FLEET = [
  { id: "MRV-A1", name: "MRV Alpha", type: "vehicle", description: "Mobile Retroreflectometer Van — Delhi-Jaipur Corridor", status: "active", latitude: 27.9892, longitude: 76.3845, current_chainage: "Km 118+400, NH-48", route_name: "Delhi-Jaipur Expressway", speed_kmh: 62, battery_pct: 84, measurements_today: 147, operator: "D. Singh", last_ping: hoursAgo(0.02) },
  { id: "MRV-B2", name: "MRV Bravo", type: "vehicle", description: "Mobile Retroreflectometer Van — Mumbai-Pune Corridor", status: "active", latitude: 18.7856, longitude: 73.3427, current_chainage: "Km 56+200, NH-48E", route_name: "Mumbai-Pune Expressway", speed_kmh: 45, battery_pct: 71, measurements_today: 98, operator: "R. Patil", last_ping: hoursAgo(0.05) },
  { id: "MRV-C3", name: "MRV Charlie", type: "vehicle", description: "Mobile Retroreflectometer Van — Yamuna Expressway", status: "standby", latitude: 28.1259, longitude: 77.5490, current_chainage: "Km 55+200, NH-44", route_name: "Delhi-Agra (Yamuna Expressway)", speed_kmh: 0, battery_pct: 100, measurements_today: 0, operator: "A. Kumar", last_ping: hoursAgo(1) },
  { id: "UAV-D4", name: "UAV Delta", type: "drone", description: "AI-Equipped Drone Unit — High-speed zone imaging", status: "active", latitude: 28.6710, longitude: 77.5470, current_chainage: "Km 32+000, NH-34", route_name: "Delhi-Meerut Expressway", speed_kmh: 35, battery_pct: 56, measurements_today: 72, operator: "P. Verma", last_ping: hoursAgo(0.03) },
  { id: "UAV-E5", name: "UAV Echo", type: "drone", description: "AI-Equipped Drone Unit — Pavement marking scanner", status: "maintenance", latitude: 26.5393, longitude: 80.4889, current_chainage: "Base — Lucknow Depot", route_name: "Lucknow-Agra Expressway", speed_kmh: 0, battery_pct: 12, measurements_today: 0, operator: "S. Gupta", last_ping: hoursAgo(4) },
];

// ─── Predictions ──────────────────────────────────────────────────────────
const PREDICTIONS = [
  { sign_id: "s4", sign_name: "Road Stud — Shahpura", chainage: "Km 145+000", type: "road_stud", last_value: 78, min_required: 150, degradation_rate: 4.2, predicted_critical_date: daysAgo(-5), days_to_critical: 0, confidence: "high" },
  { sign_id: "s8", sign_name: "Lane Marking — Khopoli Ghat", chainage: "Km 58+500", type: "pavement_marking", last_value: 64, min_required: 100, degradation_rate: 6.1, predicted_critical_date: daysAgo(-3), days_to_critical: 0, confidence: "high" },
  { sign_id: "s20", sign_name: "Speed Limit 120 — Unnao Section", chainage: "Km 240+800", type: "traffic_sign", last_value: 72, min_required: 150, degradation_rate: 3.8, predicted_critical_date: daysAgo(-8), days_to_critical: 0, confidence: "high" },
  { sign_id: "s17", sign_name: "Lane Marking — Meerut Approach", chainage: "Km 85+200", type: "pavement_marking", last_value: 95, min_required: 100, degradation_rate: 2.5, predicted_critical_date: daysFromNow(18), days_to_critical: 18, confidence: "high" },
  { sign_id: "s14", sign_name: "Delineator — Agra Exit Ramp", chainage: "Km 162+000", type: "delineator", last_value: 85, min_required: 150, degradation_rate: 3.1, predicted_critical_date: daysFromNow(22), days_to_critical: 22, confidence: "medium" },
  { sign_id: "s3", sign_name: "Lane Marking — Behror Stretch", chainage: "Km 98+400", type: "pavement_marking", last_value: 112, min_required: 100, degradation_rate: 1.8, predicted_critical_date: daysFromNow(45), days_to_critical: 45, confidence: "high" },
  { sign_id: "s10", sign_name: "Road Stud — Bhor Ghat", chainage: "Km 65+800", type: "road_stud", last_value: 125, min_required: 150, degradation_rate: 1.5, predicted_critical_date: daysFromNow(60), days_to_critical: 60, confidence: "medium" },
  { sign_id: "s6", sign_name: "Warning Sign — Jaipur Entry", chainage: "Km 228+600", type: "traffic_sign", last_value: 138, min_required: 150, degradation_rate: 0.9, predicted_critical_date: daysFromNow(120), days_to_critical: 120, confidence: "medium" },
  { sign_id: "s13", sign_name: "Lane Marking — Mathura Stretch", chainage: "Km 130+700", type: "pavement_marking", last_value: 104, min_required: 100, degradation_rate: 0.6, predicted_critical_date: daysFromNow(180), days_to_critical: 180, confidence: "low" },
  { sign_id: "s1", sign_name: "NH-48 Gantry — Manesar Toll", chainage: "Km 31+200", type: "gantry", last_value: 287, min_required: 150, degradation_rate: 0.3, predicted_critical_date: daysFromNow(450), days_to_critical: 450, confidence: "high" },
  { sign_id: "s7", sign_name: "Gantry — Lonavala Tunnel Entry", chainage: "Km 42+100", type: "gantry", last_value: 312, min_required: 150, degradation_rate: 0.2, predicted_critical_date: null, days_to_critical: null, confidence: "high" },
  { sign_id: "s11", sign_name: "Gantry — Greater Noida Entry", chainage: "Km 4+500", type: "gantry", last_value: 340, min_required: 150, degradation_rate: 0, predicted_critical_date: null, days_to_critical: null, confidence: "high" },
];

// ─── Reports ──────────────────────────────────────────────────────────────
const REPORTS = [
  { id: "rp1", title: "Q1 2026 — NH-48 Full Corridor Inspection", type: "inspection", status: "ready", route_id: "r1", route_name: "Delhi-Jaipur Expressway", period_start: "2026-01-01", period_end: "2026-03-31", generated_by: "NHAI PIU Delhi-Jaipur", total_signs: 18, total_measurements: 92, compliance_rate: 67, critical_findings: 2, created_at: daysAgo(15) },
  { id: "rp2", title: "Mumbai-Pune Expressway — Ghat Section Safety Audit", type: "compliance", status: "ready", route_id: "r2", route_name: "Mumbai-Pune Expressway", period_start: "2026-02-01", period_end: "2026-03-15", generated_by: "NHAI PIU Pune", total_signs: 14, total_measurements: 68, compliance_rate: 71, critical_findings: 1, created_at: daysAgo(10) },
  { id: "rp3", title: "Monthly Pavement Marking Report — All Corridors", type: "maintenance", status: "ready", route_id: null, route_name: null, period_start: "2026-03-01", period_end: "2026-03-31", generated_by: "Central Monitoring Cell", total_signs: 80, total_measurements: 340, compliance_rate: 74, critical_findings: 5, created_at: daysAgo(5) },
  { id: "rp4", title: "Delhi-Meerut 8-Lane Safety Assessment", type: "inspection", status: "ready", route_id: "r4", route_name: "Delhi-Meerut Expressway", period_start: "2026-04-01", period_end: "2026-04-15", generated_by: "NHAI PIU Delhi", total_signs: 12, total_measurements: 45, compliance_rate: 75, critical_findings: 1, created_at: daysAgo(2) },
];

// ─── Dashboard Analytics ──────────────────────────────────────────────────
const totalSigns = SIGNS.length;
const compliantSigns = SIGNS.filter(s => s.status === "compliant").length;
const criticalSigns = SIGNS.filter(s => s.status === "critical").length;
const avgReflectivity = Math.round(SIGNS.reduce((s, sign) => s + sign.last_value, 0) / totalSigns);
const complianceRate = Math.round((compliantSigns / totalSigns) * 100);

const DASHBOARD_STATS = {
  total_signs: totalSigns,
  compliance_rate: complianceRate,
  critical_signs: criticalSigns,
  avg_reflectivity: avgReflectivity,
  measurements_today: 317,
  active_routes: ROUTES.filter(r => r.status === "active").length,
  active_alerts: ALERTS.filter(a => !a.resolved).length,
  critical_alerts: ALERTS.filter(a => !a.resolved && a.severity === "critical").length,
};

// ─── 30-day compliance trend ──────────────────────────────────────────────
function genTrend() {
  const data: any[] = [];
  for (let i = 29; i >= 0; i--) {
    const base = 68 + Math.sin(i * 0.3) * 5 + (29 - i) * 0.15;
    data.push({ date: daysAgo(i).split("T")[0], compliance_rate: Math.round(Math.max(55, Math.min(85, base + (Math.random() - 0.5) * 4))) });
  }
  return data;
}
const COMPLIANCE_TREND = genTrend();

// ─── Condition breakdown ──────────────────────────────────────────────────
const CONDITION_BREAKDOWN = [
  { condition: "day_dry", avg_value: 198, count: 82 },
  { condition: "day_wet", avg_value: 162, count: 45 },
  { condition: "night_dry", avg_value: 175, count: 64 },
  { condition: "night_wet", avg_value: 138, count: 38 },
  { condition: "foggy", avg_value: 121, count: 22 },
  { condition: "with_street_light", avg_value: 185, count: 51 },
  { condition: "no_street_light", avg_value: 145, count: 36 },
];

// ─── Activity feed ────────────────────────────────────────────────────────
const ACTIVITY_FEED = [
  { id: "act1", type: "measurement_added", title: "New reading: 287 mcd/lx/m²", description: "NH-48 Gantry — Manesar Toll · Vehicle-mounted · Night dry", created_at: hoursAgo(0.5) },
  { id: "act2", type: "alert_created", title: "Critical alert: Lane Marking Khopoli Ghat", description: "64 mcd/lx/m² — 36% below IRC 35 threshold", created_at: hoursAgo(1.2) },
  { id: "act3", type: "measurement_added", title: "New reading: 188 mcd/lx/m²", description: "Road Stud — Dasna · Drone AI · Day dry", created_at: hoursAgo(2) },
  { id: "act4", type: "measurement_added", title: "Batch: 14 readings ingested", description: "MRV Alpha — NH-48 Neemrana to Behror stretch", created_at: hoursAgo(3.5) },
  { id: "act5", type: "alert_resolved", title: "Resolved: Gantry Manesar sheeting replaced", description: "Post-installation reading: 287 mcd/lx/m² — now compliant", created_at: hoursAgo(8) },
  { id: "act6", type: "measurement_added", title: "New reading: 305 mcd/lx/m²", description: "Gantry — Sarai Kale Khan · Vehicle-mounted · Day dry", created_at: hoursAgo(12) },
  { id: "act7", type: "alert_created", title: "Warning: Meerut Lane Marking degrading", description: "95 mcd/lx/m² — below IRC 35 minimum of 100 mcd/lx/m²", created_at: hoursAgo(18) },
  { id: "act8", type: "measurement_added", title: "New reading: 72 mcd/lx/m²", description: "Speed Limit 120 — Unnao Section · Handheld · Night dry", created_at: hoursAgo(24) },
];

// ─── Route performance ────────────────────────────────────────────────────
const ROUTE_PERFORMANCE = ROUTES.map(r => ({
  route_id: r.id,
  route_name: r.name,
  highway_number: r.highway_number,
  total_signs: r.total_signs,
  compliance_rate: Math.round((r.compliant_count / r.total_signs) * 100),
  avg_reflectivity: Math.round(180 + Math.random() * 40),
  critical_count: r.critical_count,
}));

// ─── Critical signs for dashboard ─────────────────────────────────────────
const CRITICAL_SIGNS = SIGNS.filter(s => s.status === "critical");


// ═══════════════════════════════════════════════════════════════════════════
// FETCH INTERCEPTOR — Intercepts all /api/* calls and returns mock data
// ═══════════════════════════════════════════════════════════════════════════

const _originalFetch = window.fetch;

function matchRoute(url: string, pattern: string): boolean {
  return url.includes(pattern);
}

function mockResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // Only intercept /api/ calls
  if (!url.includes("/api/")) {
    return _originalFetch(input, init);
  }

  // Simulate network latency
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

  // ─── Dashboard stats ──────────────────────────────
  if (matchRoute(url, "/api/analytics/dashboard")) {
    return mockResponse(DASHBOARD_STATS);
  }

  // ─── Compliance trends ────────────────────────────
  if (matchRoute(url, "/api/analytics/compliance-trends")) {
    return mockResponse({ data: COMPLIANCE_TREND });
  }

  // ─── Condition breakdown ──────────────────────────
  if (matchRoute(url, "/api/analytics/condition-breakdown")) {
    return mockResponse({ items: CONDITION_BREAKDOWN });
  }

  // ─── Activity feed ────────────────────────────────
  if (matchRoute(url, "/api/analytics/activity")) {
    return mockResponse({ items: ACTIVITY_FEED });
  }

  // ─── Route performance ────────────────────────────
  if (matchRoute(url, "/api/analytics/route-performance")) {
    return mockResponse({ items: ROUTE_PERFORMANCE });
  }

  // ─── Critical signs ───────────────────────────────
  if (matchRoute(url, "/api/analytics/critical-signs")) {
    return mockResponse({ signs: CRITICAL_SIGNS });
  }

  // ─── Fleet ────────────────────────────────────────
  if (matchRoute(url, "/api/analytics/fleet")) {
    const active = FLEET.filter(f => f.status === "active").length;
    const standby = FLEET.filter(f => f.status === "standby").length;
    const maintenance = FLEET.filter(f => f.status === "maintenance").length;
    return mockResponse({
      fleet: FLEET,
      summary: {
        total_units: FLEET.length,
        active,
        standby,
        maintenance,
        total_measurements_today: FLEET.reduce((s, f) => s + f.measurements_today, 0),
        coverage_km: 1247,
      },
    });
  }

  // ─── Predictions ──────────────────────────────────
  if (matchRoute(url, "/api/analytics/predictions")) {
    return mockResponse({ predictions: PREDICTIONS });
  }

  // ─── Signs / Assets ───────────────────────────────
  if (matchRoute(url, "/api/signs") && !matchRoute(url, "/api/signs/")) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "POST") {
      return mockResponse({ ...JSON.parse(init?.body as string || "{}"), id: id(), status: "unknown" }, 201);
    }
    return mockResponse({ signs: SIGNS, total: SIGNS.length });
  }

  // Single sign
  const signMatch = url.match(/\/api\/signs\/([^/?]+)/);
  if (signMatch) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "DELETE") return mockResponse({ success: true });
    const sign = SIGNS.find(s => s.id === signMatch[1]);
    if (sign) return mockResponse(sign);
    return mockResponse({ error: "Not found" }, 404);
  }

  // ─── Measurements ─────────────────────────────────
  if (matchRoute(url, "/api/measurements") && !matchRoute(url, "/api/measurements/")) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "POST") {
      return mockResponse({ ...JSON.parse(init?.body as string || "{}"), id: id(), status: "compliant" }, 201);
    }
    return mockResponse({ measurements: MEASUREMENTS.slice(0, 50), total: MEASUREMENTS.length });
  }

  // Single measurement delete
  if (url.match(/\/api\/measurements\/[^/?]+/)) {
    return mockResponse({ success: true });
  }

  // ─── Routes ───────────────────────────────────────
  if (matchRoute(url, "/api/routes") && !matchRoute(url, "/api/routes/")) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "POST") {
      return mockResponse({ ...JSON.parse(init?.body as string || "{}"), id: id() }, 201);
    }
    return mockResponse({ routes: ROUTES, total: ROUTES.length });
  }

  // Single route delete
  if (url.match(/\/api\/routes\/[^/?]+/)) {
    return mockResponse({ success: true });
  }

  // ─── Alerts ───────────────────────────────────────
  if (matchRoute(url, "/api/alerts")) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "PATCH" || method === "PUT") {
      return mockResponse({ success: true });
    }
    return mockResponse({ alerts: ALERTS, total: ALERTS.length });
  }

  // ─── Reports ──────────────────────────────────────
  if (matchRoute(url, "/api/reports") && !url.includes("/download")) {
    const method = init?.method?.toUpperCase() ?? "GET";
    if (method === "POST") {
      return mockResponse({ ...JSON.parse(init?.body as string || "{}"), id: id(), status: "ready", created_at: new Date().toISOString(), total_signs: 20, total_measurements: 95, compliance_rate: 72, critical_findings: 3 }, 201);
    }
    if (method === "DELETE") return mockResponse({ success: true });
    return mockResponse({ reports: REPORTS, total: REPORTS.length });
  }

  // Report download
  if (matchRoute(url, "/download")) {
    const csvContent = "Asset Name,Type,Chainage,Last Value (mcd),Status,IRC Standard\n" +
      SIGNS.map(s => `"${s.name}","${s.type}","${s.chainage}",${s.last_value},"${s.status}","${s.type === 'pavement_marking' ? 'IRC 35' : 'IRC 67'}"`).join("\n");
    return new Response(csvContent, {
      status: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=report.csv" },
    });
  }

  // ─── Analyze (AI Image) ───────────────────────────
  if (matchRoute(url, "/api/analyze")) {
    const body = JSON.parse(init?.body as string || "{}");
    const estimatedValue = 95 + Math.round(Math.random() * 180);
    const threshold = body.sign_type === "pavement_marking" ? 100 : 150;
    const status = estimatedValue >= threshold * 1.2 ? "compliant" : estimatedValue >= threshold ? "warning" : "critical";
    return mockResponse({
      estimated_value: estimatedValue,
      confidence: 72 + Math.round(Math.random() * 20),
      status,
      irc_standard: body.sign_type === "pavement_marking" ? "IRC 35" : "IRC 67",
      analysis_summary: `AI analysis of the submitted ${body.sign_type?.replace(/_/g, " ")} image under ${body.condition?.replace(/_/g, " ")} conditions estimates a retroreflectivity of ${estimatedValue} mcd/lx/m². ${status === "critical" ? "The asset is below minimum IRC threshold and requires immediate attention." : status === "warning" ? "The asset is approaching the minimum threshold — schedule maintenance within 30 days." : "The asset is within compliant range."}`,
      detected_issues: status === "critical" ? ["Surface degradation detected", "Reflective sheeting delamination observed", "Dirt/grime accumulation reducing reflectivity"] : status === "warning" ? ["Minor surface wear detected", "Slight color fading observed"] : [],
      recommendations: status === "critical" ? ["Immediate sheeting replacement recommended", "Clean and inspect mounting hardware", "Schedule re-measurement within 7 days post-repair"] : status === "warning" ? ["Schedule cleaning within 14 days", "Re-measure after next rainfall", "Monitor degradation trend monthly"] : ["Continue routine monitoring", "Next scheduled inspection in 90 days"],
    });
  }

  // ─── Health ───────────────────────────────────────
  if (matchRoute(url, "/api/health")) {
    return mockResponse({ status: "ok", uptime: 864000 });
  }

  // Fallback
  console.warn("[MockData] Unhandled API route:", url);
  return mockResponse({ error: "Not found" }, 404);
};

export {};
