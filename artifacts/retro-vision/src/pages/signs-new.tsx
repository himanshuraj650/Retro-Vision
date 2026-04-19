import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSign, useListRoutes } from "@workspace/api-client-react";
import { ArrowLeft, Save } from "lucide-react";

export default function SignsNew() {
  const [, navigate] = useLocation();
  const createSign = useCreateSign();
  const { data: routesData } = useListRoutes();

  const [form, setForm] = useState({
    route_id: "",
    name: "",
    type: "traffic_sign",
    location_description: "",
    chainage: "",
    latitude: "",
    longitude: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSign.mutateAsync({
      data: {
        route_id: form.route_id,
        name: form.name,
        type: form.type as any,
        location_description: form.location_description || undefined,
        chainage: form.chainage || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      }
    });
    navigate("/signs");
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/signs")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Asset</h1>
            <p className="text-muted-foreground mt-1">Register a new road sign, marking, or stud.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
            <CardDescription>Provide location and type information for the asset.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label>Route</Label>
                <Select value={form.route_id} onValueChange={v => set("route_id", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select highway route" /></SelectTrigger>
                  <SelectContent>
                    {routesData?.routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.highway_number})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Asset Name</Label>
                <Input placeholder="e.g. Speed Limit 120 Gantry" value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Asset Type</Label>
                <Select value={form.type} onValueChange={v => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["traffic_sign","pavement_marking","road_stud","delineator","gantry","shoulder_mounted"].map(t =>
                      <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Chainage / KM Marker</Label>
                <Input placeholder="e.g. NH-48 km 342" value={form.chainage} onChange={e => set("chainage", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Location Description</Label>
                <Input placeholder="e.g. Near Vadodara exit ramp" value={form.location_description} onChange={e => set("location_description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Latitude (optional)</Label>
                  <Input type="number" step="0.0001" placeholder="e.g. 28.4089" value={form.latitude} onChange={e => set("latitude", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Longitude (optional)</Label>
                  <Input type="number" step="0.0001" placeholder="e.g. 77.0434" value={form.longitude} onChange={e => set("longitude", e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createSign.isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {createSign.isPending ? "Saving..." : "Add Asset"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/signs")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
