import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

export default function NewAudit() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loadingStep, setLoadingStep] = useState<"idle" | "upload" | "parse" | "detect" | "ready">("idle");
  const nav = useNavigate();

  const handleFile = (file: File) => {
    setLoadingStep("upload");
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
        <Button className="mt-4" onClick={() => nav("/audit/demo-lending")}>
          Analyze for Bias
        </Button>
      </Card>
    </div>
  );
}
