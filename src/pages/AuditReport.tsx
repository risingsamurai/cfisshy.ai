import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
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
import { firestoreService, type AuditRecord } from "../services/firestoreService";
import { Skeleton } from "../components/ui/Skeleton";
import { Timestamp } from "firebase/firestore";

export default function AuditReport() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      if (!id) return;
      if (id === "demo-lending") {
        // Mock to AuditRecord mapping
        setAudit({
          id: demoAudit.id,
          userId: "demo",
          datasetName: demoAudit.datasetName,
          createdAt: Timestamp.fromDate(new Date(demoAudit.createdAt)),
          biasScore: demoAudit.fairnessScore,
          metrics: demoAudit.metrics,
          summary: demoAudit.aiNarrative,
          top_features: [],
          recommendations: demoAudit.recommendations,
          rowCount: demoAudit.rowCount,
          severity: demoAudit.severity,
          distributions: demoAudit.distributions,
          heatmap: demoAudit.heatmap,
          intersectional: demoAudit.intersectional,
          proxyVariables: demoAudit.proxyVariables
        });
        setLoading(false);
        return;
      }
      try {
        const data = await firestoreService.getAuditById(id);
        setAudit(data);
      } catch (err) {
        console.error("Failed to load audit", err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [id]);

  const heatmap = useMemo(() => audit?.heatmap || [], [audit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!audit) {
    return <Card><p>Audit not found.</p></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid items-center gap-4 md:grid-cols-2">
            <FairnessGauge score={audit.biasScore} />
            <div>
              <p className="text-sm text-white/60">{audit.datasetName}</p>
              <h2 className="mt-2 text-2xl font-bold">Significant Bias Detected</h2>
              <p className="mt-1 text-sm">
                Rows analyzed: {audit.rowCount?.toLocaleString() || "N/A"} | {audit.createdAt && typeof audit.createdAt === "object" && "toDate" in audit.createdAt ? audit.createdAt.toDate().toLocaleString() : new Date(audit.createdAt as any).toLocaleString()}
              </p>
              <div className="mt-3">
                {audit.severity && <SeverityBadge severity={audit.severity} />}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">AI Insight</h3>
          <p className="mt-3 text-sm text-white/80">{audit.summary}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold">Protected Attribute Analysis</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(audit.metrics || {}).map(([attribute, m]: [string, any]) => (
            <div key={attribute} className="rounded-xl bg-white/5 p-3">
              <p className="font-semibold capitalize">{attribute}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <MetricCard label="Disparate Impact" value={m.disparateImpact} threshold=">= 0.8" />
                <MetricCard label="Statistical Parity Diff" value={m.statParityDiff} threshold="|x| <= 0.1" />
                <MetricCard
                  label="Equal Opportunity Diff"
                  value={m.equalOpportunityDiff}
                  threshold="|x| <= 0.1"
                />
                <MetricCard label="Average Odds Diff" value={m.averageOddsDiff} threshold="|x| <= 0.1" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {heatmap.length > 0 && (
        <Card>
          <h3 className="font-bold">Bias Heatmap Matrix</h3>
          <div className="mt-4">
            <BiasHeatmap cells={heatmap} />
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {audit.distributions && (
          <Card className="h-80">
            <h3 className="font-bold">Outcome Distribution by Group</h3>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audit.distributions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="group" stroke="#ddd" />
                  <YAxis stroke="#ddd" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#6C47FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        <AIChat context={JSON.stringify(audit)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {audit.intersectional && (
          <Card>
            <h3 className="font-bold">Intersectional Bias</h3>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={audit.intersectional}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="group" stroke="#ddd" />
                  <YAxis stroke="#ddd" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#00C2A8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {audit.proxyVariables && (
          <Card>
            <h3 className="font-bold">Proxy Variable Detector</h3>
            <div className="mt-3 space-y-2">
              {audit.proxyVariables.map((proxy: any) => (
                <div key={proxy.feature} className="rounded-lg bg-white/5 p-3 text-sm">
                  <p className="font-semibold">{proxy.feature}</p>
                  <p className="text-white/70">
                    Correlated with {proxy.protectedAttribute}: {(proxy.correlation * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card>
        <h3 className="font-bold">Mitigation Recommendations</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {audit.recommendations?.map((r: any, i: number) => (
            <MitigationCard key={r.id || i} recommendation={r} index={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}
