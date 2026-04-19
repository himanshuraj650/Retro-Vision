import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeasurement, useListSigns, useListRoutes } from "@workspace/api-client-react";
import { ArrowLeft, Save } from "lucide-react";

export default function MeasurementsNew() {
  const [, navigate] = useLocation();
  const createMeasurement = useCreateMeasurement();
  const { data: signsData } = useListSigns({ limit: 200 });
  const { data: routesData } = useListRoutes();

  const [form, setForm] = useState({
    sign_id: "",
    route_id: "",
    value: "",
    condition: "night_dry",
    method: "vehicle_mounted",
    irc_standard: "IRC_67",
    min_required: "150",
    notes: "",
    recorded_by: "",
    latitude: "",
    longitude: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeasurement.mutateAsync({
      data: {
        sign_id: form.sign_id,
        route_id: form.route_id,
        value: parseFloat(form.value),
        condition: form.condition as any,
        method: form.method as any,
        irc_standard: form.irc_standard as any,
        min_required: parseFloat(form.min_required),
        notes: form.notes || undefined,
        recorded_by: form.recorded_by || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      }
    });
    navigate("/measurements");
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/measurements")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Measurement</h1>
            <p className="text-muted-foreground mt-1">Log a new retroreflectivity reading.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Measurement Details</CardTitle>
            <CardDescription>Enter the retroreflectivity value and measurement conditions.</CardDescription>
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
                <Label>Sign / Asset</Label>
                <Select value={form.sign_id} onValueChange={v => set("sign_id", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select sign or marking" /></SelectTrigger>
                  <SelectContent>
                    {signsData?.signs.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.chainage || s.type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Retroreflectivity Value (mcd/lx/m²)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 182.5" value={form.value} onChange={e => set("value", e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Min Required (mcd/lx/m²)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 150" value={form.min_required} onChange={e => set("min_required", e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Measurement Condition</Label>
                  <Select value={form.condition} onValueChange={v => set("condition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["day_dry","day_wet","night_dry","night_wet","foggy","no_street_light","with_street_light"].map(c =>
                        <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Method</Label>
                  <Select value={form.method} onValueChange={v => set("method", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["vehicle_mounted","drone","handheld","ai_camera"].map(m =>
                        <SelectItem key={m} value={m}>{m.replace(/_/g," ")}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>IRC Standard</Label>
                  <Select value={form.irc_standard} onValueChange={v => set("irc_standard", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IRC_67">IRC 67 (Signs)</SelectItem>
                      <SelectItem value="IRC_35">IRC 35 (Markings)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Recorded By</Label>
                  <Input placeholder="Inspector name or unit" value={form.recorded_by} onChange={e => set("recorded_by", e.target.value)} />
                </div>
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

              <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <Textarea placeholder="Any observations, defects, or context..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMeasurement.isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {createMeasurement.isPending ? "Saving..." : "Save Measurement"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/measurements")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
