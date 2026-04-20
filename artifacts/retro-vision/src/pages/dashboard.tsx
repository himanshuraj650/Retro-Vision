import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, CheckCircle, Map,
  MapPin, TrendingDown, TrendingUp, Truck, XCircle, Activity,
} from "lucide-react";
import { 
  useGetDashboardStats, 
  useGetComplianceTrends, 
  useGetConditionBreakdown,
  useGetActivityFeed,
  useGetRoutePerformance,
  useGetCriticalSigns,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from "recharts";
import { format } from "date-fns";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useFleetSummary() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/api/analytics/fleet`); return r.json(); },
    staleTime: 30000,
  });
}

function KpiCard({
  label, value, unit, sub, icon: Icon, iconBg, valueColor, trend
}: {
  label: string;
  value: string | null;
  unit?: string;
  sub: string;
  icon: any;
  iconBg: string;
  valueColor?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="border-border/60 bg-card shadow-none hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
          {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
        </div>
        <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">{label}</p>
        {value === null ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <p className={`stat-number ${valueColor ?? "text-foreground"}`}>
            {value}
            {unit && <span className="text-xs font-normal text-muted-foreground ml-1.5">{unit}</span>}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(224, 27%, 9%)",
  border: "1px solid hsl(220, 20%, 16%)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "hsl(210, 30%, 94%)",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useGetComplianceTrends({ period: '30d' });
  const { data: conditionData, isLoading: conditionLoading } = useGetConditionBreakdown();
  const { data: activityFeed, isLoading: activityLoading } = useGetActivityFeed({ limit: 8 });
  const { data: routePerf, isLoading: routePerfLoading } = useGetRoutePerformance();
  const { data: criticalSigns, isLoading: critLoading } = useGetCriticalSigns({ limit: 5 });
  const { data: fleetData } = useFleetSummary();

  return (
    <Layout>
      <div className="space-y-7">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Telemetry Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time retroreflectivity intelligence — India National Highway Network
            </p>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 text-emerald-500 border-emerald-600/30 bg-emerald-600/5 text-xs font-medium px-2.5 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Feed Active
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="System Compliance"
            value={statsLoading ? null : `${stats?.compliance_rate}%`}
            sub={statsLoading ? "—" : `Across ${stats?.total_signs?.toLocaleString()} monitored assets`}
            icon={Activity}
            iconBg="bg-primary/10 text-primary"
            trend="up"
          />
          <KpiCard
            label="Critical Findings"
            value={statsLoading ? null : String(stats?.critical_signs ?? 0)}
            sub="Require immediate intervention"
            icon={XCircle}
            iconBg="bg-destructive/10 text-destructive"
            valueColor="text-destructive"
            trend="down"
          />
          <KpiCard
            label="Avg Reflectivity"
            value={statsLoading ? null : String(stats?.avg_reflectivity ?? "—")}
            unit="mcd/lx/m²"
            sub="System-wide aggregate mean"
            icon={TrendingUp}
            iconBg="bg-blue-500/10 text-blue-400"
            trend="neutral"
          />
          <KpiCard
            label="Today's Telemetry"
            value={statsLoading ? null : String(stats?.measurements_today ?? 0)}
            sub="Measurements ingested today"
            icon={CheckCircle}
            iconBg="bg-emerald-500/10 text-emerald-500"
            trend="up"
          />
        </div>

        {/* Summary strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/fleet",
              label: "Active Fleet Units",
              value: fleetData?.summary?.active != null ? `${fleetData.summary.active} / ${fleetData.summary.total_units}` : "—",
              icon: Truck,
              color: "text-blue-400",
              bg: "bg-blue-500/8 border-blue-500/15",
            },
            {
              href: "/routes",
              label: "Inspection Routes",
              value: statsLoading ? "—" : String(stats?.active_routes ?? "—"),
              icon: Map,
              color: "text-primary",
              bg: "bg-primary/8 border-primary/15",
            },
            {
              href: "/alerts",
              label: "Active Alerts",
              value: statsLoading ? "—" : `${stats?.active_alerts} (${stats?.critical_alerts} critical)`,
              icon: AlertTriangle,
              color: "text-destructive",
              bg: "bg-destructive/8 border-destructive/15",
            },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.color} truncate`}>{item.value}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-5 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-border/60 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Compliance Trend</CardTitle>
                  <CardDescription className="text-xs mt-0.5">30-day network-wide compliance rate</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">30D</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[220px]">
                {trendsLoading ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends?.data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 20%, 15%)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                        stroke="hsl(215, 18%, 35%)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval={6}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="hsl(215, 18%, 35%)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                        formatter={(val: any) => [`${val}%`, "Compliance"]}
                        cursor={{ stroke: "hsl(220, 20%, 20%)", strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="compliance_rate"
                        stroke="url(#lineGrad)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "hsl(25, 95%, 53%)", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-border/60 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Conditions vs Reflectivity</CardTitle>
              <CardDescription className="text-xs mt-0.5">Average reading by road condition</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[220px]">
                {conditionLoading ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conditionData?.items} layout="vertical" margin={{ top: 0, right: 4, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220, 20%, 15%)" />
                      <XAxis type="number" stroke="hsl(215, 18%, 35%)" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="condition"
                        type="category"
                        stroke="hsl(215, 18%, 35%)"
                        fontSize={9}
                        width={78}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.replace(/_/g, " ")}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(220, 20%, 13%)" }}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [`${val} mcd`, "Avg Reflectivity"]}
                      />
                      <Bar dataKey="avg_value" radius={[0, 3, 3, 0]} name="Avg mcd/lx/m²">
                        {conditionData?.items.map((_: any, i: number) => (
                          <Cell
                            key={i}
                            fill={["hsl(25,95%,53%)", "hsl(38,92%,50%)", "hsl(142,68%,42%)", "hsl(215,18%,50%)", "hsl(0,62%,50%)", "hsl(195,70%,45%)"][i % 6]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Performance */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Route Performance</CardTitle>
                <CardDescription className="text-xs mt-0.5">Compliance rate per highway corridor</CardDescription>
              </div>
              <Link href="/routes">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {routePerfLoading ? (
              <div className="space-y-4">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <div className="space-y-4">
                {(routePerf?.items || []).map((route: any) => (
                  <div key={route.route_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{route.route_name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">{route.highway_number}</span>
                        {route.critical_count > 0 && (
                          <Badge className="bg-destructive/15 text-destructive border-0 text-[10px] font-medium px-1.5 py-0 h-4">
                            {route.critical_count} critical
                          </Badge>
                        )}
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${
                        route.compliance_rate >= 75 ? "text-emerald-500" :
                        route.compliance_rate >= 50 ? "text-amber-500" : "text-destructive"
                      }`}>
                        {route.compliance_rate}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          route.compliance_rate >= 75 ? "bg-emerald-500" :
                          route.compliance_rate >= 50 ? "bg-amber-500" : "bg-destructive"
                        }`}
                        style={{ width: `${route.compliance_rate}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-[10px] text-muted-foreground/60">
                      <span>{route.total_signs} assets</span>
                      <span className="font-mono">{route.avg_reflectivity} mcd avg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical + Activity */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border-border/60 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Critical Assets</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Signs requiring immediate action</CardDescription>
                </div>
                <Link href="/signs?status=critical">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {critLoading ? Array.from({length:4}).map((_,i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              )) : (criticalSigns?.signs || []).map((sign: any) => (
                <Link key={sign.id} href={`/signs/${sign.id}`}>
                  <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group -mx-2">
                    <div className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{sign.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {sign.chainage && <span className="font-mono">{sign.chainage}</span>}
                        {sign.last_value && <span className="text-destructive font-mono font-semibold">{sign.last_value} mcd</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
              {!critLoading && (criticalSigns?.signs || []).length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">No critical assets</p>
                  <p className="text-xs text-muted-foreground">Network is fully operational.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activity Feed</CardTitle>
              <CardDescription className="text-xs mt-0.5">Recent measurements and system events</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                {activityLoading ? Array.from({length:6}).map((_,i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-44" />
                      <Skeleton className="h-2.5 w-28" />
                    </div>
                  </div>
                )) : (activityFeed?.items || []).map((item: any) => {
                  const isMeasurement = item.type === "measurement_added";
                  const isAlertCreated = item.type === "alert_created";
                  return (
                    <div key={item.id} className="flex gap-3 py-2.5 border-b border-border/40 last:border-0">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        isMeasurement ? "bg-blue-500" : isAlertCreated ? "bg-destructive" : "bg-emerald-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono">
                          {format(new Date(item.created_at), "dd MMM, HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
