# Contract Files - Implementation Guide

**Purpose:** Step-by-step guide to create the contract files that enable modular development  
**Date:** October 27, 2025  
**Status:** Ready to Implement

---

## 📁 Files to Create (In Order)

### Step 1: Create Directory Structure

```bash
mkdir -p src/shared/contracts
mkdir -p src/shared/types
```

---

### Step 2: Create Type Definitions

**File:** `src/shared/types/index.ts`

```typescript
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
```

---

### Step 3: Create IPC Channel Constants

**File:** `src/shared/contracts/ipc-channels.ts`

```typescript
/**
 * IPC Channel Names - Single Source of Truth
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

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
```

---

### Step 4: Create IPC Contracts

**File:** `src/shared/contracts/ipc.ts`

This file is **VERY LONG** (already defined in ClipForge-Modular-Architecture.md).

Copy the entire IPC section from the modular architecture document.

**Key exports:**
- `MediaIPC` namespace
- `RecordingIPC` namespace
- `ExportIPC` namespace
- `ProjectIPC` namespace
- `SystemIPC` namespace
- `IpcAPI` interface
- `declare global { interface Window { api: IpcAPI } }`

---

### Step 5: Create Store Contracts

**File:** `src/shared/contracts/stores.ts`

This file is **VERY LONG** (already defined in ClipForge-Modular-Architecture.md).

Copy the entire Store section from the modular architecture document.

**Key exports:**
- `TimelineStoreContract` namespace
- `MediaLibraryStoreContract` namespace
- `RecordingStoreContract` namespace
- `ExportStoreContract` namespace
- `ProjectStoreContract` namespace
- `AppStoreContract` namespace

---

### Step 6: Create Component Props Contracts

**File:** `src/shared/contracts/components.ts`

This file is **VERY LONG** (already defined in ClipForge-Modular-Architecture.md).

Copy the entire Component Props section from the modular architecture document.

**Key exports:**
- `LayoutComponentProps` namespace
- `MediaLibraryComponentProps` namespace
- `TimelineComponentProps` namespace
- `VideoPreviewComponentProps` namespace
- `RecordingComponentProps` namespace
- `ExportComponentProps` namespace
- `CommonComponentProps` namespace

---

### Step 7: Create Service Contracts

**File:** `src/shared/contracts/services.ts`

This file is **VERY LONG** (already defined in ClipForge-Modular-Architecture.md).

Copy the entire Service section from the modular architecture document.

**Key exports:**
- `IMediaService` interface
- `IRecordingService` interface
- `IExportService` interface
- `IProjectService` interface
- `IFFmpegManager` interface

---

### Step 8: Create Testing Contracts

**File:** `src/shared/contracts/testing.ts`

```typescript
/**
 * Testing Contracts - Mock Interfaces
 */

import { IpcAPI } from './ipc';

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
    onProgress: jest.fn(() => () => {}),
  },
  export: {
    start: jest.fn(),
    cancel: jest.fn(),
    onProgress: jest.fn(() => () => {}),
    onComplete: jest.fn(() => () => {}),
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
```

---

### Step 9: Create Barrel Export

**File:** `src/shared/contracts/index.ts`

```typescript
/**
 * Barrel export for all contracts
 */

export * from './ipc';
export * from './ipc-channels';
export * from './stores';
export * from './components';
export * from './services';
export * from './testing';
```

---

### Step 10: Create Path Aliases in tsconfig.json

**Update:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["src/shared/*"],
      "@contracts/*": ["src/shared/contracts/*"],
      "@types": ["src/shared/types"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "dist-electron"]
}
```

---

## 🎯 Validation Checklist

After creating all contract files, verify:

### TypeScript Compilation
```bash
npx tsc --noEmit
```
Should have **0 errors**.

### Import Resolution
Test that contracts can be imported:

```typescript
// Test file: src/test-contracts.ts
import { IpcAPI } from '@contracts/ipc';
import { TimelineStoreContract } from '@contracts/stores';
import { IMediaService } from '@contracts/services';
import { Clip, Project } from '@types';

// If this compiles, contracts are working
const testClip: Clip = null!;
const testStore: TimelineStoreContract.Store = null!;
```

### Circular Dependency Check
Contracts should NOT import from each other (except types).

✅ **Good:**
```typescript
// In stores.ts
import { Clip, Track } from '../types';
```

❌ **Bad:**
```typescript
// In stores.ts
import { MediaIPC } from './ipc'; // CIRCULAR!
```

---

## 🚀 Next Steps

Once contract files are created:

1. **Commit contracts to main branch**
   ```bash
   git add src/shared/contracts/
   git add src/shared/types/
   git commit -m "feat: add modular architecture contracts"
   git push origin main
   ```

2. **Create feature branches for each track**
   ```bash
   git checkout -b feature/track-1-main-core
   git checkout -b feature/track-2-media-service
   # ... etc
   ```

3. **Assign tracks to agents**
   - Each agent clones repo
   - Checks out their feature branch
   - Implements their track
   - Only modifies files they own

4. **Daily integration**
   - Merge completed tracks to `develop` branch
   - Run integration tests
   - Fix any issues

5. **Final integration**
   - Merge `develop` → `main`
   - Create release build
   - Deploy 🚀

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Architect:** Winston (BMAD)

