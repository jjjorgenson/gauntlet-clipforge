/**
 * Webcam Store - Zustand Implementation
 * 
 * Manages webcam overlay state, position, size, and stream.
 * Implements WebcamStoreContract interface.
 */

import { create } from 'zustand';
import { WebcamStoreContract } from '../../shared/contracts/stores';

// Default webcam state - bottom-right corner
const defaultState: WebcamStoreContract.State = {
  isEnabled: false,
  stream: null,
  deviceId: null,
  position: { x: 70, y: 70 }, // 70% right, 70% down (bottom-right with more space)
  size: { width: 25, height: 18.75 }, // 25% width, 18.75% height (maintains 4:3 aspect ratio: 25 * 3/4 = 18.75)
  isDragging: false,
  isResizing: false,
  error: null
};

// Webcam Store Implementation
export const useWebcamStore = create<WebcamStoreContract.Store>((set, get) => ({
  ...defaultState,

  // ============================================================================
  // WEBCAM CONTROL
  // ============================================================================

  enableWebcam: async (deviceId?: string) => {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      set({
        isEnabled: true,
        stream,
        deviceId: deviceId || null,
        error: null
      });

      console.log('✅ Webcam enabled:', deviceId || 'default device');
    } catch (error) {
      console.error('❌ Failed to enable webcam:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to access webcam. Please check permissions.';
      
      set({
        isEnabled: false,
        stream: null,
        error: errorMessage
      });
      
      throw error;
    }
  },

  disableWebcam: () => {
    const { stream } = get();
    
    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    set({
      isEnabled: false,
      stream: null,
      error: null
    });

    console.log('🔴 Webcam disabled');
  },

  // ============================================================================
  // POSITION AND SIZE
  // ============================================================================

  setPosition: (position: { x: number; y: number }) => {
    // Clamp values to 0-100
    const clampedPosition = {
      x: Math.max(0, Math.min(100, position.x)),
      y: Math.max(0, Math.min(100, position.y))
    };

    set({ position: clampedPosition });
  },

  setSize: (size: { width: number; height: number }) => {
    // Clamp values to reasonable ranges (5-50% for width, 5-40% for height)
    const clampedSize = {
      width: Math.max(5, Math.min(50, size.width)),
      height: Math.max(5, Math.min(40, size.height))
    };

    set({ size: clampedSize });
  },

  // ============================================================================
  // UI STATE
  // ============================================================================

  setDragging: (dragging: boolean) => {
    set({ isDragging: dragging });
  },

  setResizing: (resizing: boolean) => {
    set({ isResizing: resizing });
  },

  // ============================================================================
  // PROJECT PERSISTENCE
  // ============================================================================

  loadFromProject: (settings) => {
    if (!settings) {
      // No settings - use defaults (match defaultState)
      set({
        isEnabled: false,
        position: { x: 70, y: 70 },
        size: { width: 25, height: 18.75 },
        deviceId: null
      });
      return;
    }

    // Load settings but don't enable webcam automatically
    // User must manually enable it, but position/size are restored
    set({
      isEnabled: false, // Don't auto-enable
      position: settings.position,
      size: settings.size,
      deviceId: settings.deviceId || null
    });

    console.log('📥 Loaded webcam settings from project:', settings);
  },

  getSettings: () => {
    const state = get();
    return {
      enabled: state.isEnabled,
      position: state.position,
      size: state.size,
      deviceId: state.deviceId || undefined
    };
  },

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  setError: (error: string | null) => {
    set({ error });
  }
}));

