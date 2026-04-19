import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSign, useGetSignMeasurements } from "@workspace/api-client-react";
import { ArrowLeft, MapPin, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function statusBadge(status: string) {
  if (status === "compliant") return <Badge className="bg-green-600 text-white border-0">Compliant</Badge>;
  if (status === "warning") return <Badge className="bg-amber-500 text-white border-0">Warning</Badge>;
  if (status === "critical") return <Badge className="bg-red-600 text-white border-0">Critical</Badge>;
  return <Badge variant="secondary">Unknown</Badge>;
}

interface Props { id: string }

export default function SignDetail({ id }: Props) {
  const [, navigate] = useLocation();
  const { data: sign, isLoading } = useGetSign(id, { query: { enabled: !!id } });
  const { data: measurements, isLoading: measLoading } = useGetSignMeasurements(id, { query: { enabled: !!id } });

  const chartData = (measurements?.measurements || [])
    .slice().reverse()
    .map(m => ({
      date: format(new Date(m.created_at), "MMM d"),
      value: m.value,
      min: m.min_required,
    }));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/signs")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            {isLoading ? <Skeleton className="h-8 w-64" /> : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{sign?.name}</h1>
                <p className="text-muted-foreground mt-1">{sign?.chainage} — {sign?.location_description}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Status", value: isLoading ? null : statusBadge(sign?.status || "unknown") },
            { label: "Type", value: sign?.type?.replace(/_/g," "), isText: true },
            { label: "Last Value", value: sign?.last_value ? `${sign.last_value} mcd/lx/m²` : "—", isText: true },
            { label: "Last Measured", value: sign?.last_measured_at ? format(new Date(sign.last_measured_at), "MMM d, yyyy") : "Never", isText: true },
          ].map(item => (
            <Card key={item.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium mb-2">{item.label}</p>
                {isLoading ? <Skeleton className="h-5 w-24" /> : (
                  item.isText ? <p className="font-semibold capitalize">{item.value as string}</p> : item.value
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Measurement History Chart */}
        {chartData.length > 1 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Retroreflectivity History</CardTitle>
              <CardDescription>All recorded measurements for this asset over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <ReferenceLine y={chartData[0]?.min} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Min Required", fill: 'hsl(var(--destructive))', fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} name="Retroreflectivity" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Measurements Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Measurement Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Value</th>
                    <th className="px-4 py-3 text-left font-medium">Condition</th>
                    <th className="px-4 py-3 text-left font-medium">Method</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">By</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {measLoading ? Array.from({length:4}).map((_,i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({length:6}).map((_,j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  )) : (measurements?.measurements || []).length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No measurements recorded yet.</td></tr>
                  ) : (measurements?.measurements || []).map(m => (
                    <tr key={m.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-semibold">{m.value} <span className="text-xs font-normal text-muted-foreground">mcd/lx/m²</span></td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{m.condition?.replace(/_/g," ")}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{m.method?.replace(/_/g," ")}</td>
                      <td className="px-4 py-3">{statusBadge(m.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.recorded_by || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(m.created_at), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
