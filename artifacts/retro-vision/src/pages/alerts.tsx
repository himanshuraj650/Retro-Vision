import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useListAlerts, useResolveAlert } from "@workspace/api-client-react";
import { AlertTriangle, CheckCircle, XCircle, Shield } from "lucide-react";
import { format } from "date-fns";

function severityBadge(severity: string) {
  if (severity === "critical") return <Badge className="bg-red-600 text-white border-0 gap-1"><XCircle className="h-3 w-3" />Critical</Badge>;
  if (severity === "warning") return <Badge className="bg-amber-500 text-white border-0 gap-1"><AlertTriangle className="h-3 w-3" />Warning</Badge>;
  return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Info</Badge>;
}

export default function Alerts() {
  const [severity, setSeverity] = useState("all");
  const [resolved, setResolved] = useState("false");
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveForm, setResolveForm] = useState({ resolved_by: "", resolution_note: "" });

  const { data, isLoading, refetch } = useListAlerts({
    severity: severity === "all" ? undefined : severity as any,
    resolved: resolved === "all" ? undefined : resolved === "true",
    limit: 100,
  });

  const resolveMutation = useResolveAlert();

  const handleResolve = async () => {
    if (!resolveId) return;
    await resolveMutation.mutateAsync({
      id: resolveId,
      data: { resolved_by: resolveForm.resolved_by, resolution_note: resolveForm.resolution_note }
    });
    setResolveId(null);
    setResolveForm({ resolved_by: "", resolution_note: "" });
    refetch();
  };

  const activeCount = (data?.alerts || []).filter(a => !a.resolved).length;
  const criticalCount = (data?.alerts || []).filter(a => !a.resolved && a.severity === "critical").length;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts Center</h1>
          <p className="text-muted-foreground mt-1">Compliance violations requiring attention across the network.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Active Alerts</p>
              <p className="text-2xl font-bold mt-1 text-amber-500">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Critical — Immediate Action</p>
              <p className="text-2xl font-bold mt-1 text-red-500">{criticalCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Shown</p>
              <p className="text-2xl font-bold mt-1">{data?.total ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resolved} onValueChange={setResolved}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? Array.from({length: 5}).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          )) : (data?.alerts || []).length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 flex flex-col items-center gap-2 text-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="font-semibold text-lg">No alerts</p>
                <p className="text-muted-foreground">The network is operating within compliance thresholds.</p>
              </CardContent>
            </Card>
          ) : (data?.alerts || []).map(alert => (
            <Card key={alert.id} className={`border-l-4 ${alert.resolved ? "border-l-green-600 opacity-70" : alert.severity === "critical" ? "border-l-red-600" : alert.severity === "warning" ? "border-l-amber-500" : "border-l-blue-500"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {severityBadge(alert.severity)}
                      {alert.resolved && <Badge className="bg-green-600 text-white border-0 gap-1"><CheckCircle className="h-3 w-3" />Resolved</Badge>}
                      <span className="font-semibold">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {alert.sign_name && <span>Sign: <span className="font-medium text-foreground">{alert.sign_name}</span></span>}
                      {alert.route_name && <span>Route: <span className="font-medium text-foreground">{alert.route_name}</span></span>}
                      {alert.current_value && alert.required_value && (
                        <span>
                          <span className="text-red-500 font-mono font-semibold">{alert.current_value}</span>
                          <span className="mx-1">/</span>
                          <span className="font-mono">{alert.required_value} mcd/lx/m²</span>
                        </span>
                      )}
                      <span>{format(new Date(alert.created_at), "MMM d, yyyy HH:mm")}</span>
                    </div>
                    {alert.resolved && alert.resolution_note && (
                      <p className="text-xs text-green-600 mt-2 bg-green-600/10 px-2 py-1 rounded">
                        Resolution: {alert.resolution_note} — {alert.resolved_by}
                      </p>
                    )}
                  </div>
                  {!alert.resolved && (
                    <Button size="sm" variant="outline" className="flex-shrink-0 gap-1" onClick={() => setResolveId(alert.id)}>
                      <CheckCircle className="h-3 w-3" /> Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={!!resolveId} onOpenChange={() => setResolveId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve Alert</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Resolved By</Label>
              <Input placeholder="Your name or department" value={resolveForm.resolved_by} onChange={e => setResolveForm(f => ({ ...f, resolved_by: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Resolution Note</Label>
              <Textarea placeholder="What action was taken?" value={resolveForm.resolution_note} onChange={e => setResolveForm(f => ({ ...f, resolution_note: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveId(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={resolveMutation.isPending || !resolveForm.resolved_by}>
              {resolveMutation.isPending ? "Resolving..." : "Mark Resolved"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
