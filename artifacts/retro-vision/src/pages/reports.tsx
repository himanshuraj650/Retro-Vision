import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useListReports, useCreateReport, useDeleteReport, useListRoutes } from "@workspace/api-client-react";
import { Plus, Trash2, FileText, Download } from "lucide-react";
import { format } from "date-fns";

function statusBadge(status: string) {
  if (status === "ready") return <Badge className="bg-green-600 text-white border-0">Ready</Badge>;
  if (status === "generating") return <Badge className="bg-blue-500 text-white border-0">Generating</Badge>;
  if (status === "failed") return <Badge className="bg-red-600 text-white border-0">Failed</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

export default function Reports() {
  const { data, isLoading, refetch } = useListReports();
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();
  const { data: routesData } = useListRoutes();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    route_id: "",
    type: "inspection",
    period_start: "",
    period_end: "",
    generated_by: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    await createReport.mutateAsync({
      data: {
        title: form.title,
        route_id: form.route_id || undefined,
        type: form.type as any,
        period_start: form.period_start,
        period_end: form.period_end,
        generated_by: form.generated_by || undefined,
      }
    });
    setOpen(false);
    setForm({ title: "", route_id: "", type: "inspection", period_start: "", period_end: "", generated_by: "" });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    await deleteReport.mutateAsync({ id });
    refetch();
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-1">Inspection, compliance, and maintenance reports.</p>
          </div>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Generate Report
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoading ? Array.from({length: 4}).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5 space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          )) : (data?.reports || []).length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 flex flex-col items-center gap-3 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="font-semibold text-lg">No reports yet</p>
                <p className="text-muted-foreground">Generate your first inspection or compliance report.</p>
                <Button className="gap-2 mt-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Generate Report</Button>
              </CardContent>
            </Card>
          ) : (data?.reports || []).map(report => (
            <Card key={report.id} className="border-border hover:bg-card/80 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{report.title}</span>
                        {statusBadge(report.status)}
                        <Badge variant="outline" className="capitalize">{report.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        {report.route_name && <span>{report.route_name}</span>}
                        {report.period_start && report.period_end && (
                          <span>{format(new Date(report.period_start), "MMM d")} — {format(new Date(report.period_end), "MMM d, yyyy")}</span>
                        )}
                        {report.total_signs !== null && report.total_signs !== undefined && <span>{report.total_signs} assets</span>}
                        {report.compliance_rate !== null && report.compliance_rate !== undefined && (
                          <span className={report.compliance_rate >= 75 ? "text-green-500 font-semibold" : report.compliance_rate >= 50 ? "text-amber-500 font-semibold" : "text-red-500 font-semibold"}>
                            {report.compliance_rate}% compliant
                          </span>
                        )}
                        {report.critical_findings !== null && report.critical_findings !== undefined && report.critical_findings > 0 && (
                          <span className="text-red-500">{report.critical_findings} critical findings</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generated {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                        {report.generated_by && ` by ${report.generated_by}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Report Title</Label>
              <Input placeholder="e.g. Q2 2026 NH-48 Compliance Report" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Report Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Route (optional)</Label>
              <Select value={form.route_id || "all"} onValueChange={v => set("route_id", v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="All routes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routesData?.routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Period Start</Label>
                <Input type="date" value={form.period_start} onChange={e => set("period_start", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Period End</Label>
                <Input type="date" value={form.period_end} onChange={e => set("period_end", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Generated By</Label>
              <Input placeholder="Name or department" value={form.generated_by} onChange={e => set("generated_by", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createReport.isPending || !form.title || !form.period_start || !form.period_end}>
              {createReport.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
