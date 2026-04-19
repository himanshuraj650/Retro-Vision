import { Router } from "express";

const router = Router();

// AI Analysis of image for retroreflectivity
router.post("/upload/analyze", async (req, res) => {
  try {
    const { image_url, sign_type, condition } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    // Simulate AI analysis based on image_url hash + randomness for demo
    // In production this would call a real ML model (TensorFlow, PyTorch, etc.)
    const hash = image_url.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const seed = hash % 100;

    let estimated_value: number;
    let status: string;
    const recommendations: string[] = [];
    const detected_issues: string[] = [];

    if (seed < 20) {
      // Critical
      estimated_value = Math.round((50 + seed * 0.8) * 10) / 10;
      status = "critical";
      detected_issues.push("Severely faded retroreflective sheeting");
      detected_issues.push("Surface corrosion detected");
      detected_issues.push("Delamination observed in upper quadrant");
      recommendations.push("Immediate replacement required within 48 hours");
      recommendations.push("Schedule emergency maintenance crew");
      recommendations.push("Install temporary hazard markers until replacement");
    } else if (seed < 50) {
      // Warning
      estimated_value = Math.round((80 + seed * 0.6) * 10) / 10;
      status = "warning";
      detected_issues.push("Partial fading on reflective surface");
      detected_issues.push("Minor dirt accumulation detected");
      recommendations.push("Schedule cleaning and inspection within 30 days");
      recommendations.push("Monitor retroreflectivity every 15 days");
      recommendations.push("Clean surface and re-measure after cleaning");
    } else {
      // Compliant
      estimated_value = Math.round((150 + seed * 1.5) * 10) / 10;
      status = "compliant";
      recommendations.push("Continue standard inspection cycle");
      recommendations.push("Next measurement due in 90 days");
    }

    const confidence = Math.round((70 + (hash % 25)) * 10) / 10;

    const conditionLabel = condition
      ? condition.replace(/_/g, " ")
      : "standard";

    const analysis_summary = `AI analysis of the provided image indicates a retroreflectivity value of approximately ${estimated_value} mcd/lx/m² under ${conditionLabel} conditions. Confidence: ${confidence}%. The sign is classified as ${status.toUpperCase()}${status !== "compliant" ? " and requires attention" : ""}.`;

    res.json({
      estimated_value,
      confidence,
      status,
      recommendations,
      detected_issues,
      analysis_summary,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
