import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useListSigns } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Layers, RefreshCw, Eye } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useFleet() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/analytics/fleet`);
      return r.json();
    },
    refetchInterval: 8000,
  });
}

const STATUS_COLORS: Record<string, string> = {
  compliant: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  unknown: "#6b7280",
};

const TYPE_ICONS: Record<string, string> = {
  traffic_sign: "●",
  pavement_marking: "▬",
  road_stud: "◆",
  delineator: "▲",
  gantry: "⬛",
  shoulder_mounted: "◀",
};

export default function MapView() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const fleetMarkersRef = useRef<any[]>([]);
  const [layers, setLayers] = useState({ assets: true, fleet: true });
  const [selectedSign, setSelectedSign] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const { data: signsData } = useListSigns({ limit: 200 });
  const { data: fleetData } = useFleet();

  // Initialize map
  useEffect(() => {
    let L: any;

    async function initMap() {
      const leaflet = await import("leaflet");
      L = leaflet.default;
      leafletRef.current = L;

      if (!mapContainerRef.current || mapRef.current) return;

      // Fix leaflet icons in Vite
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CartoDB",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Attribution (minimal)
      L.control.attribution({ prefix: "© CartoDB | NHAI RetroVision" }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Plot sign markers
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !signsData?.signs) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!layers.assets) return;

    signsData.signs.forEach((sign: any) => {
      if (!sign.latitude || !sign.longitude) return;

      const color = STATUS_COLORS[sign.status] || "#6b7280";
      const icon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: ${color};
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 0 8px ${color}88, 0 2px 4px rgba(0,0,0,0.5);
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([sign.latitude, sign.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">${sign.name}</div>
            <div style="display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
              <span style="background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1px solid ${color}44;">${sign.status.toUpperCase()}</span>
              <span style="background: #334155; color: #94a3b8; padding: 2px 8px; border-radius: 999px; font-size: 11px;">${sign.type.replace(/_/g, " ")}</span>
            </div>
            ${sign.chainage ? `<div style="color: #94a3b8; font-size: 12px; margin-bottom: 3px;">📍 ${sign.chainage}</div>` : ""}
            ${sign.last_value ? `<div style="color: #f97316; font-size: 13px; font-weight: 600; font-family: monospace;">${sign.last_value} mcd/lx/m²</div>` : ""}
          </div>
        `, { closeButton: false, className: "retro-popup" })
        .on("click", () => setSelectedSign(sign));

      markersRef.current.push(marker);
    });
  }, [mapReady, signsData, layers.assets]);

  // Plot fleet markers
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !fleetData?.fleet) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    fleetMarkersRef.current.forEach(m => m.remove());
    fleetMarkersRef.current = [];

    if (!layers.fleet) return;

    fleetData.fleet.filter((f: any) => f.status === "active").forEach((unit: any) => {
      const isVehicle = unit.type === "vehicle";
      const color = unit.status === "active" ? "#3b82f6" : "#6b7280";
      const icon = L.divIcon({
        html: `<div style="
          width: 22px; height: 22px; border-radius: ${isVehicle ? "4px" : "50%"};
          background: ${color};
          border: 2px solid rgba(255,255,255,0.9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 12px ${color}88, 0 2px 6px rgba(0,0,0,0.5);
          font-size: 11px;
        ">${isVehicle ? "🚐" : "🛸"}</div>`,
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([unit.latitude, unit.longitude], { icon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${unit.name} (${unit.id})</div>
            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px;">${unit.description}</div>
            <div style="display: flex; gap: 6px; margin-bottom: 6px;">
              <span style="background: #1d4ed822; color: #60a5fa; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1px solid #1d4ed844;">ACTIVE</span>
            </div>
            <div style="color: #f8fafc; font-size: 12px;">📍 ${unit.current_chainage}</div>
            <div style="color: #94a3b8; font-size: 12px;">${unit.measurements_today} readings today · ${unit.speed_kmh} km/h</div>
            <div style="color: #94a3b8; font-size: 12px;">Battery: ${unit.battery_pct}% · Operator: ${unit.operator}</div>
          </div>
        `, { closeButton: false, className: "retro-popup" });

      fleetMarkersRef.current.push(marker);
    });
  }, [mapReady, fleetData, layers.fleet]);

  const signs = signsData?.signs || [];
  const compliant = signs.filter((s: any) => s.status === "compliant").length;
  const warning = signs.filter((s: any) => s.status === "warning").length;
  const critical = signs.filter((s: any) => s.status === "critical").length;

  return (
    <Layout>
      <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
        <div className="flex items-start justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Intelligence Map</h1>
            <p className="text-muted-foreground mt-1">Real-time asset positions and fleet tracking across India's National Highways.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={layers.assets ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setLayers(l => ({ ...l, assets: !l.assets }))}
            >
              <MapPin className="h-3.5 w-3.5" /> Assets
            </Button>
            <Button
              variant={layers.fleet ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setLayers(l => ({ ...l, fleet: !l.fleet }))}
            >
              <Layers className="h-3.5 w-3.5" /> Fleet
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
          <Card className="border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-muted-foreground">Compliant</p>
                <p className="font-bold text-green-500">{compliant}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-muted-foreground">Warning</p>
                <p className="font-bold text-amber-500">{warning}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="font-bold text-red-500">{critical}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-muted-foreground">Active Fleet</p>
                <p className="font-bold text-blue-500">{fleetData?.summary?.active ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Map */}
          <div className="flex-1 rounded-xl overflow-hidden border border-border relative">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
            <div ref={mapContainerRef} className="w-full h-full" />
            {!mapReady && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading map...
                </div>
              </div>
            )}

            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1.5 z-[1000]">
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] mb-2">Legend</p>
              {[
                { color: "#22c55e", label: "Compliant" },
                { color: "#f59e0b", label: "Warning" },
                { color: "#ef4444", label: "Critical" },
                { color: "#3b82f6", label: "Active Fleet" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected sign panel */}
          {selectedSign && (
            <div className="w-72 flex-shrink-0">
              <Card className="border-border h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{selectedSign.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1" onClick={() => setSelectedSign(null)}>
                      <span className="text-muted-foreground text-xs">✕</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={
                      selectedSign.status === "compliant" ? "bg-green-600 text-white border-0" :
                      selectedSign.status === "warning" ? "bg-amber-500 text-white border-0" :
                      selectedSign.status === "critical" ? "bg-red-600 text-white border-0" :
                      "bg-muted border-0"
                    }>{selectedSign.status}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{selectedSign.type?.replace(/_/g," ")}</Badge>
                  </div>
                  {selectedSign.chainage && (
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedSign.chainage}</p>
                    </div>
                  )}
                  {selectedSign.location_description && (
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-muted-foreground">{selectedSign.location_description}</p>
                    </div>
                  )}
                  {selectedSign.last_value && (
                    <div>
                      <p className="text-xs text-muted-foreground">Last Reading</p>
                      <p className="font-mono font-bold text-primary text-lg">{selectedSign.last_value} <span className="text-xs text-muted-foreground font-normal">mcd/lx/m²</span></p>
                    </div>
                  )}
                  {selectedSign.last_measured_at && (
                    <div>
                      <p className="text-xs text-muted-foreground">Last Measured</p>
                      <p className="text-muted-foreground">{new Date(selectedSign.last_measured_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  )}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-2">GPS Coordinates</p>
                    <p className="font-mono text-xs text-muted-foreground">{selectedSign.latitude?.toFixed(4)}, {selectedSign.longitude?.toFixed(4)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
