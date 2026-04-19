import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMeasurements, useDeleteMeasurement } from "@workspace/api-client-react";
import { Plus, Trash2, Eye, Search } from "lucide-react";
import { format } from "date-fns";

function statusBadge(status: string) {
  if (status === "compliant") return <Badge className="bg-green-600 text-white border-0">Compliant</Badge>;
  if (status === "warning") return <Badge className="bg-amber-500 text-white border-0">Warning</Badge>;
  if (status === "critical") return <Badge className="bg-red-600 text-white border-0">Critical</Badge>;
  return <Badge variant="secondary">Unknown</Badge>;
}

const CONDITIONS = ["day_dry","day_wet","night_dry","night_wet","foggy","no_street_light","with_street_light"];
const STATUSES = ["compliant","warning","critical","unknown"];

export default function Measurements() {
  const [condition, setCondition] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useListMeasurements({
    condition: condition === "all" ? undefined : condition as any,
    status: status === "all" ? undefined : status as any,
    limit: 100,
  });

  const deleteMutation = useDeleteMeasurement();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this measurement?")) return;
    await deleteMutation.mutateAsync({ id });
    refetch();
  };

  const measurements = (data?.measurements || []).filter(m =>
    search ? m.sign_id.toLowerCase().includes(search.toLowerCase()) || m.recorded_by?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Measurements</h1>
            <p className="text-muted-foreground mt-1">All retroreflectivity readings across the network.</p>
          </div>
          <Link href="/measurements/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Record Measurement</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by sign or inspector..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Conditions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Results — {data?.total ?? 0} measurements</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Value</th>
                    <th className="px-4 py-3 text-left font-medium">Standard</th>
                    <th className="px-4 py-3 text-left font-medium">Condition</th>
                    <th className="px-4 py-3 text-left font-medium">Method</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Recorded By</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({length: 8}).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {Array.from({length: 8}).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                      </tr>
                    ))
                  ) : measurements.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No measurements found. Adjust your filters or record a new one.</td></tr>
                  ) : measurements.map(m => (
                    <tr key={m.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold">
                        {m.value} <span className="text-xs text-muted-foreground font-normal">mcd/lx/m²</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{m.irc_standard}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{m.condition?.replace(/_/g," ")}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{m.method?.replace(/_/g," ")}</td>
                      <td className="px-4 py-3">{statusBadge(m.status)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.recorded_by || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(m.created_at), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
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
