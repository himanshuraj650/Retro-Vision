import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListSigns, useDeleteSign } from "@workspace/api-client-react";
import { Plus, Trash2, ChevronRight, Search, MapPin } from "lucide-react";
import { format } from "date-fns";

function statusBadge(status: string) {
  if (status === "compliant") return <Badge className="bg-green-600 text-white border-0">Compliant</Badge>;
  if (status === "warning") return <Badge className="bg-amber-500 text-white border-0">Warning</Badge>;
  if (status === "critical") return <Badge className="bg-red-600 text-white border-0">Critical</Badge>;
  return <Badge variant="secondary">Unknown</Badge>;
}

const TYPES = ["traffic_sign","pavement_marking","road_stud","delineator","gantry","shoulder_mounted"];

export default function Signs() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useListSigns({
    type: type === "all" ? undefined : type as any,
    status: status === "all" ? undefined : status as any,
    limit: 200,
  });

  const deleteSign = useDeleteSign();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sign/asset?")) return;
    await deleteSign.mutateAsync({ id });
    refetch();
  };

  const signs = (data?.signs || []).filter(s =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) || s.chainage?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Inventory</h1>
            <p className="text-muted-foreground mt-1">Road signs, markings, studs, and delineators across all routes.</p>
          </div>
          <Link href="/signs/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Asset</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Assets", value: data?.total ?? 0, color: "" },
            { label: "Compliant", value: (data?.signs || []).filter(s => s.status === "compliant").length, color: "text-green-500" },
            { label: "Warning", value: (data?.signs || []).filter(s => s.status === "warning").length, color: "text-amber-500" },
            { label: "Critical", value: (data?.signs || []).filter(s => s.status === "critical").length, color: "text-red-500" },
          ].map(stat => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or chainage..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-52"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {["compliant","warning","critical","unknown"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          {isLoading ? Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          )) : signs.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center text-muted-foreground">
                No assets found. Add one using the button above.
              </CardContent>
            </Card>
          ) : signs.map(sign => (
            <Card key={sign.id} className="border-border hover:bg-card/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    sign.status === "critical" ? "bg-red-600/20 text-red-500" :
                    sign.status === "warning" ? "bg-amber-500/20 text-amber-500" :
                    sign.status === "compliant" ? "bg-green-600/20 text-green-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{sign.name}</span>
                      {statusBadge(sign.status)}
                      <Badge variant="outline" className="text-xs capitalize">{sign.type?.replace(/_/g," ")}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {sign.chainage && <span>{sign.chainage}</span>}
                      {sign.location_description && <span>{sign.location_description}</span>}
                      {sign.last_value && <span className="font-mono">{sign.last_value} mcd/lx/m²</span>}
                      {sign.last_measured_at && <span>Measured {format(new Date(sign.last_measured_at), "MMM d, yyyy")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/signs/${sign.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(sign.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
