import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRoute } from "@workspace/api-client-react";
import { ArrowLeft, Save } from "lucide-react";

export default function RoutesNew() {
  const [, navigate] = useLocation();
  const createRoute = useCreateRoute();

  const [form, setForm] = useState({
    name: "",
    highway_number: "",
    start_chainage: "",
    end_chainage: "",
    length_km: "",
    lane_count: "4",
    type: "four_lane",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoute.mutateAsync({
      data: {
        name: form.name,
        highway_number: form.highway_number,
        start_chainage: form.start_chainage || undefined,
        end_chainage: form.end_chainage || undefined,
        length_km: form.length_km ? parseFloat(form.length_km) : undefined,
        lane_count: parseInt(form.lane_count),
        type: form.type as any,
      }
    });
    navigate("/routes");
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/routes")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Route</h1>
            <p className="text-muted-foreground mt-1">Register a new highway inspection corridor.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Route Details</CardTitle>
            <CardDescription>Specify the highway corridor and its configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label>Route Name</Label>
                <Input placeholder="e.g. Delhi-Mumbai Expressway" value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Highway Number</Label>
                  <Input placeholder="e.g. NH-48" value={form.highway_number} onChange={e => set("highway_number", e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Route Type</Label>
                  <Select value={form.type} onValueChange={v => set("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expressway">Expressway</SelectItem>
                      <SelectItem value="four_lane">Four Lane</SelectItem>
                      <SelectItem value="two_lane">Two Lane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Chainage</Label>
                  <Input placeholder="e.g. km 0" value={form.start_chainage} onChange={e => set("start_chainage", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>End Chainage</Label>
                  <Input placeholder="e.g. km 1380" value={form.end_chainage} onChange={e => set("end_chainage", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Length (km)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 1380" value={form.length_km} onChange={e => set("length_km", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Lane Count</Label>
                  <Select value={form.lane_count} onValueChange={v => set("lane_count", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 lanes</SelectItem>
                      <SelectItem value="4">4 lanes</SelectItem>
                      <SelectItem value="6">6 lanes</SelectItem>
                      <SelectItem value="8">8 lanes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createRoute.isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {createRoute.isPending ? "Saving..." : "Add Route"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/routes")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
