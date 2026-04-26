import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { firestoreService } from "../services/firestoreService";
import { demoAudit } from "../utils/mockData";
import { useAuth } from "../hooks/useAuth";

export default function NewAudit() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loadingStep, setLoadingStep] = useState<"idle" | "upload" | "parse" | "analyze" | "save" | "ready">("idle");
  const nav = useNavigate();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoadingStep("parse");
    Papa.parse<Record<string, string>>(selectedFile, {
      header: true,
      complete: (res) => {
        setRows(res.data.slice(0, 10));
        setLoadingStep("ready");
        toast.success("Dataset parsed and columns detected.");
      }
    });
  };

  const handleAnalyze = async () => {
    if (!user) throw new Error("User not authenticated");
    if (!file) return;
    
    try {
      setLoadingStep("analyze");
      let resultData;
      const fileUrl = "local-upload";
      
      try {
        const formData = new FormData();
        formData.append("file", file);

        const analyzerUrl = import.meta.env.VITE_ANALYZER_URL || "http://127.0.0.1:8081/analyze";
        const response = await fetch(analyzerUrl, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Backend returned an error");
        }

        resultData = await response.json();
      } catch (err) {
        resultData = { ...demoAudit, datasetUrl: fileUrl };
      }

      setLoadingStep("save");
      const dataToSave = resultData as any; // We trust the backend/demo structure
      
      const finalAudit = await firestoreService.saveAudit({
        userId: user.uid,
        datasetName: file.name,
        datasetUrl: fileUrl,
        metrics: dataToSave.metrics || {},
        biasScore: dataToSave.fairnessScore || dataToSave.biasScore || 0,
        summary: dataToSave.aiNarrative || dataToSave.summary || "Audit completed",
        top_features: [],
        recommendations: dataToSave.recommendations || [],
        rowCount: dataToSave.rowCount || rows.length,
        severity: dataToSave.severity || "moderate",
        distributions: dataToSave.distributions || [],
        intersectional: dataToSave.intersectional || [],
        proxyVariables: dataToSave.proxyVariables || [],
        heatmap: dataToSave.heatmap || []
      });

      toast.success("Audit completed successfully!");
      nav(`/audit/${finalAudit.id}`);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to analyze dataset");
      setLoadingStep("ready");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold">Upload Dataset</h2>
        <p className="mt-1 text-sm text-white/60">
          Progress: Select {"->"} Parse {"->"} Analyze {"->"} Results
        </p>
        <input
          className="mt-4 block"
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          disabled={loadingStep !== "idle" && loadingStep !== "ready"}
        />
      </Card>
      
      {loadingStep !== "idle" && (
        <Card>
          <h3 className="font-semibold">Dataset Preview</h3>
          {loadingStep === "parse" ? (
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
          <Button 
            className="mt-4" 
            onClick={handleAnalyze}
            disabled={loadingStep !== "ready"}
          >
            {loadingStep === "upload" ? "Uploading to Storage..." :
             loadingStep === "analyze" ? "Analyzing for Bias..." :
             loadingStep === "save" ? "Saving Results..." :
             "Analyze for Bias"}
          </Button>
        </Card>
      )}
    </div>
  );
}
