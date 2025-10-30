/**
 * Store Contracts - State Management Interfaces
 * 
 * Defines the shape of all Zustand stores.
 * Each store has separate State and Actions interfaces.
 */

import { Clip, Track, Project, RecordingSource, ExportConfig } from '../types';

// ============================================================================
// TIMELINE STORE CONTRACT
// ============================================================================

export namespace TimelineStoreContract {
  export interface TimelineSnapshot {
    tracks: Track[];
    timestamp: number;
  }

  export interface State {
    // Timeline data
    tracks: Track[];
    duration: number; // total timeline duration (seconds)
    
    // Playback state
    currentTime: number;
    isPlaying: boolean;
    
    // UI state
    zoom: number; // 0.1 to 5.0
    scrollLeft: number; // horizontal scroll position (pixels)
    
    // Snapping
    isGridSnapEnabled: boolean; // snap to grid intervals
    gridSnapSize: number; // grid interval in seconds (default: 1.0)
    
    // Selection state
    selectedClipIds: string[];
    selectedTrackId: string | null;
    
    // Clipboard
    clipboardClips: Clip[];
    
    // History for undo/redo
    history: {
      past: TimelineSnapshot[];
      future: TimelineSnapshot[];
    };
  }

  export interface Actions {
    // Clip operations
    addClip: (clip: Clip, trackId: string, position: number) => void;
    removeClip: (clipId: string) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    moveClip: (clipId: string, newTrackId: string, newPosition: number) => void;
    splitClip: (clipId: string, splitTime: number) => void;
    trimClip: (clipId: string, trimIn: number, trimOut: number) => void;
    
    // Track operations
    addTrack: (name: string) => void;
    removeTrack: (trackId: string) => void;
    updateTrack: (trackId: string, updates: Partial<Track>) => void;
    reorderTracks: (fromIndex: number, toIndex: number) => void;
    
    // Playback operations
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    
    // UI operations
    setZoom: (zoom: number) => void;
    setScrollLeft: (scrollLeft: number) => void;
    toggleGridSnap: () => void;
    
    // Selection operations
    selectClip: (clipId: string, multiSelect?: boolean) => void;
    deselectClip: (clipId: string) => void;
    clearSelection: () => void;
    selectTrack: (trackId: string | null) => void;
    
    // Clipboard operations
    copySelectedClips: () => void;
    cutSelectedClips: () => void;
    pasteClips: (targetTrackId: string, position: number) => void;
    
    // History operations
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
    
    // Bulk operations
    deleteSelectedClips: () => void;
    duplicateSelectedClips: () => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// MEDIA LIBRARY STORE CONTRACT
// ============================================================================

export namespace MediaLibraryStoreContract {
  export interface MediaItem {
    id: string;
    clip: Clip;
    thumbnail?: string; // base64 data URL
    addedAt: Date;
  }

  export interface State {
    items: MediaItem[];
    selectedItemIds: string[];
    sortBy: 'name' | 'date' | 'duration' | 'size';
    sortOrder: 'asc' | 'desc';
    filterText: string;
    isLoading: boolean;
  }

  export interface Actions {
    addItems: (clips: Clip[]) => void;
    removeItem: (itemId: string) => void;
    selectItem: (itemId: string, multiSelect?: boolean) => void;
    deselectItem: (itemId: string) => void;
    clearSelection: () => void;
    setSortBy: (sortBy: State['sortBy']) => void;
    setSortOrder: (sortOrder: State['sortOrder']) => void;
    setFilterText: (text: string) => void;
    setLoading: (loading: boolean) => void;
    updateThumbnail: (itemId: string, thumbnail: string) => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// RECORDING STORE CONTRACT
// ============================================================================

export namespace RecordingStoreContract {
  export interface State {
    // Recording state
    isRecording: boolean;
    sessionId: string | null;
    duration: number; // current recording duration (seconds)
    
    // Source selection
    availableSources: RecordingSource[];
    selectedSourceId: string | null;
    
    // Configuration
    includeAudio: boolean;
    includeWebcam: boolean;
    webcamDeviceId: string | null;
    resolution: { width: number; height: number };
    frameRate: number;
    
    // UI state
    showSourcePicker: boolean;
    countdown: number | null; // 3, 2, 1, null
  }

  export interface Actions {
    // Recording control
    startRecording: (sourceId: string) => Promise<void>;
    stopRecording: () => Promise<string>; // returns output path
    
