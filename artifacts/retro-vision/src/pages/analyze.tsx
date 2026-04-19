import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAnalyzeImage } from "@workspace/api-client-react";
import { Camera, Zap, AlertTriangle, CheckCircle, XCircle, ChevronRight } from "lucide-react";

function statusBadge(status: string) {
  if (status === "compliant") return <Badge className="bg-green-600 text-white border-0 text-sm px-3 py-1"><CheckCircle className="h-4 w-4 mr-1" />Compliant</Badge>;
  if (status === "warning") return <Badge className="bg-amber-500 text-white border-0 text-sm px-3 py-1"><AlertTriangle className="h-4 w-4 mr-1" />Warning</Badge>;
  return <Badge className="bg-red-600 text-white border-0 text-sm px-3 py-1"><XCircle className="h-4 w-4 mr-1" />Critical</Badge>;
}

const SAMPLE_URLS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/640px-24701-nature-natural-beauty.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/300px-PNG_transparency_demonstration_1.png",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
];

export default function Analyze() {
  const [imageUrl, setImageUrl] = useState("");
  const [condition, setCondition] = useState("night_dry");
  const [signType, setSignType] = useState("traffic_sign");
  const analyzeImage = useAnalyzeImage();

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) return;
    await analyzeImage.mutateAsync({
      data: {
        image_url: imageUrl,
        condition,
        sign_type: signType,
      }
    });
  };

  const result = analyzeImage.data;

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analyzer</h1>
          <p className="text-muted-foreground mt-1">Estimate retroreflectivity from an image using AI and ML analysis.</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Image Analysis</CardTitle>
            <CardDescription>
              Provide the URL of a road sign or pavement marking image. The AI will estimate its retroreflectivity value under the selected conditions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/road-sign.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs text-muted-foreground mr-1">Try sample:</span>
                {SAMPLE_URLS.map((url, i) => (
                  <button key={i} className="text-xs text-primary underline underline-offset-2 hover:no-underline" onClick={() => setImageUrl(url)}>
                    Sample {i+1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Measurement Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["day_dry","day_wet","night_dry","night_wet","foggy","no_street_light","with_street_light"].map(c =>
                      <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Sign / Asset Type</Label>
                <Select value={signType} onValueChange={setSignType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["traffic_sign","pavement_marking","road_stud","delineator","gantry","shoulder_mounted"].map(t =>
                      <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={analyzeImage.isPending || !imageUrl.trim()} size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              {analyzeImage.isPending ? "Analyzing..." : "Run AI Analysis"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <Card className={`border-l-4 ${result.status === "critical" ? "border-l-red-600" : result.status === "warning" ? "border-l-amber-500" : "border-l-green-600"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis Result</CardTitle>
                  {statusBadge(result.status)}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                {/* Main metric */}
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Estimated Retroreflectivity</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold font-mono">{result.estimated_value}</span>
                      <span className="text-muted-foreground">mcd/lx/m²</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium mb-2">AI Confidence</p>
                    <Progress value={result.confidence} className="h-3" />
                    <p className="text-sm font-semibold mt-1">{result.confidence}%</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/40 text-sm text-muted-foreground leading-relaxed">
                  {result.analysis_summary}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Detected Issues */}
                  {result.detected_issues?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2 text-red-500 flex items-center gap-1"><XCircle className="h-4 w-4" /> Detected Issues</p>
                      <ul className="space-y-1">
                        {result.detected_issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2 text-primary flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Recommendations</p>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analyzeImage.isError && (
          <Card className="border-red-600 border-l-4">
            <CardContent className="p-4 text-red-500">
              Analysis failed. Please check the image URL and try again.
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
