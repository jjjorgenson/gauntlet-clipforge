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
  
  // Save dropped file to temp location
  export interface SaveDroppedFileRequest {
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }
  
  export interface SaveDroppedFileResponse {
    filePath: string; // absolute path to saved file
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
    saveDroppedFile: (req: MediaIPC.SaveDroppedFileRequest) => Promise<MediaIPC.SaveDroppedFileResponse>;
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

