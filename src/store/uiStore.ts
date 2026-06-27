import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface UIStore {
  isDemoMode: boolean;
  activeDocumentTab: 'initial' | 'adversarial' | 'final';
  isSidebarOpen: boolean;
  theme: Theme;
  setDemoMode: (demo: boolean) => void;
  setActiveDocumentTab: (tab: UIStore['activeDocumentTab']) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isDemoMode: false,
      activeDocumentTab: 'initial',
      isSidebarOpen: false,
      theme: 'dark',
      setDemoMode: (demo) => set({ isDemoMode: demo }),
      setActiveDocumentTab: (tab) => set({ activeDocumentTab: tab }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', next);
        }
        set({ theme: next });
      },
    }),
    { name: 'nyay-ui-store' }
  )
);
