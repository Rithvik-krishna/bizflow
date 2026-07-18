import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  activeBranch: { id: string; name: string } | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveBranch: (branch: { id: string; name: string }) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeBranch: { id: "branch-1", name: "Main HQ (Mumbai)" },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveBranch: (branch) => set({ activeBranch: branch }),
}));
