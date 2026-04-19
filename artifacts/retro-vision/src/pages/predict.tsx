import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingDown, AlertTriangle, CheckCircle, Calendar, Zap, Target } from "lucide-react";
import { format, addDays } from "date-fns";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/analytics/predictions`);
      return r.json();
    },
    staleTime: 60000,
  });
}

function urgencyColor(days: number | null) {
  if (days === null) return "text-muted-foreground";
  if (days <= 30) return "text-red-500";
  if (days <= 90) return "text-amber-500";
  return "text-green-500";
}

function urgencyBg(days: number | null) {
  if (days === null) return "";
  if (days <= 30) return "border-l-4 border-l-red-600";
  if (days <= 90) return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-green-600";
}

function urgencyBadge(days: number | null) {
  if (days === null) return <Badge variant="secondary" className="text-xs">No Prediction</Badge>;
  if (days <= 30) return <Badge className="bg-red-600 text-white border-0 text-xs">Critical in {days}d</Badge>;
  if (days <= 90) return <Badge className="bg-amber-500 text-white border-0 text-xs">Warning in {days}d</Badge>;
  return <Badge className="bg-green-600 text-white border-0 text-xs">Stable — {days}d</Badge>;
}

export default function Predict() {
  const { data, isLoading } = usePredictions();
  const predictions = data?.predictions || [];

  const soonCritical = predictions.filter((p: any) => p.days_to_critical !== null && p.days_to_critical <= 30).length;
  const soonWarning = predictions.filter((p: any) => p.days_to_critical !== null && p.days_to_critical > 30 && p.days_to_critical <= 90).length;
  const stable = predictions.filter((p: any) => p.days_to_critical !== null && p.days_to_critical > 90).length;
  const noPrediction = predictions.filter((p: any) => p.days_to_critical === null).length;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Predictive Maintenance Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Linear regression on historical retroreflectivity data predicts time-to-failure for each asset.
          </p>
        </div>

        {/* Methodology callout */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI / ML Degradation Model</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Uses linear regression (IRC Method ii) on all historical measurements per asset to compute a degradation slope (mcd/lx/m² per day).
                  The model extrapolates to predict the exact date each sign will breach its IRC 67 or IRC 35 minimum threshold.
                  High-confidence predictions use 5+ historical readings; medium uses 2–4.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Critical — 30 Days", value: soonCritical, color: "text-red-500", icon: AlertTriangle },
            { label: "Warning — 90 Days", value: soonWarning, color: "text-amber-500", icon: TrendingDown },
            { label: "Stable Assets", value: stable, color: "text-green-500", icon: CheckCircle },
            { label: "Needs More Data", value: noPrediction, color: "text-muted-foreground", icon: Target },
          ].map(item => (
            <Card key={item.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-2xl font-bold mt-1 ${item.color}`}>{isLoading ? "—" : item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Predictions list */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Asset Failure Timeline</CardTitle>
            <CardDescription>Assets sorted by urgency — soonest predicted failure first. Schedule proactive maintenance before breach.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Asset</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Current Value</th>
                    <th className="px-4 py-3 text-left font-medium">Minimum</th>
                    <th className="px-4 py-3 text-left font-medium">Degradation</th>
                    <th className="px-4 py-3 text-left font-medium">Predicted Failure</th>
                    <th className="px-4 py-3 text-left font-medium">Confidence</th>
                    <th className="px-4 py-3 text-left font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? Array.from({length:8}).map((_,i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({length:8}).map((_,j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 w-full bg-muted rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  )) : predictions.map((p: any) => (
                    <tr key={p.sign_id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${urgencyBg(p.days_to_critical)}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.sign_name}</div>
                        {p.chainage && <div className="text-xs text-muted-foreground">{p.chainage}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{p.type?.replace(/_/g," ")}</td>
                      <td className="px-4 py-3">
                        {p.last_value !== null && p.last_value !== undefined ? (
                          <span className="font-mono font-semibold">{p.last_value} <span className="text-xs text-muted-foreground font-normal">mcd</span></span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.min_required}</td>
                      <td className="px-4 py-3">
                        {p.degradation_rate !== null ? (
                          <span className={`font-semibold text-xs ${p.degradation_rate > 0 ? "text-red-400 flex items-center gap-1" : "text-muted-foreground"}`}>
                            {p.degradation_rate > 0 ? <TrendingDown className="h-3 w-3" /> : null}
                            {p.degradation_rate > 0 ? `-${p.degradation_rate}/mo` : "Stable"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.predicted_critical_date ? (
                          <div>
                            <div className={`font-semibold text-xs ${urgencyColor(p.days_to_critical)}`}>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(new Date(p.predicted_critical_date), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">{p.days_to_critical} days remaining</div>
                          </div>
                        ) : <span className="text-muted-foreground text-xs">Stable / Improving</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs capitalize">{p.confidence}</Badge>
                      </td>
                      <td className="px-4 py-3">{urgencyBadge(p.days_to_critical)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance schedule recommendation */}
        {predictions.filter((p: any) => p.days_to_critical !== null && p.days_to_critical <= 90).length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" /> Recommended Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions
                  .filter((p: any) => p.days_to_critical !== null && p.days_to_critical <= 90)
                  .slice(0, 5)
                  .map((p: any) => (
                    <div key={p.sign_id} className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border">
                      <div>
                        <span className="font-medium text-sm">{p.sign_name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{p.chainage}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground text-xs">Inspect by:</span>
                        <Badge className={p.days_to_critical <= 30 ? "bg-red-600 text-white border-0" : "bg-amber-500 text-white border-0"}>
                          {format(addDays(new Date(), Math.max(1, (p.days_to_critical || 30) - 14)), "MMM d, yyyy")}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
