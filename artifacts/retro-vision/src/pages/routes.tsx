import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useListRoutes, useDeleteRoute } from "@workspace/api-client-react";
import { Plus, Trash2, Map, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function Routes() {
  const { data, isLoading, refetch } = useListRoutes();
  const deleteRoute = useDeleteRoute();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this route and all associated data?")) return;
    await deleteRoute.mutateAsync({ id });
    refetch();
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inspection Routes</h1>
            <p className="text-muted-foreground mt-1">Highway corridors under retroreflectivity monitoring.</p>
          </div>
          <Link href="/routes/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Route</Button>
          </Link>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Routes</p>
              <p className="text-2xl font-bold mt-1">{data?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Km Covered</p>
              <p className="text-2xl font-bold mt-1">
                {(data?.routes || []).reduce((sum, r) => sum + (r.length_km || 0), 0).toLocaleString()} km
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Active Routes</p>
              <p className="text-2xl font-bold mt-1 text-green-500">
                {(data?.routes || []).filter(r => r.status === "active").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {isLoading ? Array.from({length: 4}).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          )) : (data?.routes || []).map(route => {
            const total = (route as any).total_signs || 0;
            const compliant = (route as any).compliant_count || 0;
            const warning = (route as any).warning_count || 0;
            const critical = (route as any).critical_count || 0;
            const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

            return (
              <Card key={route.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Map className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <Badge variant="outline">{route.highway_number}</Badge>
                          <Badge className={route.status === "active" ? "bg-green-600 text-white border-0" : route.status === "under_inspection" ? "bg-blue-600 text-white border-0" : "bg-muted text-muted-foreground border-0"}>
                            {route.status?.replace(/_/g," ")}
                          </Badge>
                          <Badge variant="outline" className="capitalize">{route.type?.replace(/_/g," ")}</Badge>
                        </div>

                        <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground flex-wrap">
                          {route.length_km && <span>{route.length_km} km</span>}
                          {route.lane_count && <span>{route.lane_count}-lane</span>}
                          {route.start_chainage && route.end_chainage && <span>{route.start_chainage} → {route.end_chainage}</span>}
                          {route.last_inspected_at && <span>Last inspected {format(new Date(route.last_inspected_at), "MMM d, yyyy")}</span>}
                        </div>

                        {total > 0 && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Compliance Rate</span>
                              <span className={`font-semibold ${complianceRate >= 75 ? "text-green-500" : complianceRate >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                {complianceRate}%
                              </span>
                            </div>
                            <Progress value={complianceRate} className="h-2" />
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> {compliant} compliant</span>
                              <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> {warning} warning</span>
                              <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> {critical} critical</span>
                            </div>
                          </div>
                        )}
                        {total === 0 && <p className="text-sm text-muted-foreground mt-2">No assets registered on this route.</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDelete(route.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
