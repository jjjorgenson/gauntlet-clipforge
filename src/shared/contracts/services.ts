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
    clip: { sourceFile: string; trimIn: number; trimOut: number },
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

