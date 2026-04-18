import type { AnalyzeResponse, MitigateResponse } from "../types/api";

export interface AnalyzePayload {
  dataset_base64: string;
  target_column: string;
  sensitive_attributes: string[];
  favorable_outcome: string | number;
  top_k_features?: number;
}

async function postJson<T>(path: string, payload: object): Promise<T> {
  const baseUrl = (import.meta.env.VITE_ANALYZER_BASE_URL as string | undefined) ?? "http://127.0.0.1:8081";
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as T | { error?: string };
  if (!response.ok) {
    const message = typeof body === "object" && body && "error" in body ? body.error : "API request failed";
    throw new Error(message || "API request failed");
  }
  return body as T;
}

export function analyzeDataset(payload: AnalyzePayload) {
  return postJson<AnalyzeResponse>("/analyze", payload);
}

export function mitigateBias(payload: AnalyzePayload) {
  return postJson<MitigateResponse>("/mitigate", payload);
}
