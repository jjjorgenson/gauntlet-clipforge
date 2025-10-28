/**
 * App Store - Zustand Implementation with Persist Middleware
 * 
 * Manages app-wide state, theme, and performance metrics.
 * Implements AppStoreContract interface with persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AppStoreContract 
} from '../../shared/contracts/stores';

// Default app state
const defaultState: AppStoreContract.State = {
  isReady: false,
  theme: 'dark',
  activePanel: 'media',
  keyboardShortcutsEnabled: true,
  fps: 0,
  memoryUsage: 0
};

// App Store Implementation with Persist Middleware
export const useAppStore = create<AppStoreContract.Store>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ============================================================================
      // APP STATE
      // ============================================================================

      setReady: (ready: boolean) => {
        set({ isReady: ready });
      },

      // ============================================================================
      // UI STATE
      // ============================================================================

      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
      },

      setActivePanel: (panel: AppStoreContract.State['activePanel']) => {
        set({ activePanel: panel });
      },

      toggleKeyboardShortcuts: () => {
        set((state) => ({
          keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled
        }));
      },

      // ============================================================================
      // PERFORMANCE METRICS
      // ============================================================================

      updatePerformanceMetrics: (fps: number, memory: number) => {
        set({
          fps: Math.round(fps),
          memoryUsage: Math.round(memory)
        });
      }
    }),
    {
      name: 'clipforge-app-store',
      partialize: (state) => ({
        // Only persist UI preferences, not runtime state
        theme: state.theme,
        keyboardShortcutsEnabled: state.keyboardShortcutsEnabled,
        activePanel: state.activePanel
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);
