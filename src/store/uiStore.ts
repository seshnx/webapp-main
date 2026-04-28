import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
}

/**
 * Global UI Store
 * 
 * Manages cross-cutting UI state like navigation, themes, and layouts.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      darkMode: true, // Default to dark mode
      activeTab: 'dashboard',
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'seshnx-ui-storage',
      partialize: (state) => ({ darkMode: state.darkMode }), // Only persist theme
    }
  )
);
