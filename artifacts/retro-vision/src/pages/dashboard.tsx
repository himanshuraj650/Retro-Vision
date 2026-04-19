import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, Brain, CheckCircle, Map, MapPin,
  TrendingDown, TrendingUp, Truck, XCircle, Zap, ArrowRight
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
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NHAI Telemetry Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time retroreflectivity intelligence across all active routes.</p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-green-500 border-green-600/40 bg-green-600/5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live Data
          </Badge>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "System Compliance",
              value: statsLoading ? null : `${stats?.compliance_rate}%`,
              sub: statsLoading ? null : `Across ${stats?.total_signs?.toLocaleString()} assets`,
              icon: Activity, iconColor: "text-primary",
            },
            {
              label: "Critical Findings",
              value: statsLoading ? null : stats?.critical_signs?.toLocaleString(),
              sub: "Require immediate intervention",
              icon: XCircle, iconColor: "text-destructive", valueColor: "text-destructive",
            },
            {
              label: "Avg Reflectivity",
              value: statsLoading ? null : `${stats?.avg_reflectivity}`,
              unit: "mcd/lx/m²",
              sub: "System-wide aggregate average",
              icon: TrendingUp, iconColor: "text-primary",
            },
            {
              label: "Today's Telemetry",
              value: statsLoading ? null : stats?.measurements_today?.toLocaleString(),
              sub: "Measurements ingested today",
              icon: CheckCircle, iconColor: "text-green-500",
            },
          ].map(kpi => (
            <Card key={kpi.label} className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
              </CardHeader>
              <CardContent>
                {kpi.value === null ? <Skeleton className="h-8 w-24" /> : (
                  <>
                    <div className={`text-3xl font-bold ${(kpi as any).valueColor || ""}`}>
                      {kpi.value}
                      {(kpi as any).unit && <span className="text-sm font-normal text-muted-foreground ml-1">{(kpi as any).unit}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fleet + Route summary strip */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-blue-600/5 border-blue-600/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-600/15 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Active Fleet Units</p>
                <p className="text-xl font-bold text-blue-400">{fleetData?.summary?.active ?? "—"} <span className="text-sm font-normal text-muted-foreground">/ {fleetData?.summary?.total_units ?? "—"}</span></p>
              </div>
              <Link href="/fleet"><Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRight className="h-4 w-4" /></Button></Link>
            </CardContent>
          </Card>
          <Card className="border-border bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Active Routes</p>
                <p className="text-xl font-bold text-primary">{statsLoading ? "—" : stats?.active_routes}</p>
              </div>
              <Link href="/routes"><Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRight className="h-4 w-4" /></Button></Link>
            </CardContent>
          </Card>
          <Card className="border-border bg-red-600/5 border-red-600/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-600/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Active Alerts</p>
                <p className="text-xl font-bold text-red-500">{statsLoading ? "—" : stats?.active_alerts} <span className="text-sm font-normal text-muted-foreground">({statsLoading ? "—" : stats?.critical_alerts} critical)</span></p>
              </div>
              <Link href="/alerts"><Button variant="ghost" size="icon" className="h-7 w-7"><ArrowRight className="h-4 w-4" /></Button></Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Compliance Trend */}
          <Card className="col-span-7 lg:col-span-4 border-border shadow-sm">
            <CardHeader>
              <CardTitle>Compliance Trend (30 Days)</CardTitle>
              <CardDescription>Network-wide compliance rate over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {trendsLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'MMM d')} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')} />
                    <Line type="monotone" dataKey="compliance_rate" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Condition Breakdown */}
          <Card className="col-span-7 lg:col-span-3 border-border shadow-sm">
            <CardHeader>
              <CardTitle>Environmental Conditions</CardTitle>
              <CardDescription>Avg reflectivity by condition.</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {conditionLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conditionData?.items} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="condition" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} width={105} tickLine={false} axisLine={false} tickFormatter={(v) => v.replace(/_/g, " ")} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Bar dataKey="avg_value" radius={[0, 4, 4, 0]} name="Avg mcd/lx/m²">
                      {conditionData?.items.map((_: any, i: number) => (
                        <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Route Performance */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Route Performance</CardTitle>
                <CardDescription>Compliance rate per highway corridor.</CardDescription>
              </div>
              <Link href="/routes"><Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {routePerfLoading ? (
              <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <div className="space-y-4">
                {(routePerf?.items || []).map((route: any) => (
                  <div key={route.route_id} className="grid gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{route.route_name}</span>
                        <Badge variant="outline" className="text-xs font-mono">{route.highway_number}</Badge>
                        {route.critical_count > 0 && (
                          <Badge className="bg-red-600 text-white border-0 text-xs">{route.critical_count} critical</Badge>
                        )}
                      </div>
                      <span className={`font-bold tabular-nums ${route.compliance_rate >= 75 ? "text-green-500" : route.compliance_rate >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        {route.compliance_rate}%
                      </span>
                    </div>
                    <Progress value={route.compliance_rate} className="h-2" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{route.total_signs} assets</span>
                      <span className="font-mono">{route.avg_reflectivity} mcd avg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Critical Signs */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Critical Assets</CardTitle>
                  <CardDescription>Signs requiring immediate intervention.</CardDescription>
                </div>
                <Link href="/signs?status=critical"><Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {critLoading ? Array.from({length:4}).map((_,i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              )) : (criticalSigns?.signs || []).map((sign: any) => (
                <Link key={sign.id} href={`/signs/${sign.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{sign.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {sign.chainage && <span>{sign.chainage}</span>}
                        {sign.last_value && <span className="font-mono text-red-400">{sign.last_value} mcd</span>}
                      </div>
                    </div>
                    <Badge className="bg-red-600 text-white border-0 text-xs flex-shrink-0">Critical</Badge>
                  </div>
                </Link>
              ))}
              {!critLoading && (criticalSigns?.signs || []).length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-muted-foreground">No critical assets — network healthy.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>Recent measurements and system events.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {activityLoading ? Array.from({length:6}).map((_,i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                  <Skeleton className="h-2 w-2 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              )) : (activityFeed?.items || []).map((item: any) => {
                const isMeasurement = item.type === "measurement_added";
                const isAlertCreated = item.type === "alert_created";
                const isAlertResolved = item.type === "alert_resolved";
                return (
                  <div key={item.id} className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isMeasurement ? "bg-blue-500" : isAlertCreated ? "bg-red-500" : "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{format(new Date(item.created_at), "MMM d, HH:mm")}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
