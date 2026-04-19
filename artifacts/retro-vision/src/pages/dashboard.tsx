import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, TrendingUp, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useGetDashboardStats, 
  useGetComplianceTrends, 
  useGetConditionBreakdown,
  useGetActivityFeed,
  useListAlerts
} from "@workspace/api-client-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell
} from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useGetComplianceTrends({ period: '30d' });
  const { data: conditionData, isLoading: conditionLoading } = useGetConditionBreakdown();
  const { data: activityFeed, isLoading: activityLoading } = useGetActivityFeed({ limit: 5 });
  const { data: alertsData, isLoading: alertsLoading } = useListAlerts({ limit: 5, resolved: false, severity: 'critical' });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NHAI Telemetry Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time retroreflectivity intelligence across all active routes.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Compliance</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.compliance_rate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {stats?.total_signs.toLocaleString()} measured assets
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Findings</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold text-destructive">{stats?.critical_signs.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Require immediate intervention
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Reflectivity</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.avg_reflectivity} <span className="text-sm font-normal text-muted-foreground">mcd/lx/m²</span></div>
                  <p className="text-xs text-muted-foreground mt-1">
                    System-wide aggregate average
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Telemetry</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-3xl font-bold">{stats?.measurements_today.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Measurements ingested today
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Main Chart */}
          <Card className="col-span-7 lg:col-span-4 border-border shadow-sm">
            <CardHeader>
              <CardTitle>Compliance Trend (30 Days)</CardTitle>
              <CardDescription>Network-wide compliance rate over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {trendsLoading ? (
                <div className="h-full w-full flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), 'MMM d')} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="compliance_rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Condition Breakdown */}
          <Card className="col-span-7 lg:col-span-3 border-border shadow-sm">
            <CardHeader>
              <CardTitle>Environmental Conditions</CardTitle>
              <CardDescription>Avg reflectivity by measurement condition.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {conditionLoading ? (
                <div className="h-full w-full flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conditionData?.items} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="condition" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Bar dataKey="avg_value" radius={[0, 4, 4, 0]}>
                      {conditionData?.items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
