/**
 * Core Type Definitions
 * 
 * Shared across all modules - main process and renderer process.
 */

// ============================================================================
// VIDEO & MEDIA TYPES
// ============================================================================

export interface VideoMetadata {
  duration: number;            // Total duration (seconds)
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;           // FPS
  codec: string;               // e.g., 'h264', 'vp9'
  size: number;                // File size (bytes)
  thumbnail?: string;          // Base64 data URL
}

export interface Clip {
  id: string;
  sourceFile: string;          // Absolute path to source video
  startTime: number;           // Start on timeline (seconds)
  endTime: number;             // End on timeline (seconds)
  trimIn: number;              // Trim start (seconds from file start)
  trimOut: number;             // Trim end (seconds from file start)
  trackId: string;             // Parent track ID
  metadata: VideoMetadata;
}

export interface Track {
  id: string;
  name: string;
  clips: Clip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface ProjectSettings {
  fps: number;                 // Project FPS (default: 30)
  resolution: {
    width: number;
    height: number;
  };
  audioSampleRate: number;     // e.g., 44100, 48000
}

export interface ProjectMetadata {
  created: Date;
  modified: Date;
  author?: string;
}

export interface Project {
  id: string;
  name: string;
  version: string;             // e.g., '1.0.0'
  timeline: {
    tracks: Track[];
    duration: number;          // Total timeline duration (seconds)
  };
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  webcamSettings?: {           // Webcam overlay configuration
    enabled: boolean;
    position: { x: number; y: number }; // Percentage (0-100)
    size: { width: number; height: number }; // Percentage (0-100)
    deviceId?: string;
  };
}

// ============================================================================
// RECORDING TYPES
// ============================================================================

export interface RecordingSource {
  id: string;
  name: string;
  type: 'screen' | 'window';
  thumbnail: string;           // Base64 image
}

export interface RecordingConfig {
  sourceId: string;
  includeAudio: boolean;
  audioSourceId?: string;      // Microphone ID
  includeWebcam: boolean;
  webcamDeviceId?: string;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ExportCodec = 'h264' | 'h265' | 'vp9';

export interface ExportConfig {
  outputPath: string;
  quality: ExportQuality;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  codec: ExportCodec;
  bitrate?: string;            // e.g., '5000k'
}

export interface ExportProgress {
  percent: number;             // 0-100
  currentFrame: number;
  totalFrames: number;
  fps: number;                 // Encoding FPS
  eta: number;                 // Estimated seconds remaining
}

export interface ExportResult {
  success: boolean;
  outputPath: string;
  duration: number;            // Encoding duration (seconds)
  fileSize: number;            // Output file size (bytes)
  error?: string;
}

