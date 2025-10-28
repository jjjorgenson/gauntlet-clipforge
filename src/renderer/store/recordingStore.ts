/**
 * Recording Store - Zustand Implementation
 * 
 * Manages recording state, source selection, and configuration.
 * Implements RecordingStoreContract interface.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  RecordingStoreContract
} from '../../shared/contracts/stores';
import { RecordingSource } from '../../shared/types';

// Default recording state
const defaultState: RecordingStoreContract.State = {
  isRecording: false,
  sessionId: null,
  duration: 0,
  availableSources: [],
  selectedSourceId: null,
  includeAudio: true,
  includeWebcam: false,
  webcamDeviceId: null,
  resolution: { width: 1920, height: 1080 },
  frameRate: 30,
  showSourcePicker: false,
  countdown: null
};

// Helper functions
const createSessionId = (): string => `recording_${uuidv4()}`;

const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Recording Store Implementation
export const useRecordingStore = create<RecordingStoreContract.Store>((set, get) => {
  const store = {
    ...defaultState,

    // ============================================================================
    // RECORDING CONTROL
    // ============================================================================

    startRecording: async (sourceId: string) => {
      const sessionId = createSessionId();
      
      set({
        isRecording: true,
        sessionId,
        selectedSourceId: sourceId,
        duration: 0,
        showSourcePicker: false
      });

      // Start countdown
      await get().startCountdown();
    },

    stopRecording: async (): Promise<string> => {
      const state = get();
      
      set({
        isRecording: false,
        sessionId: null,
        duration: 0,
        countdown: null
      });

      // Return mock output path - in real implementation, this would come from IPC
      return `recording_${state.sessionId}.webm`;
    },

    // ============================================================================
    // SOURCE MANAGEMENT
    // ============================================================================

    loadSources: async () => {
      set({});
      
      try {
        // Mock sources - in real implementation, this would come from IPC
        const mockSources: RecordingSource[] = [
          {
            id: 'screen_1',
            name: 'Entire Screen',
            type: 'screen',
            thumbnail: 'data:image/png;base64,mock_screen_thumbnail'
          },
          {
            id: 'window_1',
            name: 'Chrome Browser',
            type: 'window',
            thumbnail: 'data:image/png;base64,mock_window_thumbnail'
          }
        ];

        set({ 
          availableSources: mockSources
        });
      } catch (error) {
        console.error('Failed to load recording sources:', error);
        set({ 
          availableSources: []
        });
      }
    },

    selectSource: (sourceId: string) => {
      set({ selectedSourceId: sourceId });
    },

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    setIncludeAudio: (include: boolean) => {
      set({ includeAudio: include });
    },

    setIncludeWebcam: (include: boolean) => {
      set({ 
        includeWebcam: include,
        webcamDeviceId: include ? get().webcamDeviceId : null
      });
    },

    setWebcamDevice: (deviceId: string | null) => {
      set({ webcamDeviceId: deviceId });
    },

    setResolution: (resolution: { width: number; height: number }) => {
      set({ resolution });
    },

    setFrameRate: (fps: number) => {
      set({ frameRate: Math.max(1, Math.min(60, fps)) });
    },

    // ============================================================================
    // UI CONTROL
    // ============================================================================

    setShowSourcePicker: (show: boolean) => {
      set({ showSourcePicker: show });
    },

    startCountdown: async () => {
      set({ countdown: 3 });
      await sleep(1000);
      
      set({ countdown: 2 });
      await sleep(1000);
      
      set({ countdown: 1 });
      await sleep(1000);
      
      set({ countdown: null });
    },

    // ============================================================================
    // INTERNAL STATE UPDATES
    // ============================================================================

    updateDuration: (duration: number) => {
      set({ duration: Math.max(0, duration) });
    },

    setSessionId: (sessionId: string | null) => {
      set({ sessionId });
    }
  };

  return store as RecordingStoreContract.Store;
});
