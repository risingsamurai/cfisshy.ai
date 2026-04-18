import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { firebaseEnabled } from "../services/firebase";

export default function Landing() {
  const nav = useNavigate();
  const { signInWithGoogle, user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold tracking-tight"
      >
        Detect Bias. Build Fairness. Deploy With Confidence.
      </motion.h1>
      <p className="mt-4 max-w-2xl text-white/70">
        LUMIS.AII helps teams proactively detect and mitigate unfair outcomes in AI models.
      </p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-4 py-2 text-sm"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-secondary" />
        2.3B people affected by biased AI annually
      </motion.div>
      <div className="mt-8 flex gap-3">
        {user ? (
          <Button onClick={() => nav("/dashboard")}>Go to Dashboard</Button>
        ) : (
          <Button
            onClick={() => {
              if (!firebaseEnabled) {
                toast("Add Firebase env vars to enable Google Sign-In.");
                return;
              }
              void signInWithGoogle();
            }}
          >
            Sign in with Google
          </Button>
        )}
        <Button variant="ghost" onClick={() => nav("/audit/new")}>
          Try Demo
        </Button>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Hiring", "Lending", "Healthcare", "Criminal Justice"].map((domain) => (
          <Card key={domain}>
            <p className="text-sm text-white/60">Use Case</p>
            <p className="mt-2 text-xl font-bold">{domain}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["1", "Upload", "Bring CSV/JSON datasets or choose demo data."],
          ["2", "Analyze", "Compute AIF360 metrics and compliance checks."],
          ["3", "Fix", "Generate mitigation plans with Gemini guidance."]
        ].map(([step, title, copy]) => (
          <Card key={title}>
            <p className="text-xs text-brand-secondary">Step {step}</p>
            <p className="mt-1 font-bold">{title}</p>
            <p className="mt-1 text-sm text-white/70">{copy}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
