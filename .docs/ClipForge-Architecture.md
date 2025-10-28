# ClipForge Full-Stack Architecture
## Desktop Video Editor - Technical Architecture Document

**Version:** 1.0  
**Date:** October 27, 2025  
**Status:** Production Architecture  
**Timeline:** 72-hour sprint (Oct 27-29, 2025)  
**Architect:** Winston (BMAD Architect)

---

## Executive Summary

ClipForge is a desktop video editor built with **Electron + React + TypeScript**, designed for rapid content creation. This architecture balances the aggressive 72-hour timeline with production-quality code that can evolve post-launch.

**Core Architectural Principles:**
1. **Separation of Concerns** - Clean boundaries between UI, business logic, and system services
2. **Progressive Enhancement** - MVP foundation that scales to full feature set
3. **Performance First** - Canvas-based rendering, hardware acceleration, efficient state management
4. **Extensibility by Design** - Plugin-ready architecture from day one

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Electron Architecture](#2-electron-architecture)
3. [FFmpeg Integration Strategy](#3-ffmpeg-integration-strategy)
4. [React Component Hierarchy](#4-react-component-hierarchy)
5. [State Management](#5-state-management)
6. [Data Models](#6-data-models)
7. [Video Processing Pipeline](#7-video-processing-pipeline)
8. [Recording Architecture](#8-recording-architecture)
9. [Timeline Rendering System](#9-timeline-rendering-system)
10. [Export Architecture](#10-export-architecture)
11. [IPC Communication Layer](#11-ipc-communication-layer)
12. [File System Management](#12-file-system-management)
13. [Performance Optimization](#13-performance-optimization)
14. [Security Considerations](#14-security-considerations)
15. [Build & Packaging Strategy](#15-build--packaging-strategy)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment Architecture](#17-deployment-architecture)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ClipForge Application                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Renderer Process (Chromium)                │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │              React Application Layer                   │  │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │   │
│  │  │  │  UI Layer    │  │ State Layer  │  │ Video Layer │ │  │   │
│  │  │  │ (Components) │  │  (Zustand)   │  │  (Canvas)   │ │  │   │
│  │  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                            ▲  │                              │   │
│  │                            │  │                              │   │
│  │                       IPC  │  │  IPC                         │   │
│  │                       Events│ Commands                       │   │
│  └────────────────────────────┼──┼───────────────────────────────┘   │
│                                │  ▼                                  │
│  ┌────────────────────────────┴──┴───────────────────────────────┐  │
│  │                    Main Process (Node.js)                      │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │                    Service Layer                          │ │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │ │  │
│  │  │  │ MediaService │  │RecordService │  │ ExportService  │ │ │  │
│  │  │  └──────────────┘  └──────────────┘  └────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                              ▲  │                              │  │
│  └──────────────────────────────┼──┼──────────────────────────────┘  │
│                                 │  ▼                                 │
│  ┌──────────────────────────────┴──┴──────────────────────────────┐ │
│  │                    External System Layer                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │ │
│  │  │   FFmpeg     │  │ File System  │  │ Media APIs         │   │ │
│  │  │   (bundled)  │  │              │  │ (desktopCapturer)  │   │ │
│  │  └──────────────┘  └──────────────┘  └────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Desktop Framework** | Electron 28+ | Mature, extensive media APIs, fast development |
| **UI Framework** | React 18.2+ | Component reusability, efficient re-rendering |
| **Language** | TypeScript 5.2+ | Type safety, better tooling, fewer runtime errors |
| **State Management** | Zustand 4.4+ | Minimal boilerplate, TypeScript-first, performant |
| **Build Tool** | Vite 5.0+ | Fast HMR, optimized builds, great DX |
| **Packaging** | electron-builder 24+ | Cross-platform builds, auto-updates support |
| **Media Processing** | fluent-ffmpeg 2.1+ | Node.js wrapper for FFmpeg, promise-based |
| **Video Engine** | FFmpeg 6.0+ (bundled) | Industry standard, all codec support |
| **UI Styling** | Tailwind CSS 3.0+ | Rapid styling, consistent design system |
| **Timeline Rendering** | HTML5 Canvas | 60 FPS performance, pixel-perfect control |

### 1.3 Project Structure

```
clipforge/
├── src/
│   ├── main/                           # Electron Main Process
│   │   ├── main.ts                     # Entry point, window creation
│   │   ├── preload.ts                  # Bridge between main/renderer
│   │   ├── ipc/                        # IPC handlers
│   │   │   ├── index.ts                # IPC registry
│   │   │   ├── mediaHandlers.ts        # Import/export IPC
│   │   │   ├── recordHandlers.ts       # Recording IPC
│   │   │   └── projectHandlers.ts      # Project save/load IPC
│   │   ├── services/                   # Core services
│   │   │   ├── MediaService.ts         # FFmpeg operations
│   │   │   ├── RecordingService.ts     # Screen/webcam capture
│   │   │   ├── ExportService.ts        # Video rendering
│   │   │   ├── ProjectService.ts       # Project persistence
│   │   │   └── FFmpegManager.ts        # FFmpeg binary management
│   │   └── utils/                      # Main process utilities
│   │       ├── pathResolver.ts         # Path resolution (dev vs prod)
│   │       └── errorHandler.ts         # Global error handling
│   │
│   ├── renderer/                       # React Application
│   │   ├── index.html                  # HTML shell
│   │   ├── main.tsx                    # React entry point
│   │   ├── App.tsx                     # Root component
│   │   │
│   │   ├── core/                       # Business Logic (Framework-agnostic)
│   │   │   ├── domain/                 # Domain models
│   │   │   │   ├── Clip.ts             # Clip entity
│   │   │   │   ├── Track.ts            # Track entity
│   │   │   │   ├── Project.ts          # Project entity
│   │   │   │   └── TimelineState.ts    # Timeline state
│   │   │   │
│   │   │   └── usecases/               # Business logic
│   │   │       ├── ImportClip.ts       # Import workflow
│   │   │       ├── TrimClip.ts         # Trim logic
│   │   │       ├── SplitClip.ts        # Split logic
│   │   │       ├── ExportTimeline.ts   # Export workflow
│   │   │       └── RecordMedia.ts      # Recording workflow
│   │   │
│   │   ├── components/                 # UI Components
│   │   │   ├── layout/                 # Layout components
│   │   │   │   ├── AppShell.tsx        # Main layout
│   │   │   │   ├── MenuBar.tsx         # Top menu bar
│   │   │   │   ├── Toolbar.tsx         # Action toolbar
│   │   │   │   └── StatusBar.tsx       # Bottom status bar
│   │   │   │
│   │   │   ├── media/                  # Media library components
│   │   │   │   ├── MediaLibrary.tsx    # Media library panel
│   │   │   │   ├── MediaItem.tsx       # Individual media item
│   │   │   │   └── ImportButton.tsx    # Import trigger
│   │   │   │
│   │   │   ├── timeline/               # Timeline components
│   │   │   │   ├── Timeline.tsx        # Timeline container
│   │   │   │   ├── TimelineCanvas.tsx  # Canvas renderer
│   │   │   │   ├── TimelineControls.tsx # Zoom, scroll controls
│   │   │   │   ├── Track.tsx           # Single track
│   │   │   │   ├── Clip.tsx            # Clip representation
│   │   │   │   ├── Playhead.tsx        # Playhead indicator
│   │   │   │   └── TimeRuler.tsx       # Time ruler
│   │   │   │
│   │   │   ├── preview/                # Video preview components
│   │   │   │   ├── VideoPreview.tsx    # Video player container
│   │   │   │   ├── VideoPlayer.tsx     # HTML5 video element
│   │   │   │   └── PlaybackControls.tsx # Play/pause controls
│   │   │   │
│   │   │   ├── recording/              # Recording components
│   │   │   │   ├── RecordDialog.tsx    # Recording dialog
│   │   │   │   ├── SourceSelector.tsx  # Screen/window picker
│   │   │   │   ├── CameraPreview.tsx   # Webcam preview
│   │   │   │   └── RecordControls.tsx  # Start/stop controls
│   │   │   │
│   │   │   ├── export/                 # Export components
│   │   │   │   ├── ExportDialog.tsx    # Export dialog
│   │   │   │   ├── ExportSettings.tsx  # Quality settings
│   │   │   │   └── ExportProgress.tsx  # Progress bar
│   │   │   │
│   │   │   └── common/                 # Shared components
│   │   │       ├── Button.tsx          # Button component
│   │   │       ├── Dialog.tsx          # Modal dialog
│   │   │       ├── Dropdown.tsx        # Dropdown menu
│   │   │       └── ProgressBar.tsx     # Progress indicator
│   │   │
│   │   ├── store/                      # State Management (Zustand)
│   │   │   ├── index.ts                # Combined store
│   │   │   ├── timelineStore.ts        # Timeline state
│   │   │   ├── mediaStore.ts           # Media library state
│   │   │   ├── playbackStore.ts        # Playback state
│   │   │   ├── recordingStore.ts       # Recording state
│   │   │   └── exportStore.ts          # Export state
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useTimeline.ts          # Timeline operations
│   │   │   ├── usePlayback.ts          # Playback control
│   │   │   ├── useKeyboard.ts          # Keyboard shortcuts
│   │   │   └── useIPC.ts               # IPC communication
│   │   │
│   │   ├── utils/                      # Renderer utilities
│   │   │   ├── timeFormatting.ts       # Time display helpers
│   │   │   ├── canvasHelpers.ts        # Canvas drawing utilities
│   │   │   └── fileValidation.ts       # File validation
│   │   │
│   │   └── styles/                     # Global styles
│   │       ├── globals.css             # Global CSS
│   │       └── tailwind.css            # Tailwind imports
│   │
│   └── shared/                         # Shared code (Main + Renderer)
│       ├── types/                      # TypeScript types
│       │   ├── ipc.ts                  # IPC message types
│       │   ├── media.ts                # Media-related types
│       │   └── project.ts              # Project-related types
│       ├── constants.ts                # App constants
│       └── validation.ts               # Shared validation
│
├── resources/                          # Static resources
│   ├── bin/                            # Bundled binaries
│   │   ├── ffmpeg                      # FFmpeg (macOS/Linux)
│   │   ├── ffmpeg.exe                  # FFmpeg (Windows)
│   │   └── ffprobe                     # FFprobe (all platforms)
│   ├── icons/                          # App icons
│   │   ├── icon.icns                   # macOS icon
│   │   ├── icon.ico                    # Windows icon
│   │   └── icon.png                    # Linux icon
│   └── sample-videos/                  # Test videos (dev only)
│
├── .bmad-core/                         # BMAD framework
├── .cursor/                            # Cursor rules
├── .docs/                              # Documentation
│
├── electron-builder.yml                # Packaging config
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── tsconfig.node.json                  # Node TypeScript config
├── vite.config.ts                      # Vite config
├── tailwind.config.js                  # Tailwind config
└── .env.example                        # Environment variables

```

---

## 2. Electron Architecture

### 2.1 Process Model

Electron uses a multi-process architecture for security and stability:

```
┌──────────────────────────────────────────────────────────────┐
│                      Main Process (Node.js)                   │
│  - Window management                                          │
│  - IPC handlers                                               │
│  - File system access                                         │
│  - FFmpeg operations                                          │
│  - Native OS integration                                      │
└─────────────────────┬────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌────────────────────┐   ┌────────────────────┐
│ Renderer Process 1 │   │ Preload Script     │
│ (Chromium)         │◄──┤ (Secure Bridge)    │
│ - React UI         │   │ - Context Bridge   │
│ - Canvas Timeline  │   │ - API Exposure     │
│ - Video Playback   │   └────────────────────┘
└────────────────────┘
```

### 2.2 Main Process (`src/main/main.ts`)

**Responsibilities:**
- Create and manage application windows
- Handle app lifecycle events
- Register IPC handlers
- Initialize services
- Manage FFmpeg binary path

```typescript
// src/main/main.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIPCHandlers } from './ipc';
import { FFmpegManager } from './services/FFmpegManager';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private ffmpegManager: FFmpegManager;

  constructor() {
    this.ffmpegManager = new FFmpegManager();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Single instance lock
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private async onReady(): Promise<void> {
    // Initialize FFmpeg
    await this.ffmpegManager.initialize();

    // Register IPC handlers
    registerIPCHandlers();

    // Create main window
    this.createWindow();
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      backgroundColor: '#1a1a1a',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 15, y: 15 },
    });

    // Load renderer
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }
}

// Start application
new Application();
```

### 2.3 Preload Script (`src/main/preload.ts`)

**Security Bridge:** Exposes only necessary APIs to renderer process.

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { IpcAPI } from '@/shared/types/ipc';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: IpcAPI = {
  // Media operations
  media: {
    import: (filePaths: string[]) => ipcRenderer.invoke('media:import', filePaths),
    getMetadata: (filePath: string) => ipcRenderer.invoke('media:metadata', filePath),
    openFilePicker: () => ipcRenderer.invoke('media:open-picker'),
  },

  // Recording operations
  recording: {
    getSources: () => ipcRenderer.invoke('recording:get-sources'),
    start: (sourceId: string, options: any) => 
      ipcRenderer.invoke('recording:start', sourceId, options),
    stop: () => ipcRenderer.invoke('recording:stop'),
    onProgress: (callback: (progress: number) => void) => {
      ipcRenderer.on('recording:progress', (_, progress) => callback(progress));
    },
  },

  // Export operations
  export: {
    start: (config: any) => ipcRenderer.invoke('export:start', config),
    cancel: () => ipcRenderer.invoke('export:cancel'),
    onProgress: (callback: (progress: number) => void) => {
      ipcRenderer.on('export:progress', (_, progress) => callback(progress));
    },
  },

  // Project operations
  project: {
    save: (project: any) => ipcRenderer.invoke('project:save', project),
    load: () => ipcRenderer.invoke('project:load'),
    openSaveDialog: () => ipcRenderer.invoke('project:open-save-dialog'),
  },

  // System operations
  system: {
    getPath: (name: string) => ipcRenderer.invoke('system:get-path', name),
    showItemInFolder: (path: string) => ipcRenderer.invoke('system:show-item', path),
  },
};

contextBridge.exposeInMainWorld('api', api);

// Type augmentation for TypeScript
export type { IpcAPI };
```

### 2.4 Security Configuration

**Critical Security Measures:**
1. **Context Isolation:** Enabled (main world ≠ preload world)
2. **Node Integration:** Disabled in renderer
3. **Sandbox:** Enabled for renderer process
4. **Content Security Policy:** Strict CSP headers
5. **No Remote Module:** Not used (deprecated)

```typescript
// Security headers in main.ts
app.on('web-contents-created', (_, contents) => {
  // Prevent navigation to untrusted URLs
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  // Prevent opening new windows
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
```

---

## 3. FFmpeg Integration Strategy

### 3.1 FFmpeg Architecture

FFmpeg is the core video processing engine, handling trimming, concatenation, encoding, and format conversion.

```
┌─────────────────────────────────────────────────────────────┐
│                  FFmpeg Integration Layer                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐          ┌───────────────────────┐   │
│  │ FFmpegManager     │          │ fluent-ffmpeg         │   │
│  │                   │          │ (Node.js Wrapper)     │   │
│  │ - Binary path     │─────────▶│                       │   │
│  │ - Validation      │          │ - Promise API         │   │
│  │ - Fallback logic  │          │ - Progress events     │   │
│  └───────────────────┘          └───────────────────────┘   │
│           │                               │                  │
│           │                               │                  │
│           ▼                               ▼                  │
│  ┌───────────────────┐          ┌───────────────────────┐   │
│  │  FFmpeg Binary    │          │  FFprobe Binary       │   │
│  │  (Bundled)        │          │  (Metadata)           │   │
│  │                   │          │                       │   │
│  │  - Trim           │          │  - Duration           │   │
│  │  - Concat         │          │  - Resolution         │   │
│  │  - Encode         │          │  - Codec info         │   │
│  │  - Overlay        │          │  - Frame rate         │   │
│  └───────────────────┘          └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 FFmpeg Manager Service

```typescript
// src/main/services/FFmpegManager.ts
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

export class FFmpegManager {
  private ffmpegPath: string = '';
  private ffprobePath: string = '';
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      // Determine FFmpeg path based on environment
      const isDev = !app.isPackaged;
      
      if (isDev) {
        // Development: Use system FFmpeg
        this.ffmpegPath = 'ffmpeg';
        this.ffprobePath = 'ffprobe';
      } else {
        // Production: Use bundled FFmpeg
        const platform = process.platform;
        const binName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
        const probeName = platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';

        this.ffmpegPath = path.join(
          process.resourcesPath,
          'bin',
          binName
        );
        this.ffprobePath = path.join(
          process.resourcesPath,
          'bin',
          probeName
        );

        // Verify binaries exist
        await this.verifyBinaries();
      }

      // Configure fluent-ffmpeg
      ffmpeg.setFfmpegPath(this.ffmpegPath);
      ffmpeg.setFfprobePath(this.ffprobePath);

      // Validate FFmpeg works
      await this.validateFFmpeg();

      this.isInitialized = true;
      console.log('✅ FFmpeg initialized successfully');
    } catch (error) {
      console.error('❌ FFmpeg initialization failed:', error);
      throw new Error('FFmpeg initialization failed');
    }
  }

  private async verifyBinaries(): Promise<void> {
    try {
      await fs.access(this.ffmpegPath);
      await fs.access(this.ffprobePath);
    } catch (error) {
      throw new Error(`FFmpeg binaries not found at ${this.ffmpegPath}`);
    }
  }

  private async validateFFmpeg(): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          reject(new Error('FFmpeg validation failed'));
        } else {
          console.log(`FFmpeg supports ${Object.keys(formats).length} formats`);
          resolve();
        }
      });
    });
  }

  getFFmpegPath(): string {
    return this.ffmpegPath;
  }

  getFFprobePath(): string {
    return this.ffprobePath;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
```

### 3.3 Media Service (FFmpeg Operations)

```typescript
// src/main/services/MediaService.ts
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  size: number;
}

export interface TrimOptions {
  inputPath: string;
  outputPath: string;
  startTime: number;
  endTime: number;
}

export interface ConcatOptions {
  clips: Array<{ path: string; trimIn: number; trimOut: number }>;
  outputPath: string;
}

export class MediaService {
  /**
   * Get video metadata using FFprobe
   */
  async getMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          return reject(new Error('No video stream found'));
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFPS(videoStream.r_frame_rate || '30/1'),
          codec: videoStream.codec_name || 'unknown',
          size: metadata.format.size || 0,
        });
      });
    });
  }

  /**
   * Trim video (fast, no re-encoding)
   */
  async trimVideo(options: TrimOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(options.inputPath)
        .setStartTime(options.startTime)
        .setDuration(options.endTime - options.startTime)
        .outputOptions('-c copy') // Copy codec (no re-encoding)
        .output(options.outputPath)
        .on('start', (cmd) => {
          console.log('FFmpeg trim command:', cmd);
        })
        .on('progress', (progress) => {
          console.log(`Trimming: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log('✅ Trim complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ Trim error:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Concatenate multiple clips
   */
  async concatenateClips(options: ConcatOptions): Promise<void> {
    // Create temporary concat file
    const concatFilePath = path.join(
      app.getPath('temp'),
      `concat-${uuidv4()}.txt`
    );

    try {
      // Generate concat file content
      const concatContent = options.clips
        .map(clip => {
          return `file '${clip.path}'\ninpoint ${clip.trimIn}\noutpoint ${clip.trimOut}`;
        })
        .join('\n');

      await fs.writeFile(concatFilePath, concatContent);

      // Run FFmpeg concat
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions(['-c copy'])
          .output(options.outputPath)
          .on('progress', (progress) => {
            console.log(`Concatenating: ${progress.percent}% done`);
          })
          .on('end', async () => {
            // Clean up temp file
            await fs.unlink(concatFilePath);
            resolve();
          })
          .on('error', async (err) => {
            await fs.unlink(concatFilePath);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create picture-in-picture overlay
   */
  async createOverlay(
    mainVideo: string,
    overlayVideo: string,
    outputPath: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(mainVideo)
        .input(overlayVideo)
        .complexFilter([
          `[1:v]scale=${size.width}:${size.height}[ovr]`,
          `[0:v][ovr]overlay=${position.x}:${position.y}`,
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          console.log(`Creating overlay: ${progress.percent}% done`);
        })
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  /**
   * Parse FPS from FFprobe format (e.g., "30000/1001" → 29.97)
   */
  private parseFPS(fpsString: string): number {
    const [num, den] = fpsString.split('/').map(Number);
    return den ? num / den : num;
  }
}
```

### 3.4 FFmpeg Packaging Strategy

**electron-builder configuration:**

```yaml
# electron-builder.yml
appId: com.clipforge.app
productName: ClipForge
directories:
  output: release
  buildResources: resources

files:
  - dist
  - dist-electron
  - package.json

extraResources:
  - from: resources/bin
    to: bin
    filter:
      - ffmpeg
      - ffmpeg.exe
      - ffprobe
      - ffprobe.exe

mac:
  target:
    - dmg
    - zip
  category: public.app-category.video
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: resources/entitlements.mac.plist
  entitlementsInherit: resources/entitlements.mac.plist

win:
  target:
    - nsis
    - portable
  icon: resources/icons/icon.ico

linux:
  target:
    - AppImage
    - deb
  category: Video
  icon: resources/icons/
```

---

## 4. React Component Hierarchy

### 4.1 Component Tree

```
App
├── AppShell
│   ├── MenuBar
│   │   ├── FileMenu
│   │   ├── EditMenu
│   │   ├── ViewMenu
│   │   └── HelpMenu
│   │
│   ├── Toolbar
│   │   ├── ImportButton
│   │   ├── RecordButton
│   │   ├── ExportButton
│   │   ├── SplitButton
│   │   ├── DeleteButton
│   │   ├── UndoButton
│   │   └── RedoButton
│   │
│   ├── MainContent
│   │   ├── MediaLibrary (Left Panel)
│   │   │   ├── MediaLibraryHeader
│   │   │   ├── MediaGrid
│   │   │   │   └── MediaItem (multiple)
│   │   │   │       ├── Thumbnail
│   │   │   │       ├── FileName
│   │   │   │       └── Metadata
│   │   │   └── EmptyState
│   │   │
│   │   ├── PreviewSection (Center/Top)
│   │   │   ├── VideoPreview
│   │   │   │   ├── VideoPlayer
│   │   │   │   └── VideoOverlay
│   │   │   └── PlaybackControls
│   │   │       ├── PlayPauseButton
│   │   │       ├── TimeDisplay
│   │   │       ├── VolumeControl
│   │   │       └── FullscreenButton
│   │   │
│   │   └── TimelineSection (Bottom)
│   │       ├── TimelineToolbar
│   │       │   ├── ZoomSlider
│   │       │   ├── SnapToggle
│   │       │   └── TrackControls
│   │       ├── Timeline
│   │       │   ├── TimeRuler
│   │       │   ├── TrackList
│   │       │   │   └── Track (multiple)
│   │       │   │       ├── TrackHeader
│   │       │   │       └── ClipContainer
│   │       │   │           └── TimelineClip (multiple)
│   │       │   │               ├── ClipBody
│   │       │   │               ├── TrimHandle (left)
│   │       │   │               └── TrimHandle (right)
│   │       │   └── Playhead
│   │       └── TimelineCanvas (Underlying rendering)
│   │
│   └── StatusBar
│       ├── StatusMessage
│       ├── ZoomLevel
│       └── FPSIndicator
│
├── RecordDialog (Modal)
│   ├── SourceSelector
│   ├── CameraPreview
│   ├── AudioMeter
│   └── RecordControls
│
└── ExportDialog (Modal)
    ├── ExportSettings
    │   ├── QualityPreset
    │   ├── ResolutionPicker
    │   └── FileNameInput
    ├── ExportProgress
    └── ExportActions
```

### 4.2 Core Components

#### App Shell

```typescript
// src/renderer/components/layout/AppShell.tsx
import React from 'react';
import { MenuBar } from './MenuBar';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { MediaLibrary } from '../media/MediaLibrary';
import { VideoPreview } from '../preview/VideoPreview';
import { Timeline } from '../timeline/Timeline';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Menu Bar */}
      <MenuBar />

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Media Library - Left Panel */}
        <div className="w-64 border-r border-gray-700 overflow-y-auto">
          <MediaLibrary />
        </div>

        {/* Center/Right Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview - Top */}
          <div className="h-1/2 border-b border-gray-700 p-4">
            <VideoPreview />
          </div>

          {/* Timeline - Bottom */}
          <div className="flex-1 overflow-hidden">
            <Timeline />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};
```

#### Timeline Component

```typescript
// src/renderer/components/timeline/Timeline.tsx
import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '@/renderer/store/timelineStore';
import { TimeRuler } from './TimeRuler';
import { Track } from './Track';
import { Playhead } from './Playhead';
import { TimelineCanvas } from './TimelineCanvas';

export const Timeline: React.FC = () => {
  const { tracks, currentTime, zoom } = useTimelineStore();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-gray-800 overflow-auto"
    >
      {/* Time Ruler */}
      <TimeRuler zoom={zoom} />

      {/* Timeline Canvas (GPU-accelerated rendering) */}
      <TimelineCanvas tracks={tracks} zoom={zoom} />

      {/* Playhead Indicator */}
      <Playhead currentTime={currentTime} zoom={zoom} />

      {/* DOM-based Track List (for interaction) */}
      <div className="relative">
        {tracks.map(track => (
          <Track key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};
```

#### Video Preview Component

```typescript
// src/renderer/components/preview/VideoPreview.tsx
import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '@/renderer/store/timelineStore';
import { usePlaybackStore } from '@/renderer/store/playbackStore';
import { PlaybackControls } from './PlaybackControls';

export const VideoPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { clips, currentTime } = useTimelineStore();
  const { isPlaying, play, pause } = usePlaybackStore();

  // Sync video with timeline
  useEffect(() => {
    if (!videoRef.current) return;

    const activeClip = clips.find(
      c => currentTime >= c.startTime && currentTime <= c.endTime
    );

    if (activeClip) {
      const videoTime = currentTime - activeClip.startTime + activeClip.trimIn;
      videoRef.current.src = `file://${activeClip.sourceFile}`;
      videoRef.current.currentTime = videoTime;
    }
  }, [currentTime, clips]);

  // Handle playback
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full">
      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="max-w-full max-h-full"
          onPlay={() => play()}
          onPause={() => pause()}
        />
      </div>

      {/* Playback Controls */}
      <PlaybackControls />
    </div>
  );
};
```

### 4.3 Component Communication Patterns

**1. Props Down, Events Up**
- Parent components pass data via props
- Child components emit events via callbacks

**2. Global State (Zustand)**
- Timeline state shared across components
- Playback state synchronized

**3. IPC for Main Process**
- Use `window.api` exposed by preload script
- Async operations (import, export, recording)

---

## 5. State Management

### 5.1 Zustand Store Architecture

ClipForge uses **Zustand** for simple, performant state management without boilerplate.

```typescript
// src/renderer/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { timelineSlice, TimelineSlice } from './timelineStore';
import { mediaSlice, MediaSlice } from './mediaStore';
import { playbackSlice, PlaybackSlice } from './playbackStore';
import { recordingSlice, RecordingSlice } from './recordingStore';
import { exportSlice, ExportSlice } from './exportStore';

// Combined store type
export interface AppStore extends
  TimelineSlice,
  MediaSlice,
  PlaybackSlice,
  RecordingSlice,
  ExportSlice {}

// Create combined store
export const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...timelineSlice(set, get, api),
        ...mediaSlice(set, get, api),
        ...playbackSlice(set, get, api),
        ...recordingSlice(set, get, api),
        ...exportSlice(set, get, api),
      }),
      {
        name: 'clipforge-storage',
        partialize: (state) => ({
          // Only persist project data, not transient state
          timeline: state.timeline,
          media: state.mediaLibrary,
        }),
      }
    )
  )
);
```

### 5.2 Timeline Store

```typescript
// src/renderer/store/timelineStore.ts
import { StateCreator } from 'zustand';
import { Clip, Track } from '@/shared/types/media';
import { v4 as uuidv4 } from 'uuid';

export interface TimelineState {
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipId: string | null;
}

export interface TimelineActions {
  addClip: (clip: Clip, trackId: string) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  selectClip: (clipId: string | null) => void;
}

export type TimelineSlice = TimelineState & TimelineActions;

export const timelineSlice: StateCreator<TimelineSlice> = (set, get) => ({
  // Initial state
  tracks: [
    { id: 'track-1', name: 'Track 1', clips: [], muted: false, locked: false, visible: true },
    { id: 'track-2', name: 'Track 2', clips: [], muted: false, locked: false, visible: true },
  ],
  currentTime: 0,
  duration: 0,
  zoom: 1,
  selectedClipId: null,

  // Actions
  addClip: (clip, trackId) => {
    set((state) => {
      const trackIndex = state.tracks.findIndex(t => t.id === trackId);
      if (trackIndex === -1) return state;

      const newTracks = [...state.tracks];
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        clips: [...newTracks[trackIndex].clips, clip],
      };

      return {
        tracks: newTracks,
        duration: Math.max(state.duration, clip.endTime),
      };
    });
  },

  removeClip: (clipId) => {
    set((state) => ({
      tracks: state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(c => c.id !== clipId),
      })),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  updateClip: (clipId, updates) => {
    set((state) => ({
      tracks: state.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId ? { ...clip, ...updates } : clip
        ),
      })),
    }));
  },

  splitClip: (clipId, splitTime) => {
    set((state) => {
      const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
      if (!track) return state;

      const clip = track.clips.find(c => c.id === clipId);
      if (!clip) return state;

      // Create two new clips
      const clip1: Clip = {
        ...clip,
        id: uuidv4(),
        endTime: splitTime,
        trimOut: clip.trimIn + (splitTime - clip.startTime),
      };

      const clip2: Clip = {
        ...clip,
        id: uuidv4(),
        startTime: splitTime,
        trimIn: clip.trimIn + (splitTime - clip.startTime),
      };

      return {
        tracks: state.tracks.map(t =>
          t.id === track.id
            ? {
                ...t,
                clips: t.clips.flatMap(c =>
                  c.id === clipId ? [clip1, clip2] : [c]
                ),
              }
            : t
        ),
      };
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setZoom: (zoom) => set({ zoom }),
  selectClip: (clipId) => set({ selectedClipId: clipId }),
});
```

### 5.3 Playback Store

```typescript
// src/renderer/store/playbackStore.ts
import { StateCreator } from 'zustand';

export interface PlaybackState {
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export type PlaybackSlice = PlaybackState & PlaybackActions;

export const playbackSlice: StateCreator<PlaybackSlice> = (set) => ({
  isPlaying: false,
  volume: 1.0,
  playbackRate: 1.0,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
});
```

---

## 6. Data Models

### 6.1 Core Domain Models

```typescript
// src/shared/types/media.ts

/**
 * Represents a video clip on the timeline
 */
export interface Clip {
  id: string;
  sourceFile: string;         // Absolute path to source video file
  startTime: number;           // Start time on timeline (seconds)
  endTime: number;             // End time on timeline (seconds)
  trimIn: number;              // Trim start (seconds from file start)
  trimOut: number;             // Trim end (seconds from file start)
  trackId: string;             // Parent track ID
  metadata: VideoMetadata;
}

/**
 * Video file metadata
 */
export interface VideoMetadata {
  duration: number;            // Total duration (seconds)
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;           // FPS (e.g., 30, 60)
  codec: string;               // e.g., 'h264', 'vp9'
  size: number;                // File size (bytes)
  thumbnail?: string;          // Base64 thumbnail or file path
}

/**
 * Timeline track
 */
export interface Track {
  id: string;
  name: string;
  clips: Clip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

/**
 * Project model
 */
export interface Project {
  id: string;
  name: string;
  version: string;
  timeline: {
    tracks: Track[];
    duration: number;          // Total timeline duration (seconds)
  };
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

/**
 * Project settings
 */
export interface ProjectSettings {
  fps: number;                 // Project FPS (default: 30)
  resolution: {
    width: number;
    height: number;
  };
  audioSampleRate: number;     // e.g., 44100, 48000
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  created: Date;
  modified: Date;
  author?: string;
}
```

### 6.2 Recording Models

```typescript
// src/shared/types/recording.ts

/**
 * Screen/window source for recording
 */
export interface RecordingSource {
  id: string;
  name: string;
  type: 'screen' | 'window';
  thumbnail: string;           // Base64 image
}

/**
 * Recording configuration
 */
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

/**
 * Recording state
 */
export interface RecordingState {
  isRecording: boolean;
  duration: number;            // Current recording duration
  outputPath?: string;         // Where recording will be saved
}
```

### 6.3 Export Models

```typescript
// src/shared/types/export.ts

/**
 * Export configuration
 */
export interface ExportConfig {
  outputPath: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  codec: 'h264' | 'h265' | 'vp9';
  bitrate?: string;            // e.g., '5000k'
}

/**
 * Export progress
 */
export interface ExportProgress {
  percent: number;             // 0-100
  currentFrame: number;
  totalFrames: number;
  fps: number;                 // Encoding FPS
  eta: number;                 // Estimated seconds remaining
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  outputPath: string;
  duration: number;            // Encoding duration (seconds)
  fileSize: number;            // Output file size (bytes)
  error?: string;
}
```

---

## 7. Video Processing Pipeline

### 7.1 Processing Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 Video Processing Pipeline                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Import                                                    │
│     ┌────────────┐                                            │
│     │ File Input │──▶ FFprobe ──▶ Metadata Extraction        │
│     └────────────┘         │                                  │
│                            └──▶ Thumbnail Generation          │
│                                                               │
│  2. Timeline Composition                                      │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│     │  Clip 1  │───▶│  Clip 2  │───▶│  Clip 3  │            │
│     └──────────┘    └──────────┘    └──────────┘            │
│          │               │               │                    │
│          └───────────────┴───────────────┘                    │
│                          │                                    │
│                          ▼                                    │
│  3. Export Pipeline                                           │
│     ┌─────────────────────────────────────────┐              │
│     │ Generate FFmpeg Filter Complex          │              │
│     └────────────┬────────────────────────────┘              │
│                  │                                            │
│     ┌────────────▼────────────────────────────┐              │
│     │ FFmpeg Processing                       │              │
│     │ - Trim individual clips                 │              │
│     │ - Concatenate clips                     │              │
│     │ - Apply overlays (PiP)                  │              │
│     │ - Encode to target format               │              │
│     └────────────┬────────────────────────────┘              │
│                  │                                            │
│     ┌────────────▼────────────────────────────┐              │
│     │ Output File                             │              │
│     └─────────────────────────────────────────┘              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Import Pipeline

```typescript
// src/renderer/core/usecases/ImportClip.ts
import { v4 as uuidv4 } from 'uuid';
import { Clip, VideoMetadata } from '@/shared/types/media';

export class ImportClipUseCase {
  async execute(filePaths: string[]): Promise<Clip[]> {
    const clips: Clip[] = [];

    for (const filePath of filePaths) {
      try {
        // Get metadata via IPC
        const metadata: VideoMetadata = await window.api.media.getMetadata(filePath);

        // Create clip
        const clip: Clip = {
          id: uuidv4(),
          sourceFile: filePath,
          startTime: 0,
          endTime: metadata.duration,
          trimIn: 0,
          trimOut: metadata.duration,
          trackId: '', // Will be set when added to track
          metadata,
        };

        clips.push(clip);
      } catch (error) {
        console.error(`Failed to import ${filePath}:`, error);
      }
    }

    return clips;
  }
}
```

### 7.3 Trim Pipeline

```typescript
// src/renderer/core/usecases/TrimClip.ts
import { Clip } from '@/shared/types/media';

export class TrimClipUseCase {
  execute(clip: Clip, newTrimIn: number, newTrimOut: number): Clip {
    // Validate trim points
    const maxDuration = clip.metadata.duration;
    const validTrimIn = Math.max(0, Math.min(newTrimIn, maxDuration));
    const validTrimOut = Math.max(validTrimIn, Math.min(newTrimOut, maxDuration));

    // Update clip
    return {
      ...clip,
      trimIn: validTrimIn,
      trimOut: validTrimOut,
      endTime: clip.startTime + (validTrimOut - validTrimIn),
    };
  }
}
```

### 7.4 Export Pipeline

```typescript
// src/main/services/ExportService.ts
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { Clip, Track } from '@/shared/types/media';
import { ExportConfig, ExportProgress } from '@/shared/types/export';

export class ExportService {
  private activeExport: any = null;

  async exportTimeline(
    tracks: Track[],
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<void> {
    // Flatten all clips across tracks
    const allClips = tracks.flatMap(t => t.clips).sort((a, b) => a.startTime - b.startTime);

    if (allClips.length === 0) {
      throw new Error('No clips to export');
    }

    // Single clip: simple trim
    if (allClips.length === 1 && tracks.length === 1) {
      return this.exportSingleClip(allClips[0], config, onProgress);
    }

    // Multiple clips or tracks: complex export
    return this.exportMultipleClips(tracks, config, onProgress);
  }

  private async exportSingleClip(
    clip: Clip,
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.activeExport = ffmpeg(clip.sourceFile)
        .setStartTime(clip.trimIn)
        .setDuration(clip.trimOut - clip.trimIn)
        .size(`${config.resolution.width}x${config.resolution.height}`)
        .fps(config.fps)
        .videoCodec(config.codec === 'h264' ? 'libx264' : 'libx265')
        .audioCodec('aac')
        .output(config.outputPath)
        .on('progress', (info) => {
          onProgress({
            percent: info.percent || 0,
            currentFrame: info.frames || 0,
            totalFrames: Math.ceil((clip.trimOut - clip.trimIn) * config.fps),
            fps: info.currentFps || 0,
            eta: 0, // Calculate based on progress
          });
        })
        .on('end', () => {
          this.activeExport = null;
          resolve();
        })
        .on('error', (err) => {
          this.activeExport = null;
          reject(err);
        })
        .run();
    });
  }

  private async exportMultipleClips(
    tracks: Track[],
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<void> {
    // Step 1: Build filter_complex for multi-track composition
    const filterComplex = this.buildFilterComplex(tracks, config);

    // Step 2: Execute FFmpeg with complex filter
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add all input files
      const uniqueSources = new Set(
        tracks.flatMap(t => t.clips.map(c => c.sourceFile))
      );
      uniqueSources.forEach(source => command.input(source));

      // Apply complex filter
      this.activeExport = command
        .complexFilter(filterComplex)
        .size(`${config.resolution.width}x${config.resolution.height}`)
        .fps(config.fps)
        .videoCodec('libx264')
        .audioCodec('aac')
        .output(config.outputPath)
        .on('progress', (info) => {
          onProgress({
            percent: info.percent || 0,
            currentFrame: info.frames || 0,
            totalFrames: 0, // Calculate from timeline duration
            fps: info.currentFps || 0,
            eta: 0,
          });
        })
        .on('end', () => {
          this.activeExport = null;
          resolve();
        })
        .on('error', (err) => {
          this.activeExport = null;
          reject(err);
        })
        .run();
    });
  }

  private buildFilterComplex(tracks: Track[], config: ExportConfig): string[] {
    // Example: Picture-in-picture with two tracks
    // Track 1: Main video
    // Track 2: Overlay video (scaled and positioned)
    
    if (tracks.length === 1) {
      // Simple concat
      const clips = tracks[0].clips;
      return clips.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${clips.length}:v=1:a=1[outv][outa]`;
    }

    if (tracks.length === 2) {
      // PiP: Main + Overlay
      return [
        '[1:v]scale=320:240[ovr]',
        '[0:v][ovr]overlay=W-w-10:H-h-10[outv]',
        '[0:a][1:a]amix=inputs=2[outa]',
      ];
    }

    // More complex scenarios would require additional logic
    return [];
  }

  cancelExport(): void {
    if (this.activeExport) {
      this.activeExport.kill('SIGKILL');
      this.activeExport = null;
    }
  }
}
```

---

## 8. Recording Architecture

### 8.1 Screen Recording Service

```typescript
// src/main/services/RecordingService.ts
import { desktopCapturer, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { RecordingSource, RecordingConfig } from '@/shared/types/recording';

export class RecordingService {
  private activeRecording: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  /**
   * Get available screen/window sources
   */
  async getSources(): Promise<RecordingSource[]> {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
    });

    return sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.id.startsWith('screen') ? 'screen' : 'window',
      thumbnail: source.thumbnail.toDataURL(),
    }));
  }

  /**
   * Start recording
   * Note: Actual MediaRecorder is created in renderer process
   * This method just handles source selection
   */
  async startRecording(config: RecordingConfig): Promise<string> {
    // Return source ID for renderer to start recording
    return config.sourceId;
  }

  /**
   * Save recorded blob to file
   */
  async saveRecording(buffer: Buffer, filename: string): Promise<string> {
    const outputDir = path.join(app.getPath('videos'), 'ClipForge');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, filename);
    await fs.writeFile(outputPath, buffer);

    return outputPath;
  }
}
```

### 8.2 Renderer-Side Recording

```typescript
// src/renderer/hooks/useRecording.ts
import { useState, useCallback, useRef } from 'react';
import { RecordingSource, RecordingConfig } from '@/shared/types/recording';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [sources, setSources] = useState<RecordingSource[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const getSources = useCallback(async () => {
    const sourcesData = await window.api.recording.getSources();
    setSources(sourcesData);
    return sourcesData;
  }, []);

  const startRecording = useCallback(async (config: RecordingConfig) => {
    try {
      // Get media stream from selected source
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config.includeAudio,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: config.sourceId,
            minWidth: config.resolution.width,
            maxWidth: config.resolution.width,
            minHeight: config.resolution.height,
            maxHeight: config.resolution.height,
          },
        } as any,
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const buffer = Buffer.from(await blob.arrayBuffer());
        
        // Save via IPC
        const filename = `recording-${Date.now()}.webm`;
        const outputPath = await window.api.recording.save(buffer, filename);
        
        console.log('Recording saved:', outputPath);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    sources,
    getSources,
    startRecording,
    stopRecording,
  };
}
```

---

## 9. Timeline Rendering System

### 9.1 Canvas-Based Timeline

The timeline uses **HTML5 Canvas** for high-performance rendering of hundreds of clips.

```typescript
// src/renderer/components/timeline/TimelineCanvas.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Track, Clip } from '@/shared/types/media';

interface TimelineCanvasProps {
  tracks: Track[];
  zoom: number;
  currentTime: number;
  onClipClick?: (clip: Clip) => void;
}

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  tracks,
  zoom,
  currentTime,
  onClipClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Pixels per second
  const pixelsPerSecond = 50 * zoom;

  // Track height
  const trackHeight = 80;

  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tracks
    tracks.forEach((track, trackIndex) => {
      const y = trackIndex * trackHeight;

      // Draw track background
      ctx.fillStyle = trackIndex % 2 === 0 ? '#2a2a2a' : '#333333';
      ctx.fillRect(0, y, canvas.width, trackHeight);

      // Draw clips
      track.clips.forEach(clip => {
        const x = clip.startTime * pixelsPerSecond;
        const width = (clip.endTime - clip.startTime) * pixelsPerSecond;

        // Clip background
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(x, y + 5, width, trackHeight - 10);

        // Clip border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 5, width, trackHeight - 10);

        // Clip name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(
          clip.sourceFile.split('/').pop() || 'Clip',
          x + 10,
          y + 30
        );
      });
    });

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();

  }, [tracks, zoom, currentTime, pixelsPerSecond]);

  useEffect(() => {
    const animate = () => {
      drawTimeline();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawTimeline]);

  // Handle click events
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onClipClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked clip
    const trackIndex = Math.floor(y / trackHeight);
    const track = tracks[trackIndex];
    if (!track) return;

    const clickTime = x / pixelsPerSecond;
    const clip = track.clips.find(
      c => clickTime >= c.startTime && clickTime <= c.endTime
    );

    if (clip) {
      onClipClick(clip);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={3000}
      height={tracks.length * trackHeight}
      className="absolute top-0 left-0"
      onClick={handleClick}
    />
  );
};
```

### 9.2 Timeline Interaction

```typescript
// src/renderer/hooks/useTimeline.ts
import { useCallback, useEffect } from 'react';
import { useStore } from '@/renderer/store';
import { Clip } from '@/shared/types/media';

export function useTimeline() {
  const {
    tracks,
    currentTime,
    zoom,
    selectedClipId,
    addClip,
    removeClip,
    updateClip,
    splitClip,
    setCurrentTime,
    setZoom,
    selectClip,
  } = useStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space: Play/Pause
      if (event.code === 'Space') {
        event.preventDefault();
        // Toggle playback
      }

      // Delete: Remove selected clip
      if (event.code === 'Delete' && selectedClipId) {
        event.preventDefault();
        removeClip(selectedClipId);
      }

      // Cmd/Ctrl + K: Split at playhead
      if ((event.metaKey || event.ctrlKey) && event.code === 'KeyK') {
        event.preventDefault();
        if (selectedClipId) {
          splitClip(selectedClipId, currentTime);
        }
      }

      // Arrow keys: Seek
      if (event.code === 'ArrowLeft') {
        setCurrentTime(Math.max(0, currentTime - 1));
      }
      if (event.code === 'ArrowRight') {
        setCurrentTime(currentTime + 1);
      }

      // Zoom
      if ((event.metaKey || event.ctrlKey) && event.code === 'Equal') {
        event.preventDefault();
        setZoom(Math.min(5, zoom * 1.2));
      }
      if ((event.metaKey || event.ctrlKey) && event.code === 'Minus') {
        event.preventDefault();
        setZoom(Math.max(0.2, zoom / 1.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, zoom, selectedClipId]);

  return {
    tracks,
    currentTime,
    zoom,
    selectedClipId,
    addClip,
    removeClip,
    updateClip,
    splitClip,
    setCurrentTime,
    setZoom,
    selectClip,
  };
}
```

---

## 10. Export Architecture

*[Covered in Section 7.4 Export Pipeline]*

---

## 11. IPC Communication Layer

### 11.1 IPC Message Types

```typescript
// src/shared/types/ipc.ts

export interface IpcAPI {
  media: {
    import: (filePaths: string[]) => Promise<Clip[]>;
    getMetadata: (filePath: string) => Promise<VideoMetadata>;
    openFilePicker: () => Promise<string[] | null>;
  };

  recording: {
    getSources: () => Promise<RecordingSource[]>;
    start: (sourceId: string, options: RecordingConfig) => Promise<void>;
    stop: () => Promise<string>;
    onProgress: (callback: (progress: number) => void) => void;
  };

  export: {
    start: (config: ExportConfig) => Promise<void>;
    cancel: () => Promise<void>;
    onProgress: (callback: (progress: ExportProgress) => void) => void;
  };

  project: {
    save: (project: Project) => Promise<void>;
    load: () => Promise<Project | null>;
    openSaveDialog: () => Promise<string | null>;
  };

  system: {
    getPath: (name: string) => Promise<string>;
    showItemInFolder: (path: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    api: IpcAPI;
  }
}
```

### 11.2 IPC Handler Registration

```typescript
// src/main/ipc/index.ts
import { ipcMain } from 'electron';
import { registerMediaHandlers } from './mediaHandlers';
import { registerRecordingHandlers } from './recordHandlers';
import { registerExportHandlers } from './exportHandlers';
import { registerProjectHandlers } from './projectHandlers';
import { registerSystemHandlers } from './systemHandlers';

export function registerIPCHandlers(): void {
  registerMediaHandlers(ipcMain);
  registerRecordingHandlers(ipcMain);
  registerExportHandlers(ipcMain);
  registerProjectHandlers(ipcMain);
  registerSystemHandlers(ipcMain);

  console.log('✅ IPC handlers registered');
}
```

### 11.3 Example IPC Handlers

```typescript
// src/main/ipc/mediaHandlers.ts
import { ipcMain, IpcMainInvokeEvent, dialog } from 'electron';
import { MediaService } from '../services/MediaService';

const mediaService = new MediaService();

export function registerMediaHandlers(ipc: typeof ipcMain): void {
  // Import videos
  ipc.handle('media:import', async (event: IpcMainInvokeEvent, filePaths: string[]) => {
    try {
      const clips = [];
      for (const filePath of filePaths) {
        const metadata = await mediaService.getMetadata(filePath);
        clips.push({
          id: uuidv4(),
          sourceFile: filePath,
          metadata,
          // ... other clip properties
        });
      }
      return clips;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  });

  // Get metadata
  ipc.handle('media:metadata', async (event: IpcMainInvokeEvent, filePath: string) => {
    return mediaService.getMetadata(filePath);
  });

  // Open file picker
  ipc.handle('media:open-picker', async (event: IpcMainInvokeEvent) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'mov', 'webm', 'avi', 'mkv'] },
      ],
    });

    return result.canceled ? null : result.filePaths;
  });
}
```

---

## 12. File System Management

### 12.1 File Storage Strategy

```
User's System:
├── Videos/
│   └── ClipForge/
│       ├── Recordings/          # Screen/webcam recordings
│       │   ├── recording-1.webm
│       │   └── recording-2.webm
│       └── Exports/             # Exported videos
│           ├── my-video.mp4
│           └── tutorial.mp4
│
├── Documents/
│   └── ClipForge/
│       └── Projects/            # Project files
│           ├── project-1.cfp
│           └── project-2.cfp
│
└── Application Support/         # App data (macOS/Linux)
    └── ClipForge/
        ├── cache/               # Thumbnail cache
        ├── logs/                # Error logs
        └── settings.json        # User settings
```

### 12.2 Project Persistence

```typescript
// src/main/services/ProjectService.ts
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { Project } from '@/shared/types/project';

export class ProjectService {
  private projectsDir: string;

  constructor() {
    this.projectsDir = path.join(
      app.getPath('documents'),
      'ClipForge',
      'Projects'
    );
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.projectsDir, { recursive: true });
  }

  async saveProject(project: Project, filePath?: string): Promise<string> {
    const savePath = filePath || path.join(
      this.projectsDir,
      `${project.name}.cfp`
    );

    const projectData = JSON.stringify(project, null, 2);
    await fs.writeFile(savePath, projectData, 'utf-8');

    return savePath;
  }

  async loadProject(filePath: string): Promise<Project> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async listProjects(): Promise<string[]> {
    const files = await fs.readdir(this.projectsDir);
    return files.filter(f => f.endsWith('.cfp'));
  }
}
```

---

## 13. Performance Optimization

### 13.1 Optimization Strategies

**1. Canvas Rendering**
- Use `requestAnimationFrame` for smooth 60 FPS
- Implement clip culling (don't render off-screen clips)
- Cache rendered thumbnails

**2. Video Playback**
- Preload next clip for seamless transitions
- Use hardware acceleration
- Implement video texture caching

**3. State Management**
- Memoize expensive computations with `useMemo`
- Use `useCallback` to prevent unnecessary re-renders
- Implement virtual scrolling for large clip libraries

**4. FFmpeg Operations**
- Use `-c copy` when possible (no re-encoding)
- Leverage hardware acceleration (`-hwaccel auto`)
- Process clips in parallel when appropriate

### 13.2 Performance Monitoring

```typescript
// src/renderer/components/layout/StatusBar.tsx
import React, { useState, useEffect } from 'react';

export const StatusBar: React.FC = () => {
  const [fps, setFPS] = useState(60);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        setFPS(Math.round(frames / (elapsed / 1000)));
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="h-8 bg-gray-800 border-t border-gray-700 px-4 flex items-center justify-between text-sm">
      <div>Ready</div>
      <div>FPS: {fps}</div>
    </div>
  );
};
```

---

## 14. Security Considerations

### 14.1 Security Checklist

✅ **Context Isolation**: Enabled  
✅ **Node Integration**: Disabled in renderer  
✅ **Sandbox**: Enabled  
✅ **Content Security Policy**: Strict headers  
✅ **File Path Validation**: Sanitize all user-provided paths  
✅ **IPC Validation**: Validate all IPC messages  

### 14.2 File Path Sanitization

```typescript
// src/main/utils/pathValidator.ts
import path from 'path';

export class PathValidator {
  static isValidVideoFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    return allowedExtensions.includes(ext);
  }

  static sanitizePath(filePath: string): string {
    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Prevent path traversal
    if (resolved.includes('..')) {
      throw new Error('Invalid path: path traversal not allowed');
    }

    return resolved;
  }
}
```

---

## 15. Build & Packaging Strategy

### 15.1 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist-renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
```

### 15.2 Electron Builder Configuration

*[See Section 3.4 for complete config]*

### 15.3 Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:electron": "electron .",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.node.json",
    "build": "npm run build:renderer && npm run build:main",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux",
    "package:all": "electron-builder -mwl"
  }
}
```

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
                    ▲
                   ╱ ╲
                  ╱   ╲
                 ╱ E2E ╲           5% - Full app workflows
                ╱───────╲
               ╱         ╲
              ╱Integration╲        15% - IPC, Services
             ╱─────────────╲
            ╱               ╲
           ╱   Unit Tests    ╲     80% - Business logic
          ╱───────────────────╲
```

### 16.2 Unit Testing Example

```typescript
// src/renderer/core/usecases/__tests__/TrimClip.test.ts
import { TrimClipUseCase } from '../TrimClip';
import { Clip } from '@/shared/types/media';

describe('TrimClipUseCase', () => {
  const useCase = new TrimClipUseCase();

  const mockClip: Clip = {
    id: 'clip-1',
    sourceFile: '/path/to/video.mp4',
    startTime: 0,
    endTime: 10,
    trimIn: 0,
    trimOut: 10,
    trackId: 'track-1',
    metadata: {
      duration: 10,
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      codec: 'h264',
      size: 1000000,
    },
  };

  it('should trim clip correctly', () => {
    const trimmed = useCase.execute(mockClip, 2, 8);
    
    expect(trimmed.trimIn).toBe(2);
    expect(trimmed.trimOut).toBe(8);
    expect(trimmed.endTime).toBe(6); // startTime (0) + duration (6)
  });

  it('should clamp trim values to valid range', () => {
    const trimmed = useCase.execute(mockClip, -5, 15);
    
    expect(trimmed.trimIn).toBe(0);
    expect(trimmed.trimOut).toBe(10);
  });
});
```

---

## 17. Deployment Architecture

### 17.1 Distribution Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Release Distribution                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  macOS:                                                      │
│    - ClipForge.dmg   (installer)                            │
│    - ClipForge.zip   (portable)                             │
│                                                              │
│  Windows:                                                    │
│    - ClipForge-Setup.exe   (NSIS installer)                 │
│    - ClipForge-Portable.exe                                 │
│                                                              │
│  Linux:                                                      │
│    - ClipForge.AppImage                                     │
│    - ClipForge.deb                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 17.2 Release Process

1. **Build**
   ```bash
   npm run build
   npm run package:all
   ```

2. **Test Packaged App**
   - Launch on clean VM
   - Verify FFmpeg bundled correctly
   - Test import → edit → export workflow

3. **Create GitHub Release**
   - Tag version (e.g., `v1.0.0`)
   - Upload binaries
   - Write release notes

4. **Future: Auto-Updates**
   - Use electron-updater
   - Host updates on GitHub Releases or custom server

---

## Conclusion

This architecture provides ClipForge with a solid foundation for rapid development while maintaining production quality. The separation of concerns, clean abstraction layers, and performance-first approach ensure that the MVP can scale into the final product seamlessly.

**Key Takeaways:**
- ✅ **Electron + React + TypeScript** for rapid desktop app development
- ✅ **FFmpeg** as the core video processing engine
- ✅ **Canvas-based timeline** for 60 FPS performance
- ✅ **Zustand** for simple, effective state management
- ✅ **Clean Architecture** to support future extensibility

**Next Steps:**
1. Initialize project with boilerplate
2. Implement core services (FFmpeg, Media, Recording)
3. Build UI components (Timeline, Preview, Media Library)
4. Integrate IPC communication
5. Test and package for distribution

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Architect:** Winston (BMAD)  
**Status:** Ready for Implementation 🚀

