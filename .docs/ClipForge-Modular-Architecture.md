# ClipForge Modular Architecture
## Parallel Development Contract Specification

**Version:** 1.0  
**Date:** October 27, 2025  
**Status:** Contract Specification  
**Architect:** Winston (BMAD)  
**Purpose:** Enable parallel development by multiple agents without file conflicts

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [IPC Contracts (Main ↔ Renderer)](#2-ipc-contracts-main--renderer)
3. [Store Interfaces](#3-store-interfaces)
4. [Component Props Interfaces](#4-component-props-interfaces)
5. [Service Interfaces](#5-service-interfaces)
6. [File Ownership Matrix](#6-file-ownership-matrix)
7. [Development Modules](#7-development-modules)
8. [Integration Points](#8-integration-points)
9. [Testing Contracts](#9-testing-contracts)

---

## 1. Architecture Philosophy

### 1.1 Modular Principles

**Contract-Driven Development:**
- Interfaces defined first, implementation follows
- Type-safe contracts ensure integration points never break
- Each module has clear inputs/outputs
- Zero coupling between parallel workstreams

**Clear Boundaries:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Module Boundaries                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Module A  ──[Contract Interface]──▶  Module B              │
│                                                              │
│  - Owns files in /moduleA/                                   │
│  - Implements ContractA                                      │
│  - Consumes ContractB (read-only)                            │
│  - No direct file imports from Module B                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Communication Rules

**Module Communication:**
1. **Type Contracts** - Shared interfaces in `src/shared/types/`
2. **Store Contracts** - State interfaces in `src/shared/contracts/stores.ts`
3. **IPC Contracts** - Message interfaces in `src/shared/contracts/ipc.ts`
4. **Component Contracts** - Props interfaces in `src/shared/contracts/components.ts`

**No Direct Coupling:**
- Modules import only from `src/shared/contracts/`
- Implementation details never exposed
- Changes to internal logic don't affect other modules

---

## 2. IPC Contracts (Main ↔ Renderer)

### 2.1 IPC Contract Definition

**File:** `src/shared/contracts/ipc.ts`

```typescript
/**
 * IPC Contracts - Main ↔ Renderer Communication
 * 
 * This file defines ALL IPC messages between processes.
 * CRITICAL: This is a shared contract - any changes require team coordination.
 * 
 * Convention:
 * - Channel names: 'domain:action' (e.g., 'media:import')
 * - Request types: {Domain}{Action}Request
 * - Response types: {Domain}{Action}Response
 * - Events: {Domain}{Action}Event
 */

import { 
  Clip, 
  VideoMetadata, 
  RecordingSource, 
  RecordingConfig,
  ExportConfig,
  ExportProgress,
  Project 
} from '../types';

// ============================================================================
// MEDIA IPC CONTRACTS
// ============================================================================

export namespace MediaIPC {
  // Import videos
  export interface ImportRequest {
    filePaths: string[];
  }
  
  export interface ImportResponse {
    clips: Clip[];
    errors?: Array<{ path: string; error: string }>;
  }
  
  // Get metadata
  export interface GetMetadataRequest {
    filePath: string;
  }
  
  export interface GetMetadataResponse {
    metadata: VideoMetadata;
  }
  
  // Open file picker
  export interface OpenFilePickerRequest {
    allowMultiple?: boolean;
    filters?: Array<{ name: string; extensions: string[] }>;
  }
  
  export interface OpenFilePickerResponse {
    filePaths: string[] | null; // null if cancelled
  }
  
  // Generate thumbnail
  export interface GenerateThumbnailRequest {
    filePath: string;
    timestamp: number; // seconds
    width: number;
    height: number;
  }
  
  export interface GenerateThumbnailResponse {
    thumbnail: string; // base64 data URL
  }
}

// ============================================================================
// RECORDING IPC CONTRACTS
// ============================================================================

export namespace RecordingIPC {
  // Get available sources
  export interface GetSourcesRequest {
    types: Array<'screen' | 'window'>;
  }
  
  export interface GetSourcesResponse {
    sources: RecordingSource[];
  }
  
  // Start recording
  export interface StartRecordingRequest {
    sourceId: string;
    config: RecordingConfig;
  }
  
  export interface StartRecordingResponse {
    sessionId: string;
  }
  
  // Stop recording
  export interface StopRecordingRequest {
    sessionId: string;
  }
  
  export interface StopRecordingResponse {
    outputPath: string;
    duration: number;
  }
  
  // Save recording blob (from renderer)
  export interface SaveRecordingRequest {
    buffer: Buffer;
    filename: string;
  }
  
  export interface SaveRecordingResponse {
    outputPath: string;
  }
  
  // Recording progress event
  export interface RecordingProgressEvent {
    sessionId: string;
    duration: number; // current duration in seconds
    fileSize: number; // current size in bytes
  }
}

// ============================================================================
// EXPORT IPC CONTRACTS
// ============================================================================

export namespace ExportIPC {
  // Start export
  export interface StartExportRequest {
    config: ExportConfig;
    timeline: {
      tracks: any[]; // Full timeline state
    };
  }
  
  export interface StartExportResponse {
    exportId: string;
  }
  
  // Cancel export
  export interface CancelExportRequest {
    exportId: string;
  }
  
  export interface CancelExportResponse {
    success: boolean;
  }
  
  // Export progress event
  export interface ExportProgressEvent {
    exportId: string;
    progress: ExportProgress;
  }
  
  // Export complete event
  export interface ExportCompleteEvent {
    exportId: string;
    success: boolean;
    outputPath?: string;
    error?: string;
  }
}

// ============================================================================
// PROJECT IPC CONTRACTS
// ============================================================================

export namespace ProjectIPC {
  // Save project
  export interface SaveProjectRequest {
    project: Project;
    filePath?: string; // undefined = prompt user
  }
  
  export interface SaveProjectResponse {
    filePath: string;
  }
  
  // Load project
  export interface LoadProjectRequest {
    filePath: string;
  }
  
  export interface LoadProjectResponse {
    project: Project;
  }
  
  // Open save dialog
  export interface OpenSaveDialogRequest {
    defaultPath?: string;
    defaultName?: string;
  }
  
  export interface OpenSaveDialogResponse {
    filePath: string | null; // null if cancelled
  }
  
  // Open open dialog
  export interface OpenProjectDialogRequest {
    // no params
  }
  
  export interface OpenProjectDialogResponse {
    filePath: string | null;
  }
}

// ============================================================================
// SYSTEM IPC CONTRACTS
// ============================================================================

export namespace SystemIPC {
  // Get path
  export interface GetPathRequest {
    name: 'home' | 'desktop' | 'documents' | 'downloads' | 'videos' | 'temp';
  }
  
  export interface GetPathResponse {
    path: string;
  }
  
  // Show item in folder
  export interface ShowItemRequest {
    path: string;
  }
  
  export interface ShowItemResponse {
    success: boolean;
  }
  
  // Open external
  export interface OpenExternalRequest {
    url: string;
  }
  
  export interface OpenExternalResponse {
    success: boolean;
  }
}

// ============================================================================
// IPC API TYPE (Exposed to Renderer via Preload)
// ============================================================================

export interface IpcAPI {
  // Media operations
  media: {
    import: (req: MediaIPC.ImportRequest) => Promise<MediaIPC.ImportResponse>;
    getMetadata: (req: MediaIPC.GetMetadataRequest) => Promise<MediaIPC.GetMetadataResponse>;
    openFilePicker: (req: MediaIPC.OpenFilePickerRequest) => Promise<MediaIPC.OpenFilePickerResponse>;
    generateThumbnail: (req: MediaIPC.GenerateThumbnailRequest) => Promise<MediaIPC.GenerateThumbnailResponse>;
  };

  // Recording operations
  recording: {
    getSources: (req: RecordingIPC.GetSourcesRequest) => Promise<RecordingIPC.GetSourcesResponse>;
    start: (req: RecordingIPC.StartRecordingRequest) => Promise<RecordingIPC.StartRecordingResponse>;
    stop: (req: RecordingIPC.StopRecordingRequest) => Promise<RecordingIPC.StopRecordingResponse>;
    saveRecording: (req: RecordingIPC.SaveRecordingRequest) => Promise<RecordingIPC.SaveRecordingResponse>;
    onProgress: (callback: (event: RecordingIPC.RecordingProgressEvent) => void) => () => void;
  };

  // Export operations
  export: {
    start: (req: ExportIPC.StartExportRequest) => Promise<ExportIPC.StartExportResponse>;
    cancel: (req: ExportIPC.CancelExportRequest) => Promise<ExportIPC.CancelExportResponse>;
    onProgress: (callback: (event: ExportIPC.ExportProgressEvent) => void) => () => void;
    onComplete: (callback: (event: ExportIPC.ExportCompleteEvent) => void) => () => void;
  };

  // Project operations
  project: {
    save: (req: ProjectIPC.SaveProjectRequest) => Promise<ProjectIPC.SaveProjectResponse>;
    load: (req: ProjectIPC.LoadProjectRequest) => Promise<ProjectIPC.LoadProjectResponse>;
    openSaveDialog: (req: ProjectIPC.OpenSaveDialogRequest) => Promise<ProjectIPC.OpenSaveDialogResponse>;
    openProjectDialog: (req: ProjectIPC.OpenProjectDialogRequest) => Promise<ProjectIPC.OpenProjectDialogResponse>;
  };

  // System operations
  system: {
    getPath: (req: SystemIPC.GetPathRequest) => Promise<SystemIPC.GetPathResponse>;
    showItem: (req: SystemIPC.ShowItemRequest) => Promise<SystemIPC.ShowItemResponse>;
    openExternal: (req: SystemIPC.OpenExternalRequest) => Promise<SystemIPC.OpenExternalResponse>;
  };
}

declare global {
  interface Window {
    api: IpcAPI;
  }
}
```

### 2.2 IPC Channel Registry

**File:** `src/shared/contracts/ipc-channels.ts`

```typescript
/**
 * IPC Channel Names - Single Source of Truth
 * 
 * Used by both main process handlers and renderer process callers.
 * Prevents typos and ensures consistency.
 */

export const IPC_CHANNELS = {
  // Media
  MEDIA_IMPORT: 'media:import',
  MEDIA_GET_METADATA: 'media:get-metadata',
  MEDIA_OPEN_FILE_PICKER: 'media:open-file-picker',
  MEDIA_GENERATE_THUMBNAIL: 'media:generate-thumbnail',

  // Recording
  RECORDING_GET_SOURCES: 'recording:get-sources',
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  RECORDING_SAVE: 'recording:save',
  RECORDING_PROGRESS: 'recording:progress', // event

  // Export
  EXPORT_START: 'export:start',
  EXPORT_CANCEL: 'export:cancel',
  EXPORT_PROGRESS: 'export:progress', // event
  EXPORT_COMPLETE: 'export:complete', // event

  // Project
  PROJECT_SAVE: 'project:save',
  PROJECT_LOAD: 'project:load',
  PROJECT_OPEN_SAVE_DIALOG: 'project:open-save-dialog',
  PROJECT_OPEN_PROJECT_DIALOG: 'project:open-project-dialog',

  // System
  SYSTEM_GET_PATH: 'system:get-path',
  SYSTEM_SHOW_ITEM: 'system:show-item',
  SYSTEM_OPEN_EXTERNAL: 'system:open-external',
} as const;
```

---

## 3. Store Interfaces

### 3.1 Store Contract Definition

**File:** `src/shared/contracts/stores.ts`

```typescript
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

  export interface TimelineSnapshot {
    tracks: Track[];
    timestamp: number;
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
    showSourcePicker: (show: boolean) => void;
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
```

---

## 4. Component Props Interfaces

### 4.1 Component Contract Definition

**File:** `src/shared/contracts/components.ts`

```typescript
/**
 * Component Props Contracts
 * 
 * Defines props interfaces for all major components.
 * Enables parallel component development without coupling.
 */

import { Clip, Track, VideoMetadata, RecordingSource, ExportConfig } from '../types';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export namespace LayoutComponentProps {
  export interface AppShell {
    children?: React.ReactNode;
  }

  export interface MenuBar {
    onNewProject: () => void;
    onOpenProject: () => void;
    onSaveProject: () => void;
    onExport: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  }

  export interface Toolbar {
    onImport: () => void;
    onRecord: () => void;
    onExport: () => void;
    onSplit: () => void;
    onDelete: () => void;
    onUndo: () => void;
    onRedo: () => void;
    hasSelection: boolean;
    canUndo: boolean;
    canRedo: boolean;
  }

  export interface StatusBar {
    message?: string;
    fps?: number;
    zoom?: number;
    currentTime?: number;
    duration?: number;
  }
}

// ============================================================================
// MEDIA LIBRARY COMPONENTS
// ============================================================================

export namespace MediaLibraryComponentProps {
  export interface MediaLibrary {
    className?: string;
  }

  export interface MediaItem {
    id: string;
    clip: Clip;
    thumbnail?: string;
    isSelected: boolean;
    onSelect: (id: string, multiSelect: boolean) => void;
    onDragStart: (id: string) => void;
    onDoubleClick: (id: string) => void;
  }

  export interface MediaGrid {
    items: Array<{
      id: string;
      clip: Clip;
      thumbnail?: string;
    }>;
    selectedIds: string[];
    onSelectItem: (id: string, multiSelect: boolean) => void;
    onDragStart: (id: string) => void;
    onDoubleClick: (id: string) => void;
  }

  export interface ImportButton {
    onImport: (files: string[]) => void;
    isLoading?: boolean;
  }
}

// ============================================================================
// TIMELINE COMPONENTS
// ============================================================================

export namespace TimelineComponentProps {
  export interface Timeline {
    className?: string;
  }

  export interface TimelineCanvas {
    tracks: Track[];
    currentTime: number;
    zoom: number;
    scrollLeft: number;
    selectedClipIds: string[];
    onClipClick: (clipId: string, multiSelect: boolean) => void;
    onClipDragStart: (clipId: string) => void;
    onClipDragEnd: (clipId: string, trackId: string, position: number) => void;
    onTrimHandleDrag: (clipId: string, handle: 'start' | 'end', delta: number) => void;
    onPlayheadDrag: (time: number) => void;
  }

  export interface TimeRuler {
    duration: number;
    zoom: number;
    scrollLeft: number;
    currentTime: number;
    onSeek: (time: number) => void;
  }

  export interface Track {
    track: Track;
    isSelected: boolean;
    zoom: number;
    scrollLeft: number;
    onClipClick: (clipId: string) => void;
    onClipDragStart: (clipId: string) => void;
    onTrackSelect: (trackId: string) => void;
  }

  export interface TimelineClip {
    clip: Clip;
    isSelected: boolean;
    zoom: number;
    onSelect: (clipId: string) => void;
    onDragStart: () => void;
    onTrimStart: (handle: 'start' | 'end') => void;
    onTrimEnd: () => void;
  }

  export interface Playhead {
    currentTime: number;
    zoom: number;
    scrollLeft: number;
    onDrag: (time: number) => void;
  }

  export interface TimelineControls {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    snapEnabled: boolean;
    onSnapToggle: () => void;
  }
}

// ============================================================================
// VIDEO PREVIEW COMPONENTS
// ============================================================================

export namespace VideoPreviewComponentProps {
  export interface VideoPreview {
    className?: string;
  }

  export interface VideoPlayer {
    clip: Clip | null;
    currentTime: number;
    isPlaying: boolean;
    volume: number;
    onTimeUpdate: (time: number) => void;
    onPlay: () => void;
    onPause: () => void;
    onEnded: () => void;
  }

  export interface PlaybackControls {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onFullscreen: () => void;
  }
}

// ============================================================================
// RECORDING COMPONENTS
// ============================================================================

export namespace RecordingComponentProps {
  export interface RecordDialog {
    isOpen: boolean;
    onClose: () => void;
    onStartRecording: (sourceId: string) => void;
  }

  export interface SourceSelector {
    sources: RecordingSource[];
    selectedSourceId: string | null;
    onSelectSource: (sourceId: string) => void;
    onRefresh: () => void;
  }

  export interface CameraPreview {
    deviceId: string | null;
    onDeviceChange: (deviceId: string) => void;
  }

  export interface RecordControls {
    isRecording: boolean;
    duration: number;
    countdown: number | null;
    onStart: () => void;
    onStop: () => void;
  }
}

// ============================================================================
// EXPORT COMPONENTS
// ============================================================================

export namespace ExportComponentProps {
  export interface ExportDialog {
    isOpen: boolean;
    isExporting: boolean;
    progress: number;
    config: ExportConfig;
    onConfigChange: (config: Partial<ExportConfig>) => void;
    onStartExport: () => void;
    onCancelExport: () => void;
    onClose: () => void;
  }

  export interface ExportSettings {
    config: ExportConfig;
    onChange: (config: Partial<ExportConfig>) => void;
  }

  export interface ExportProgress {
    progress: number;
    currentFrame: number;
    totalFrames: number;
    fps: number;
    eta: number;
    onCancel: () => void;
  }

  export interface QualityPreset {
    value: ExportConfig['quality'];
    label: string;
    selected: boolean;
    onSelect: (value: ExportConfig['quality']) => void;
  }
}

// ============================================================================
// COMMON COMPONENTS
// ============================================================================

export namespace CommonComponentProps {
  export interface Button {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
  }

  export interface Dialog {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }

  export interface Dropdown {
    trigger: React.ReactNode;
    items: Array<{
      label: string;
      value: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    }>;
    onSelect: (value: string) => void;
    placement?: 'bottom' | 'top' | 'left' | 'right';
  }

  export interface ProgressBar {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }

  export interface Slider {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    showValue?: boolean;
  }
}
```

---

## 5. Service Interfaces

### 5.1 Service Contract Definition

**File:** `src/shared/contracts/services.ts`

```typescript
/**
 * Service Contracts - Main Process Services
 * 
 * Defines interfaces for all main process services.
 * Services are implemented in main process, contracts used by IPC handlers.
 */

import { 
  VideoMetadata, 
  RecordingSource, 
  RecordingConfig,
  ExportConfig,
  ExportProgress,
  Project 
} from '../types';

// ============================================================================
// MEDIA SERVICE CONTRACT
// ============================================================================

export interface IMediaService {
  /**
   * Get video metadata using FFprobe
   */
  getMetadata(filePath: string): Promise<VideoMetadata>;

  /**
   * Generate thumbnail for video at specific timestamp
   */
  generateThumbnail(
    filePath: string,
    timestamp: number,
    width: number,
    height: number
  ): Promise<string>; // returns base64 data URL

  /**
   * Validate video file
   */
  validateVideoFile(filePath: string): Promise<{
    isValid: boolean;
    error?: string;
  }>;

  /**
   * Trim video (fast, no re-encoding)
   */
  trimVideo(options: {
    inputPath: string;
    outputPath: string;
    startTime: number;
    endTime: number;
  }): Promise<void>;

  /**
   * Concatenate multiple clips
   */
  concatenateClips(options: {
    clips: Array<{ path: string; trimIn: number; trimOut: number }>;
    outputPath: string;
  }): Promise<void>;

  /**
   * Create picture-in-picture overlay
   */
  createOverlay(options: {
    mainVideo: string;
    overlayVideo: string;
    outputPath: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }): Promise<void>;
}

// ============================================================================
// RECORDING SERVICE CONTRACT
// ============================================================================

export interface IRecordingService {
  /**
   * Get available screen/window sources
   */
  getSources(types: Array<'screen' | 'window'>): Promise<RecordingSource[]>;

  /**
   * Start recording session
   * Returns session ID for tracking
   */
  startRecording(sourceId: string, config: RecordingConfig): Promise<string>;

  /**
   * Stop recording session
   * Returns output file path
   */
  stopRecording(sessionId: string): Promise<{
    outputPath: string;
    duration: number;
  }>;

  /**
   * Save recording blob to file (from renderer)
   */
  saveRecording(buffer: Buffer, filename: string): Promise<string>;

  /**
   * Get recording progress
   */
  getRecordingProgress(sessionId: string): Promise<{
    duration: number;
    fileSize: number;
  }>;
}

// ============================================================================
// EXPORT SERVICE CONTRACT
// ============================================================================

export interface IExportService {
  /**
   * Start export process
   * Returns export ID for tracking
   */
  startExport(
    config: ExportConfig,
    timeline: { tracks: any[] }
  ): Promise<string>;

  /**
   * Cancel ongoing export
   */
  cancelExport(exportId: string): Promise<void>;

  /**
   * Get export progress
   */
  getExportProgress(exportId: string): Promise<ExportProgress>;

  /**
   * Export single clip (fast path)
   */
  exportSingleClip(
    clipPath: string,
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string>; // returns output path

  /**
   * Export timeline (complex path)
   */
  exportTimeline(
    tracks: any[],
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string>; // returns output path
}

// ============================================================================
// PROJECT SERVICE CONTRACT
// ============================================================================

export interface IProjectService {
  /**
   * Save project to file
   */
  saveProject(project: Project, filePath?: string): Promise<string>;

  /**
   * Load project from file
   */
  loadProject(filePath: string): Promise<Project>;

  /**
   * List recent projects
   */
  listRecentProjects(): Promise<Array<{
    filePath: string;
    name: string;
    modifiedAt: Date;
  }>>;

  /**
   * Create new project
   */
  createProject(name: string): Project;

  /**
   * Validate project file
   */
  validateProject(filePath: string): Promise<{
    isValid: boolean;
    version?: string;
    error?: string;
  }>;
}

// ============================================================================
// FFMPEG MANAGER CONTRACT
// ============================================================================

export interface IFFmpegManager {
  /**
   * Initialize FFmpeg (validate binary paths)
   */
  initialize(): Promise<void>;

  /**
   * Check if FFmpeg is ready
   */
  isReady(): boolean;

  /**
   * Get FFmpeg binary path
   */
  getFFmpegPath(): string;

  /**
   * Get FFprobe binary path
   */
  getFFprobePath(): string;

  /**
   * Get available codecs
   */
  getAvailableCodecs(): Promise<string[]>;

  /**
   * Get available formats
   */
  getAvailableFormats(): Promise<string[]>;
}
```

---

## 6. File Ownership Matrix

### 6.1 Module Ownership

Each module owns specific files. **Never edit files owned by another module.**

```typescript
/**
 * FILE OWNERSHIP MATRIX
 * 
 * Format:
 * - Module Name
 *   - Files owned (can read/write)
 *   - Files consumed (read-only via contracts)
 */

export const FILE_OWNERSHIP = {
  // =========================================================================
  // SHARED CONTRACTS (Team Coordination Required)
  // =========================================================================
  SHARED_CONTRACTS: {
    owners: ['Winston (Architect)', 'All Team (PR required)'],
    files: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/stores.ts',
      'src/shared/contracts/components.ts',
      'src/shared/contracts/services.ts',
      'src/shared/contracts/ipc-channels.ts',
      'src/shared/types/**/*.ts',
    ],
    notes: 'Changes require PR approval from all affected module owners',
  },

  // =========================================================================
  // MAIN PROCESS MODULES
  // =========================================================================
  MAIN_PROCESS_CORE: {
    owner: 'Agent: Main-Process-Dev',
    files: [
      'src/main/main.ts',
      'src/main/preload.ts',
      'src/main/ipc/index.ts',
    ],
    consumes: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/services.ts',
    ],
  },

  MEDIA_SERVICE: {
    owner: 'Agent: Media-Dev',
    files: [
      'src/main/services/MediaService.ts',
      'src/main/services/FFmpegManager.ts',
      'src/main/ipc/mediaHandlers.ts',
    ],
    consumes: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/services.ts',
    ],
  },

  RECORDING_SERVICE: {
    owner: 'Agent: Recording-Dev',
    files: [
      'src/main/services/RecordingService.ts',
      'src/main/ipc/recordHandlers.ts',
    ],
    consumes: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/services.ts',
    ],
  },

  EXPORT_SERVICE: {
    owner: 'Agent: Export-Dev',
    files: [
      'src/main/services/ExportService.ts',
      'src/main/ipc/exportHandlers.ts',
    ],
    consumes: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/services.ts',
    ],
  },

  PROJECT_SERVICE: {
    owner: 'Agent: Project-Dev',
    files: [
      'src/main/services/ProjectService.ts',
      'src/main/ipc/projectHandlers.ts',
    ],
    consumes: [
      'src/shared/contracts/ipc.ts',
      'src/shared/contracts/services.ts',
    ],
  },

  // =========================================================================
  // RENDERER PROCESS MODULES - STORES
  // =========================================================================
  TIMELINE_STORE: {
    owner: 'Agent: Timeline-Store-Dev',
    files: [
      'src/renderer/store/timelineStore.ts',
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
    ],
  },

  MEDIA_LIBRARY_STORE: {
    owner: 'Agent: Media-Store-Dev',
    files: [
      'src/renderer/store/mediaStore.ts',
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
    ],
  },

  RECORDING_STORE: {
    owner: 'Agent: Recording-Store-Dev',
    files: [
      'src/renderer/store/recordingStore.ts',
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
      'src/shared/contracts/ipc.ts',
    ],
  },

  EXPORT_STORE: {
    owner: 'Agent: Export-Store-Dev',
    files: [
      'src/renderer/store/exportStore.ts',
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
      'src/shared/contracts/ipc.ts',
    ],
  },

  PROJECT_STORE: {
    owner: 'Agent: Project-Store-Dev',
    files: [
      'src/renderer/store/projectStore.ts',
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
      'src/shared/contracts/ipc.ts',
    ],
  },

  APP_STORE: {
    owner: 'Agent: App-Store-Dev',
    files: [
      'src/renderer/store/appStore.ts',
      'src/renderer/store/index.ts', // combined store
    ],
    consumes: [
      'src/shared/contracts/stores.ts',
    ],
  },

  // =========================================================================
  // RENDERER PROCESS MODULES - COMPONENTS
  // =========================================================================
  LAYOUT_COMPONENTS: {
    owner: 'Agent: Layout-Dev',
    files: [
      'src/renderer/components/layout/AppShell.tsx',
      'src/renderer/components/layout/MenuBar.tsx',
      'src/renderer/components/layout/Toolbar.tsx',
      'src/renderer/components/layout/StatusBar.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/index.ts',
    ],
  },

  MEDIA_LIBRARY_COMPONENTS: {
    owner: 'Agent: Media-UI-Dev',
    files: [
      'src/renderer/components/media/MediaLibrary.tsx',
      'src/renderer/components/media/MediaItem.tsx',
      'src/renderer/components/media/MediaGrid.tsx',
      'src/renderer/components/media/ImportButton.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/mediaStore.ts',
    ],
  },

  TIMELINE_COMPONENTS: {
    owner: 'Agent: Timeline-UI-Dev',
    files: [
      'src/renderer/components/timeline/Timeline.tsx',
      'src/renderer/components/timeline/TimelineCanvas.tsx',
      'src/renderer/components/timeline/TimeRuler.tsx',
      'src/renderer/components/timeline/Track.tsx',
      'src/renderer/components/timeline/TimelineClip.tsx',
      'src/renderer/components/timeline/Playhead.tsx',
      'src/renderer/components/timeline/TimelineControls.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/timelineStore.ts',
    ],
  },

  VIDEO_PREVIEW_COMPONENTS: {
    owner: 'Agent: Preview-UI-Dev',
    files: [
      'src/renderer/components/preview/VideoPreview.tsx',
      'src/renderer/components/preview/VideoPlayer.tsx',
      'src/renderer/components/preview/PlaybackControls.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/timelineStore.ts',
    ],
  },

  RECORDING_COMPONENTS: {
    owner: 'Agent: Recording-UI-Dev',
    files: [
      'src/renderer/components/recording/RecordDialog.tsx',
      'src/renderer/components/recording/SourceSelector.tsx',
      'src/renderer/components/recording/CameraPreview.tsx',
      'src/renderer/components/recording/RecordControls.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/recordingStore.ts',
    ],
  },

  EXPORT_COMPONENTS: {
    owner: 'Agent: Export-UI-Dev',
    files: [
      'src/renderer/components/export/ExportDialog.tsx',
      'src/renderer/components/export/ExportSettings.tsx',
      'src/renderer/components/export/ExportProgress.tsx',
      'src/renderer/components/export/QualityPreset.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
      'src/renderer/store/exportStore.ts',
    ],
  },

  COMMON_COMPONENTS: {
    owner: 'Agent: Common-UI-Dev',
    files: [
      'src/renderer/components/common/Button.tsx',
      'src/renderer/components/common/Dialog.tsx',
      'src/renderer/components/common/Dropdown.tsx',
      'src/renderer/components/common/ProgressBar.tsx',
      'src/renderer/components/common/Slider.tsx',
    ],
    consumes: [
      'src/shared/contracts/components.ts',
    ],
  },

  // =========================================================================
  // HOOKS & UTILITIES
  // =========================================================================
  CUSTOM_HOOKS: {
    owner: 'Agent: Hooks-Dev',
    files: [
      'src/renderer/hooks/useTimeline.ts',
      'src/renderer/hooks/usePlayback.ts',
      'src/renderer/hooks/useKeyboard.ts',
      'src/renderer/hooks/useIPC.ts',
      'src/renderer/hooks/useRecording.ts',
    ],
    consumes: [
      'src/renderer/store/index.ts',
      'src/shared/contracts/ipc.ts',
    ],
  },

  RENDERER_UTILS: {
    owner: 'Agent: Utils-Dev',
    files: [
      'src/renderer/utils/timeFormatting.ts',
      'src/renderer/utils/canvasHelpers.ts',
      'src/renderer/utils/fileValidation.ts',
    ],
    consumes: [],
  },

  MAIN_UTILS: {
    owner: 'Agent: Main-Utils-Dev',
    files: [
      'src/main/utils/pathResolver.ts',
      'src/main/utils/errorHandler.ts',
    ],
    consumes: [],
  },
};
```

---

## 7. Development Modules

### 7.1 Independent Development Tracks

**Track 1: Main Process Foundation**
```
Agent: Main-Core-Dev
Duration: 4-6 hours
Dependencies: None (starts immediately)

Files:
- src/main/main.ts
- src/main/preload.ts
- src/main/ipc/index.ts

Deliverables:
✅ Electron app launches
✅ Window creation working
✅ IPC infrastructure registered
✅ Preload script exposes window.api

Integration: None required until other tracks complete
```

**Track 2: Media Service**
```
Agent: Media-Service-Dev
Duration: 6-8 hours
Dependencies: Main-Core-Dev (IPC infrastructure)

Files:
- src/main/services/MediaService.ts
- src/main/services/FFmpegManager.ts
- src/main/ipc/mediaHandlers.ts

Deliverables:
✅ FFmpeg integration working
✅ Video metadata extraction
✅ Thumbnail generation
✅ IPC handlers registered

Integration: Plugs into IPC registry from Track 1
```

**Track 3: Recording Service**
```
Agent: Recording-Service-Dev
Duration: 6-8 hours
Dependencies: Main-Core-Dev (IPC infrastructure)

Files:
- src/main/services/RecordingService.ts
- src/main/ipc/recordHandlers.ts

Deliverables:
✅ desktopCapturer integration
✅ Source enumeration
✅ Recording session management
✅ IPC handlers registered

Integration: Plugs into IPC registry from Track 1
```

**Track 4: Export Service**
```
Agent: Export-Service-Dev
Duration: 8-10 hours
Dependencies: Media-Service-Dev (FFmpeg)

Files:
- src/main/services/ExportService.ts
- src/main/ipc/exportHandlers.ts

Deliverables:
✅ Single clip export
✅ Multi-clip concatenation
✅ PiP overlay compositing
✅ Progress event emission

Integration: Uses FFmpegManager from Track 2
```

**Track 5: Project Service**
```
Agent: Project-Service-Dev
Duration: 3-4 hours
Dependencies: Main-Core-Dev

Files:
- src/main/services/ProjectService.ts
- src/main/ipc/projectHandlers.ts

Deliverables:
✅ Project serialization
✅ File I/O operations
✅ Project validation
✅ Recent projects tracking

Integration: Plugs into IPC registry from Track 1
```

---

**Track 6: Store Architecture**
```
Agent: Store-Dev
Duration: 4-6 hours
Dependencies: None (starts immediately)

Files:
- src/renderer/store/timelineStore.ts
- src/renderer/store/mediaStore.ts
- src/renderer/store/recordingStore.ts
- src/renderer/store/exportStore.ts
- src/renderer/store/projectStore.ts
- src/renderer/store/appStore.ts
- src/renderer/store/index.ts

Deliverables:
✅ All Zustand stores implemented
✅ Actions and selectors defined
✅ Store persistence configured
✅ Combined store exported

Integration: None - stores consumed by components
```

---

**Track 7: Layout Components**
```
Agent: Layout-UI-Dev
Duration: 4-6 hours
Dependencies: Store-Dev

Files:
- src/renderer/components/layout/AppShell.tsx
- src/renderer/components/layout/MenuBar.tsx
- src/renderer/components/layout/Toolbar.tsx
- src/renderer/components/layout/StatusBar.tsx

Deliverables:
✅ App shell layout
✅ Menu bar with actions
✅ Toolbar with buttons
✅ Status bar with metrics

Integration: Consumes stores from Track 6
```

**Track 8: Media Library UI**
```
Agent: Media-UI-Dev
Duration: 5-7 hours
Dependencies: Store-Dev

Files:
- src/renderer/components/media/MediaLibrary.tsx
- src/renderer/components/media/MediaItem.tsx
- src/renderer/components/media/MediaGrid.tsx
- src/renderer/components/media/ImportButton.tsx

Deliverables:
✅ Media library panel
✅ Thumbnail grid
✅ Drag-drop support
✅ Import button with file picker

Integration: Consumes mediaStore from Track 6
```

**Track 9: Timeline UI**
```
Agent: Timeline-UI-Dev
Duration: 10-12 hours (most complex)
Dependencies: Store-Dev

Files:
- src/renderer/components/timeline/Timeline.tsx
- src/renderer/components/timeline/TimelineCanvas.tsx
- src/renderer/components/timeline/TimeRuler.tsx
- src/renderer/components/timeline/Track.tsx
- src/renderer/components/timeline/TimelineClip.tsx
- src/renderer/components/timeline/Playhead.tsx
- src/renderer/components/timeline/TimelineControls.tsx

Deliverables:
✅ Canvas-based timeline
✅ Clip rendering
✅ Drag-drop interaction
✅ Trim handles
✅ Zoom/scroll controls

Integration: Consumes timelineStore from Track 6
```

**Track 10: Video Preview UI**
```
Agent: Preview-UI-Dev
Duration: 6-8 hours
Dependencies: Store-Dev

Files:
- src/renderer/components/preview/VideoPreview.tsx
- src/renderer/components/preview/VideoPlayer.tsx
- src/renderer/components/preview/PlaybackControls.tsx

Deliverables:
✅ HTML5 video player
✅ Playback controls
✅ Timeline synchronization
✅ Scrubbing support

Integration: Consumes timelineStore from Track 6
```

**Track 11: Recording UI**
```
Agent: Recording-UI-Dev
Duration: 5-6 hours
Dependencies: Store-Dev

Files:
- src/renderer/components/recording/RecordDialog.tsx
- src/renderer/components/recording/SourceSelector.tsx
- src/renderer/components/recording/CameraPreview.tsx
- src/renderer/components/recording/RecordControls.tsx

Deliverables:
✅ Recording dialog
✅ Source picker UI
✅ Camera preview
✅ Recording controls

Integration: Consumes recordingStore from Track 6
```

**Track 12: Export UI**
```
Agent: Export-UI-Dev
Duration: 4-5 hours
Dependencies: Store-Dev

Files:
- src/renderer/components/export/ExportDialog.tsx
- src/renderer/components/export/ExportSettings.tsx
- src/renderer/components/export/ExportProgress.tsx
- src/renderer/components/export/QualityPreset.tsx

Deliverables:
✅ Export dialog
✅ Settings panel
✅ Progress display
✅ Quality presets

Integration: Consumes exportStore from Track 6
```

**Track 13: Common Components**
```
Agent: Common-UI-Dev
Duration: 3-4 hours
Dependencies: None (starts immediately)

Files:
- src/renderer/components/common/Button.tsx
- src/renderer/components/common/Dialog.tsx
- src/renderer/components/common/Dropdown.tsx
- src/renderer/components/common/ProgressBar.tsx
- src/renderer/components/common/Slider.tsx

Deliverables:
✅ Reusable button component
✅ Modal dialog component
✅ Dropdown menu component
✅ Progress bar component
✅ Slider component

Integration: Consumed by all UI tracks
```

**Track 14: Custom Hooks**
```
Agent: Hooks-Dev
Duration: 3-4 hours
Dependencies: Store-Dev

Files:
- src/renderer/hooks/useTimeline.ts
- src/renderer/hooks/usePlayback.ts
- src/renderer/hooks/useKeyboard.ts
- src/renderer/hooks/useIPC.ts
- src/renderer/hooks/useRecording.ts

Deliverables:
✅ Timeline interaction hook
✅ Playback control hook
✅ Keyboard shortcut hook
✅ IPC communication hook
✅ Recording management hook

Integration: Consumed by component tracks
```

### 7.2 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                     Development Timeline                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Day 1 (Monday) - Foundation                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐      │
│  │ Track 1      │  │ Track 6      │  │ Track 13        │      │
│  │ Main Core    │  │ Stores       │  │ Common UI       │      │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬───────┘      │
│         │                  │                    │               │
│         ├──────────────────┴────────────────────┘               │
│         │                                                        │
│  Day 1-2 - Services & UI                                        │
│         │                                                        │
│         ├─▶ Track 2: Media Service                              │
│         ├─▶ Track 3: Recording Service                          │
│         ├─▶ Track 5: Project Service                            │
│         ├─▶ Track 7: Layout UI                                  │
│         ├─▶ Track 8: Media Library UI                           │
│         ├─▶ Track 14: Custom Hooks                              │
│         │                                                        │
│  Day 2 - Complex Features                                       │
│         │                                                        │
│         ├─▶ Track 4: Export Service (needs Track 2)             │
│         ├─▶ Track 9: Timeline UI                                │
│         ├─▶ Track 10: Preview UI                                │
│         ├─▶ Track 11: Recording UI                              │
│         └─▶ Track 12: Export UI                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Integration Points

### 8.1 Integration Checklist

**Phase 1: Foundation Integration (End of Day 1)**
```
✅ Main process launches window
✅ Preload script exposes window.api
✅ IPC channels registered
✅ Stores initialized
✅ Common components rendered
✅ App shell displays

Integration Test:
- Launch app → Window opens
- Check console → No IPC errors
- Inspect window.api → All methods present
```

**Phase 2: Media Integration (Day 2 Morning)**
```
✅ Media service IPC handlers working
✅ Media store receives imported clips
✅ Media library displays clips
✅ Thumbnails generated and displayed

Integration Test:
- Click Import → File picker opens
- Select video → Appears in media library
- Check thumbnail → Image visible
```

**Phase 3: Timeline Integration (Day 2 Afternoon)**
```
✅ Timeline canvas renders clips
✅ Drag-drop from media library works
✅ Timeline store updates on actions
✅ Playhead syncs with preview

Integration Test:
- Drag clip to timeline → Appears on track
- Click clip → Clip selected
- Drag playhead → Current time updates
```

**Phase 4: Playback Integration (Day 2 Evening)**
```
✅ Preview player loads video
✅ Playback controls functional
✅ Timeline sync working
✅ Scrubbing updates both preview and timeline

Integration Test:
- Click Play → Video plays
- Drag playhead → Preview updates frame
- Seek on preview → Timeline updates
```

**Phase 5: Recording Integration (Day 3 Morning)**
```
✅ Source picker displays screens/windows
✅ Recording starts and captures
✅ Recording saves to file
✅ Recording auto-added to media library

Integration Test:
- Open record dialog → Sources displayed
- Start recording → Countdown → Capture begins
- Stop recording → File saved and imported
```

**Phase 6: Export Integration (Day 3 Afternoon)**
```
✅ Export dialog opens with timeline data
✅ Export service receives timeline state
✅ Progress updates in real-time
✅ Export completes and file playable

Integration Test:
- Click Export → Dialog opens
- Configure settings → Start export
- Watch progress → Reaches 100%
- Open exported file → Video plays correctly
```

### 8.2 Integration Coordination

**Daily Standup (Virtual):**
- Post in team chat: "Track [X] integration ready"
- Other devs: "Pulling latest from contracts"
- Architect: Review integration, approve merge

**Contract Change Process:**
1. Dev proposes change in `src/shared/contracts/`
2. Architect reviews impact on all tracks
3. If approved, all tracks pull latest
4. Update implementations to match new contract

---

## 9. Testing Contracts

### 9.1 Unit Test Interfaces

**File:** `src/shared/contracts/testing.ts`

```typescript
/**
 * Testing Contracts
 * 
 * Defines mock interfaces for isolated unit testing.
 */

import { IpcAPI } from './ipc';

// Mock IPC API for renderer tests
export const createMockIpcAPI = (): jest.Mocked<IpcAPI> => ({
  media: {
    import: jest.fn(),
    getMetadata: jest.fn(),
    openFilePicker: jest.fn(),
    generateThumbnail: jest.fn(),
  },
  recording: {
    getSources: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    saveRecording: jest.fn(),
    onProgress: jest.fn(),
  },
  export: {
    start: jest.fn(),
    cancel: jest.fn(),
    onProgress: jest.fn(),
    onComplete: jest.fn(),
  },
  project: {
    save: jest.fn(),
    load: jest.fn(),
    openSaveDialog: jest.fn(),
    openProjectDialog: jest.fn(),
  },
  system: {
    getPath: jest.fn(),
    showItem: jest.fn(),
    openExternal: jest.fn(),
  },
});

// Mock stores for component tests
export const createMockTimelineStore = () => ({
  tracks: [],
  currentTime: 0,
  zoom: 1,
  addClip: jest.fn(),
  removeClip: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  // ... other methods
});

// Test utilities
export const waitForIPC = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));
```

### 9.2 Integration Test Scenarios

```typescript
/**
 * Integration Test Scenarios
 * 
 * Each scenario tests a complete user workflow.
 */

// Scenario 1: Import → Timeline → Preview
test('User can import video and add to timeline', async () => {
  // 1. Import video
  const clips = await window.api.media.import({ filePaths: ['/path/to/video.mp4'] });
  expect(clips).toHaveLength(1);

  // 2. Add to timeline
  const { addClip } = useTimelineStore.getState();
  addClip(clips[0], 'track-1', 0);

  // 3. Verify in store
  const { tracks } = useTimelineStore.getState();
  expect(tracks[0].clips).toHaveLength(1);
});

// Scenario 2: Record → Import → Timeline
test('User can record screen and add to timeline', async () => {
  // 1. Get sources
  const { sources } = await window.api.recording.getSources({ types: ['screen'] });
  expect(sources.length).toBeGreaterThan(0);

  // 2. Start recording
  const { sessionId } = await window.api.recording.start({
    sourceId: sources[0].id,
    config: { /* ... */ },
  });

  // 3. Stop recording
  await wait(3000); // Record for 3 seconds
  const { outputPath } = await window.api.recording.stop({ sessionId });

  // 4. Verify file exists and imported
  const { clips } = await window.api.media.import({ filePaths: [outputPath] });
  expect(clips).toHaveLength(1);
});

// Scenario 3: Timeline → Export
test('User can export timeline to video file', async () => {
  // Setup timeline with clips
  const { addClip } = useTimelineStore.getState();
  addClip(mockClip, 'track-1', 0);

  // Export
  const { timeline } = useTimelineStore.getState();
  const { exportId } = await window.api.export.start({
    config: { /* ... */ },
    timeline,
  });

  // Wait for completion
  const complete = await new Promise(resolve => {
    window.api.export.onComplete(event => {
      if (event.exportId === exportId) {
        resolve(event);
      }
    });
  });

  expect(complete.success).toBe(true);
  expect(complete.outputPath).toBeDefined();
});
```

---

## Summary

### Key Benefits of Modular Architecture

✅ **Parallel Development** - 14 independent tracks  
✅ **Zero Merge Conflicts** - Clear file ownership  
✅ **Type-Safe Integration** - Contracts enforce compatibility  
✅ **Easy Testing** - Mock interfaces for unit tests  
✅ **Scalable Team** - Add developers without coordination overhead  

### Development Flow

1. **Define Contracts** (Day 0 - Architect)
   - IPC interfaces
   - Store interfaces
   - Component props
   - Service interfaces

2. **Parallel Development** (Day 1-3 - All Agents)
   - Each agent owns specific files
   - Consumes contracts (read-only)
   - No cross-module dependencies

3. **Integration** (Daily)
   - Plug implementations into contracts
   - Run integration tests
   - Deploy to staging

4. **Final Integration** (Day 3 PM)
   - All modules working together
   - End-to-end testing
   - Production deployment

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Architect:** Winston (BMAD)  
**Status:** Ready for Parallel Development 🚀

---

**Next Steps:**
1. Review contract definitions with team
2. Assign tracks to agents
3. Create contract files in `src/shared/contracts/`
4. Begin parallel development
5. Daily integration checkpoints

