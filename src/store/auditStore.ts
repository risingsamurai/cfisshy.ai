import { create } from "zustand";
import { type AuditRecord } from "../services/firestoreService";

interface AuditState {
  selectedAuditId: string | null;
  setSelectedAuditId: (id: string | null) => void;
  audits: AuditRecord[];
  setAudits: (audits: AuditRecord[]) => void;
  loadingAudits: boolean;
  setLoadingAudits: (loading: boolean) => void;
  hasFetchedAudits: boolean;
  setHasFetchedAudits: (fetched: boolean) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  selectedAuditId: null,
  setSelectedAuditId: (id) => set({ selectedAuditId: id }),
  audits: [],
  setAudits: (audits) => set({ audits }),
  loadingAudits: false,
  setLoadingAudits: (loading) => set({ loadingAudits: loading }),
  hasFetchedAudits: false,
  setHasFetchedAudits: (fetched) => set({ hasFetchedAudits: fetched }),
}));
