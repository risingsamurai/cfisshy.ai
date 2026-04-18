export interface AnalyzeRequest {
  dataset: string;
  target_column: string;
  protected_attributes: string[];
  favorable_outcome: string;
}

export async function analyzeDataset(payload: AnalyzeRequest) {
  const res = await fetch(import.meta.env.VITE_ANALYZER_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to analyze dataset");
  }
  return res.json();
}