    // Source management
    loadSources: () => Promise<void>;
    selectSource: (sourceId: string) => void;
    
    // Configuration
    setIncludeAudio: (include: boolean) => void;
    setIncludeWebcam: (include: boolean) => void;
    setWebcamDevice: (deviceId: string | null) => void;
    setResolution: (resolution: { width: number; height: number }) => void;
    setFrameRate: (fps: number) => void;
    
    // UI control
    setShowSourcePicker: (show: boolean) => void;
    startCountdown: () => Promise<void>;
    
    // Internal state updates
    updateDuration: (duration: number) => void;
    setSessionId: (sessionId: string | null) => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// EXPORT STORE CONTRACT
// ============================================================================

export namespace ExportStoreContract {
  export interface State {
    // Export state
    isExporting: boolean;
    exportId: string | null;
    progress: number; // 0-100
    
    // Configuration
    config: ExportConfig;
    
    // Output
    outputPath: string | null;
    
    // UI state
    showExportDialog: boolean;
    
    // Progress details
    currentFrame: number;
    totalFrames: number;
    fps: number;
    eta: number; // seconds remaining
  }

  export interface Actions {
    // Export control
    startExport: (config: ExportConfig) => Promise<void>;
    cancelExport: () => Promise<void>;
    
    // Configuration
    updateConfig: (updates: Partial<ExportConfig>) => void;
    setQuality: (quality: ExportConfig['quality']) => void;
    setResolution: (resolution: { width: number; height: number }) => void;
    
    // UI control
    showDialog: (show: boolean) => void;
    
    // Internal state updates (from IPC events)
    updateProgress: (progress: number, details: {
      currentFrame: number;
      totalFrames: number;
      fps: number;
      eta: number;
    }) => void;
    setOutputPath: (path: string | null) => void;
    setExportId: (exportId: string | null) => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// PROJECT STORE CONTRACT
// ============================================================================

export namespace ProjectStoreContract {
  export interface State {
    project: Project | null;
    currentFilePath: string | null;
    isDirty: boolean; // has unsaved changes
    lastSavedAt: Date | null;
  }

  export interface Actions {
    // Project operations
    newProject: (name: string) => void;
    saveProject: (filePath?: string) => Promise<void>;
    loadProject: (filePath: string) => Promise<void>;
    closeProject: () => void;
    
    // State management
    markDirty: () => void;
    markClean: () => void;
    updateProjectSettings: (settings: Partial<Project['settings']>) => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// WEBCAM STORE CONTRACT
// ============================================================================

export namespace WebcamStoreContract {
  export interface State {
    // Webcam state
    isEnabled: boolean;
    stream: MediaStream | null;
    deviceId: string | null;
    
    // Position and size (percentage of preview area: 0-100)
    position: { x: number; y: number };
    size: { width: number; height: number };
    
    // UI state
    isDragging: boolean;
    isResizing: boolean;
    
    // Error state
    error: string | null;
  }

  export interface Actions {
    // Webcam control
    enableWebcam: (deviceId?: string) => Promise<void>;
    disableWebcam: () => void;
    
    // Position and size
    setPosition: (position: { x: number; y: number }) => void;
    setSize: (size: { width: number; height: number }) => void;
    
    // UI state
    setDragging: (dragging: boolean) => void;
    setResizing: (resizing: boolean) => void;
    
    // Project persistence
    loadFromProject: (settings?: {
      enabled: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
      deviceId?: string;
    }) => void;
    getSettings: () => {
      enabled: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
      deviceId?: string;
    };
    
    // Error handling
    setError: (error: string | null) => void;
  }

  export type Store = State & Actions;
}

// ============================================================================
// APP STORE CONTRACT
// ============================================================================

export namespace AppStoreContract {
  export interface State {
    // App state
    isReady: boolean;
    
    // UI state
    theme: 'dark' | 'light';
    activePanel: 'media' | 'preview' | 'timeline' | 'export';
    
    // Keyboard shortcuts
    keyboardShortcutsEnabled: boolean;
    
    // Performance
    fps: number;
    memoryUsage: number;
  }

  export interface Actions {
    setReady: (ready: boolean) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    setActivePanel: (panel: State['activePanel']) => void;
    toggleKeyboardShortcuts: () => void;
    updatePerformanceMetrics: (fps: number, memory: number) => void;
  }

  export type Store = State & Actions;
}

