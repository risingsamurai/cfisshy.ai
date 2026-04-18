import { useMemo } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart
} from "recharts";
import { Card } from "../components/ui/Card";
import { SeverityBadge } from "../components/ui/Badge";
import { FairnessGauge } from "../components/charts/FairnessGauge";
import { demoAudit } from "../utils/mockData";
import { BiasHeatmap } from "../components/charts/BiasHeatmap";
import { MetricCard } from "../components/audit/MetricCard";
import { AIChat } from "../components/ai/AIChat";
import { MitigationCard } from "../components/audit/MitigationCard";
import { useAuditStore } from "../store/auditStore";
import { Button } from "../components/ui/Button";
import { mitigateBias } from "../services/api";

export default function AuditReport() {
  const { latestAnalysis, latestMitigation, setMitigation } = useAuditStore();
  const heatmap = useMemo(() => demoAudit.heatmap, []);
  const metrics = latestAnalysis?.metrics;

  const runMitigation = async () => {
    try {
      const csv = await fetch("/demo-datasets/hiring_biased.csv").then((r) => r.text());
      const payload = {
        dataset_base64: btoa(unescape(encodeURIComponent(csv))),
        target_column: "selected",
        sensitive_attributes: ["gender"],
        favorable_outcome: 1,
      };
      const response = await mitigateBias(payload);
      setMitigation(response);
      toast.success("Mitigation complete.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mitigation failed";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid items-center gap-4 md:grid-cols-2">
            <FairnessGauge score={demoAudit.fairnessScore} />
            <div>
              <p className="text-sm text-white/60">{demoAudit.datasetName}</p>
              <h2 className="mt-2 text-2xl font-bold">Significant Bias Detected</h2>
              <p className="mt-1 text-sm">
                Rows analyzed: {(latestAnalysis?.summary.rows_analyzed ?? demoAudit.rowCount).toLocaleString()} | {demoAudit.createdAt}
              </p>
              <div className="mt-3">
                <SeverityBadge severity={demoAudit.severity} />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">AI Insight</h3>
          <p className="mt-3 text-sm text-white/80">{demoAudit.aiNarrative}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold">Protected Attribute Analysis</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(demoAudit.metrics).map(([attribute, m]) => (
            <div key={attribute} className="rounded-xl bg-white/5 p-3">
              <p className="font-semibold capitalize">{attribute}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <MetricCard
                  label="Disparate Impact"
                  value={metrics?.disparate_impact ?? m.disparateImpact}
                  threshold=">= 0.8"
                />
                <MetricCard
                  label="Statistical Parity Diff"
                  value={metrics?.statistical_parity ?? m.statParityDiff}
                  threshold="|x| <= 0.1"
                />
                <MetricCard
                  label="Equal Opportunity Diff"
                  value={metrics?.equal_opportunity ?? m.equalOpportunityDiff}
                  threshold="|x| <= 0.1"
                />
                <MetricCard label="Average Odds Diff" value={m.averageOddsDiff} threshold="|x| <= 0.1" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold">Bias Heatmap Matrix</h3>
        <div className="mt-4">
          <BiasHeatmap cells={heatmap} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="h-80">
          <h3 className="font-bold">Outcome Distribution by Group</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoAudit.distributions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="group" stroke="#ddd" />
                <YAxis stroke="#ddd" />
                <Tooltip />
                <Bar dataKey="rate" fill="#6C47FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <AIChat
          context={JSON.stringify({
            bias_score: latestAnalysis?.summary.bias_score,
            metrics: latestAnalysis?.metrics,
            top_features: latestAnalysis?.top_features,
          })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold">Intersectional Bias</h3>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoAudit.intersectional}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="group" stroke="#ddd" />
                <YAxis stroke="#ddd" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#00C2A8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">Proxy Variable Detector</h3>
          <div className="mt-3 space-y-2">
            {demoAudit.proxyVariables.map((proxy) => (
              <div key={proxy.feature} className="rounded-lg bg-white/5 p-3 text-sm">
                <p className="font-semibold">{proxy.feature}</p>
                <p className="text-white/70">
                  Correlated with {proxy.protectedAttribute}: {(proxy.correlation * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold">Mitigation Recommendations</h3>
        <Button className="mt-3" onClick={() => void runMitigation()}>
          Run Reweighing Mitigation
        </Button>
        {latestMitigation ? (
          <p className="mt-2 text-sm text-white/70">
            Bias score: {latestMitigation.before.summary.bias_score} {"->"} {latestMitigation.after.summary.bias_score}
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {demoAudit.recommendations.map((r, i) => (
            <MitigationCard key={r.id} recommendation={r} index={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}
