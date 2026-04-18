import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { analyzeDataset } from "../services/api";
import { useAuditStore } from "../store/auditStore";

function toBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

export default function NewAudit() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loadingStep, setLoadingStep] = useState<"idle" | "upload" | "parse" | "detect" | "ready">("idle");
  const [rawCsv, setRawCsv] = useState<string>("");
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAnalysis, setLoading, setError } = useAuditStore();

  const handleFile = (file: File) => {
    setLoadingStep("upload");
    void file.text().then((text) => setRawCsv(text));
    Papa.parse<Record<string, string>>(file, {
      header: true,
      complete: (res) => {
        setLoadingStep("parse");
        setRows(res.data.slice(0, 10));
        setTimeout(() => setLoadingStep("detect"), 300);
        setTimeout(() => {
          setLoadingStep("ready");
          toast.success("Dataset parsed and columns detected.");
        }, 700);
      }
    });
  };

  const runAnalyze = async (csvText: string) => {
    if (!csvText) {
      toast.error("Upload or load a dataset first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeDataset({
        dataset_base64: toBase64(csvText),
        target_column: "selected",
        sensitive_attributes: ["gender"],
        favorable_outcome: 1,
      });
      setAnalysis(response);
      toast.success("Bias analysis complete.");
      nav("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoAndAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/demo-datasets/hiring_biased.csv");
      const csvText = await res.text();
      setRawCsv(csvText);
      const parsed = Papa.parse<Record<string, string>>(csvText, { header: true });
      setRows(parsed.data.slice(0, 10));
      setLoadingStep("ready");
      await runAnalyze(csvText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not run demo mode";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("demo") === "1") {
      void loadDemoAndAnalyze();
    }
    // run once on mount for demo deep-link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold">Upload Dataset</h2>
        <p className="mt-1 text-sm text-white/60">
          Progress: Upload {"->"} Parse {"->"} Detect Columns {"->"} Ready
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["hiring", "lending", "medical"].map((name) => (
            <Button key={name} variant="ghost" onClick={() => toast.success(`${name} demo dataset loaded`)}>
              Try Demo: {name}
            </Button>
          ))}
          <Button onClick={() => void loadDemoAndAnalyze()}>Try Demo (Auto Analyze)</Button>
        </div>
        <input
          className="mt-4 block"
          type="file"
          accept=".csv,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFile(file);
            }
          }}
        />
      </Card>
      <Card>
        <h3 className="font-semibold">Preview (first 10 rows)</h3>
        {loadingStep !== "ready" ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="mt-3 overflow-auto">
            <pre className="text-xs">{JSON.stringify(rows, null, 2)}</pre>
          </div>
        )}
        <Button className="mt-4" onClick={() => void runAnalyze(rawCsv)}>
          Analyze for Bias
        </Button>
      </Card>
    </div>
  );
}
