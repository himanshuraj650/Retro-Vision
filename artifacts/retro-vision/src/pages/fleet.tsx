import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Truck, Plane, Battery, Activity, MapPin, RefreshCw, Zap } from "lucide-react";
import { format } from "date-fns";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useFleet() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/analytics/fleet`);
      return r.json();
    },
    refetchInterval: 8000,
  });
}

function statusBadge(status: string) {
  if (status === "active") return <Badge className="bg-green-600 text-white border-0 gap-1"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />Active</Badge>;
  if (status === "standby") return <Badge className="bg-blue-500 text-white border-0">Standby</Badge>;
  return <Badge className="bg-amber-600 text-white border-0">Maintenance</Badge>;
}

function batteryColor(pct: number) {
  if (pct > 60) return "text-green-500";
  if (pct > 25) return "text-amber-500";
  return "text-red-500";
}

export default function Fleet() {
  const { data, isLoading, refetch, dataUpdatedAt } = useFleet();
  const summary = data?.summary;
  const fleet = data?.fleet || [];

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fleet Command Center</h1>
            <p className="text-muted-foreground mt-1">Real-time tracking of measurement vehicles and AI drones across the network.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Units", value: summary?.active ?? 0, color: "text-green-500", icon: Activity },
            { label: "Standby", value: summary?.standby ?? 0, color: "text-blue-400", icon: Zap },
            { label: "In Maintenance", value: summary?.maintenance ?? 0, color: "text-amber-500", icon: RefreshCw },
            { label: "Readings Today", value: summary?.total_measurements_today ?? 0, color: "text-primary", icon: Activity },
          ].map(item => (
            <Card key={item.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Network coverage */}
        <Card className="border-border bg-gradient-to-r from-blue-600/10 to-primary/5 border-blue-600/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Network Coverage</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-blue-400">{summary?.coverage_km?.toLocaleString() ?? "—"}</span>
                  <span className="text-muted-foreground">km under real-time measurement</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet units */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Fleet Units</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? Array.from({length: 4}).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            )) : fleet.map((unit: any) => (
              <Card key={unit.id} className={`border-border ${unit.status === "active" ? "border-l-4 border-l-green-600" : unit.status === "standby" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-amber-500 opacity-80"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        unit.status === "active" ? "bg-green-600/15" : unit.status === "standby" ? "bg-blue-500/15" : "bg-amber-500/15"
                      }`}>
                        {unit.type === "drone" ? <Plane className={`h-6 w-6 ${unit.status === "active" ? "text-green-500" : "text-muted-foreground"}`} /> : <Truck className={`h-6 w-6 ${unit.status === "active" ? "text-green-500" : "text-muted-foreground"}`} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{unit.name}</span>
                          <Badge variant="outline" className="text-xs font-mono">{unit.id}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{unit.description}</p>
                      </div>
                    </div>
                    {statusBadge(unit.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Position</p>
                      <p className="font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        {unit.current_chainage}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Route</p>
                      <p className="font-medium mt-0.5 truncate">{unit.route_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className={`font-semibold mt-0.5 ${unit.speed_kmh > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                        {unit.speed_kmh} km/h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Readings Today</p>
                      <p className="font-semibold text-primary mt-0.5">{unit.measurements_today}</p>
                    </div>
                  </div>

                  {/* Battery */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Battery className="h-3 w-3" /> Battery</span>
                      <span className={`font-semibold ${batteryColor(unit.battery_pct)}`}>{unit.battery_pct}%</span>
                    </div>
                    <Progress value={unit.battery_pct} className="h-1.5" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Operator: <span className="text-foreground font-medium">{unit.operator}</span></span>
                    <span>Ping: {format(new Date(unit.last_ping), "HH:mm:ss")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Measurement Methods Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Measurement Method Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: "🚐",
                  title: "Vehicle-Mounted (IRC Method i)",
                  description: "Mobile Retroreflectometer Vans equipped with class-I geometry sensors travel at highway speed, capturing readings without closing lanes.",
                  benefit: "10× faster than handheld",
                  color: "border-green-600/30 bg-green-600/5",
                },
                {
                  icon: "🛸",
                  title: "Drone + AI Camera (IRC Method ii)",
                  description: "UAVs with high-resolution cameras and on-board ML models analyze retroreflectivity from aerial imagery in real-time.",
                  benefit: "Safe in high-speed zones",
                  color: "border-blue-500/30 bg-blue-500/5",
                },
                {
                  icon: "🔗",
                  title: "Hybrid Fusion (IRC Method iii)",
                  description: "Combines ground-vehicle readings with drone AI analysis. Conflicting readings trigger manual validation by inspectors.",
                  benefit: "Highest accuracy — ±2%",
                  color: "border-primary/30 bg-primary/5",
                },
              ].map(method => (
                <div key={method.title} className={`rounded-xl border p-4 ${method.color}`}>
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{method.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{method.description}</p>
                  <Badge variant="outline" className="text-xs">{method.benefit}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
