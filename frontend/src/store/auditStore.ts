import { create } from "zustand";
import type { AnalyzeResponse, MitigateResponse } from "../types/api";

interface AuditState {
  selectedAuditId: string | null;
  latestAnalysis: AnalyzeResponse | null;
  latestMitigation: MitigateResponse | null;
  loading: boolean;
  error: string | null;
  setSelectedAuditId: (id: string) => void;
  setAnalysis: (analysis: AnalyzeResponse | null) => void;
  setMitigation: (mitigation: MitigateResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  selectedAuditId: null,
  latestAnalysis: null,
  latestMitigation: null,
  loading: false,
  error: null,
  setSelectedAuditId: (id) => set({ selectedAuditId: id }),
  setAnalysis: (analysis) => set({ latestAnalysis: analysis }),
  setMitigation: (mitigation) => set({ latestMitigation: mitigation }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
