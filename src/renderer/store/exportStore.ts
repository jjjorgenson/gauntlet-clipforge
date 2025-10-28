/**
 * Export Store - Zustand Implementation
 * 
 * Manages export state, progress tracking, and configuration.
 * Implements ExportStoreContract interface.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  ExportStoreContract
} from '../../shared/contracts/stores';
import { ExportConfig } from '../../shared/types';

// Default export state
const defaultState: ExportStoreContract.State = {
  isExporting: false,
  exportId: null,
  progress: 0,
  config: {
    outputPath: '',
    quality: 'high',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    codec: 'h264'
  },
  outputPath: null,
  showExportDialog: false,
  currentFrame: 0,
  totalFrames: 0,
  fps: 0,
  eta: 0
};

// Helper functions
const createExportId = (): string => `export_${uuidv4()}`;

const calculateETA = (
  currentFrame: number, 
  totalFrames: number, 
  fps: number
): number => {
  if (fps === 0 || totalFrames === 0) return 0;
  const remainingFrames = totalFrames - currentFrame;
  return remainingFrames / fps;
};

// Export Store Implementation
export const useExportStore = create<ExportStoreContract.Store>((set, get) => ({
  ...defaultState,

  // ============================================================================
  // EXPORT CONTROL
  // ============================================================================

  startExport: async (config: ExportConfig) => {
    const exportId = createExportId();
    
    set({
      isExporting: true,
      exportId,
      config,
      progress: 0,
      currentFrame: 0,
      totalFrames: 0,
      fps: 0,
      eta: 0,
      showExportDialog: true
    });

    // Mock export process - in real implementation, this would trigger IPC
    try {
      // Simulate export progress updates
      const mockTotalFrames = 3000; // 100 seconds at 30fps
      const mockFPS = 25; // Encoding FPS
      
      set({ totalFrames: mockTotalFrames });
      
      // Simulate progress updates
      for (let frame = 0; frame <= mockTotalFrames; frame += 30) {
        if (!get().isExporting) break; // Check if cancelled
        
        const progress = (frame / mockTotalFrames) * 100;
        const eta = calculateETA(frame, mockTotalFrames, mockFPS);
        
        set({
          currentFrame: frame,
          progress,
          fps: mockFPS,
          eta
        });
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Export complete
      set({
        isExporting: false,
        progress: 100,
        outputPath: config.outputPath
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      set({
        isExporting: false,
        exportId: null
      });
    }
  },

  cancelExport: async () => {
    set({
      isExporting: false,
      exportId: null,
      progress: 0,
      currentFrame: 0,
      totalFrames: 0,
      fps: 0,
      eta: 0
    });
  },

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  updateConfig: (updates: Partial<ExportConfig>) => {
    set((state) => ({
      config: { ...state.config, ...updates }
    }));
  },

  setQuality: (quality: ExportConfig['quality']) => {
    set((state) => ({
      config: { ...state.config, quality }
    }));
  },

  setResolution: (resolution: { width: number; height: number }) => {
    set((state) => ({
      config: { ...state.config, resolution }
    }));
  },

  // ============================================================================
  // UI CONTROL
  // ============================================================================

  showDialog: (show: boolean) => {
    set({ showExportDialog: show });
  },

  // ============================================================================
  // INTERNAL STATE UPDATES (from IPC events)
  // ============================================================================

  updateProgress: (progress: number, details: {
    currentFrame: number;
    totalFrames: number;
    fps: number;
    eta: number;
  }) => {
    set({
      progress: Math.max(0, Math.min(100, progress)),
      currentFrame: details.currentFrame,
      totalFrames: details.totalFrames,
      fps: details.fps,
      eta: details.eta
    });
  },

  setOutputPath: (path: string | null) => {
    set({ outputPath: path });
  },

  setExportId: (exportId: string | null) => {
    set({ exportId });
  }
}));
