import { Link } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { SeverityBadge } from "../components/ui/Badge";
import { demoAudit } from "../utils/mockData";
import { Button } from "../components/ui/Button";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Audits", "28"],
          ["Datasets", "12"],
          ["Bias Issues Found", "54"],
          ["Fixed", "37"]
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="text-sm text-white/60">{k}</p>
            <p className="mt-1 text-2xl font-bold">{v}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Audits</h2>
          <Link to="/audit/new">
            <Button>Start New Audit</Button>
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div>
            <p className="font-semibold">{demoAudit.datasetName}</p>
            <p className="text-sm text-white/60">Fairness score: {demoAudit.fairnessScore}</p>
          </div>
          <SeverityBadge severity={demoAudit.severity} />
        </div>
      </Card>
      <Card className="h-72">
        <h2 className="text-xl font-bold">Fairness Score Trend (30 Days)</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { day: "D-30", score: 57 },
                { day: "D-24", score: 61 },
                { day: "D-18", score: 66 },
                { day: "D-12", score: 70 },
                { day: "D-6", score: 73 },
                { day: "Today", score: 68 }
              ]}
            >
              <XAxis dataKey="day" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Line dataKey="score" stroke="#6C47FF" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
