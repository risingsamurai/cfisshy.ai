import { create } from "zustand";

interface AuditState {
  selectedAuditId: string | null;
  setSelectedAuditId: (id: string) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  selectedAuditId: null,
  setSelectedAuditId: (id) => set({ selectedAuditId: id })
}));
