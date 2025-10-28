# ClipForge Development Tracks - Quick Reference

**Purpose:** Quick lookup for parallel development assignments  
**Date:** October 27, 2025

---

## 🎯 Contract Files (Team Coordination Required)

**Location:** `src/shared/contracts/`

| File | Purpose | Owner |
|------|---------|-------|
| `ipc.ts` | IPC message contracts | Architect (PR required for changes) |
| `stores.ts` | Zustand store interfaces | Architect (PR required for changes) |
| `components.ts` | Component props interfaces | Architect (PR required for changes) |
| `services.ts` | Main process service interfaces | Architect (PR required for changes) |
| `ipc-channels.ts` | IPC channel name constants | Architect (PR required for changes) |

⚠️ **CRITICAL:** Never modify contract files without team approval via PR!

---

## 🔧 Development Tracks

### Track 1: Main Process Core ⚡ START FIRST
**Agent:** Main-Core-Dev  
**Duration:** 4-6 hours  
**Dependencies:** None  

**Files to Create:**
- `src/main/main.ts`
- `src/main/preload.ts`
- `src/main/ipc/index.ts`

**Deliverables:**
- ✅ Electron window launches
- ✅ IPC infrastructure ready
- ✅ `window.api` exposed to renderer

---

### Track 2: Media Service
**Agent:** Media-Service-Dev  
**Duration:** 6-8 hours  
**Dependencies:** Track 1 (IPC infrastructure)  

**Files to Create:**
- `src/main/services/MediaService.ts`
- `src/main/services/FFmpegManager.ts`
- `src/main/ipc/mediaHandlers.ts`

**Consumes (Read-Only):**
- `src/shared/contracts/ipc.ts` → `MediaIPC` namespace
- `src/shared/contracts/services.ts` → `IMediaService` interface

**Deliverables:**
- ✅ FFmpeg integration
- ✅ Video metadata extraction
- ✅ Thumbnail generation
- ✅ Media IPC handlers registered

---

### Track 3: Recording Service
**Agent:** Recording-Service-Dev  
**Duration:** 6-8 hours  
**Dependencies:** Track 1 (IPC infrastructure)  

**Files to Create:**
- `src/main/services/RecordingService.ts`
- `src/main/ipc/recordHandlers.ts`

**Consumes (Read-Only):**
- `src/shared/contracts/ipc.ts` → `RecordingIPC` namespace
- `src/shared/contracts/services.ts` → `IRecordingService` interface

**Deliverables:**
- ✅ Screen/window source enumeration
- ✅ Recording session management
- ✅ Blob save functionality
- ✅ Recording IPC handlers registered

---

### Track 4: Export Service
**Agent:** Export-Service-Dev  
**Duration:** 8-10 hours  
**Dependencies:** Track 2 (FFmpegManager)  

**Files to Create:**
- `src/main/services/ExportService.ts`
- `src/main/ipc/exportHandlers.ts`

**Consumes (Read-Only):**
- `src/shared/contracts/ipc.ts` → `ExportIPC` namespace
- `src/shared/contracts/services.ts` → `IExportService` interface
- `src/main/services/FFmpegManager.ts` (from Track 2)

**Deliverables:**
- ✅ Single clip export
- ✅ Multi-clip concatenation
- ✅ PiP overlay compositing
- ✅ Progress event emission
- ✅ Export IPC handlers registered

---

### Track 5: Project Service
**Agent:** Project-Service-Dev  
**Duration:** 3-4 hours  
**Dependencies:** Track 1 (IPC infrastructure)  

**Files to Create:**
- `src/main/services/ProjectService.ts`
- `src/main/ipc/projectHandlers.ts`

**Consumes (Read-Only):**
- `src/shared/contracts/ipc.ts` → `ProjectIPC` namespace
- `src/shared/contracts/services.ts` → `IProjectService` interface

**Deliverables:**
- ✅ Project save/load
- ✅ JSON serialization
- ✅ Recent projects tracking
- ✅ Project IPC handlers registered

---

### Track 6: Store Architecture ⚡ START FIRST
**Agent:** Store-Dev  
**Duration:** 4-6 hours  
**Dependencies:** None  

**Files to Create:**
- `src/renderer/store/timelineStore.ts`
- `src/renderer/store/mediaStore.ts`
- `src/renderer/store/recordingStore.ts`
- `src/renderer/store/exportStore.ts`
- `src/renderer/store/projectStore.ts`
- `src/renderer/store/appStore.ts`
- `src/renderer/store/index.ts` (combined store)

**Consumes (Read-Only):**
- `src/shared/contracts/stores.ts` → All store contracts

**Deliverables:**
- ✅ All 6 Zustand stores implemented
- ✅ Actions match contract interfaces
- ✅ Store persistence configured
- ✅ Combined store exported

---

### Track 7: Layout Components
**Agent:** Layout-UI-Dev  
**Duration:** 4-6 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/layout/AppShell.tsx`
- `src/renderer/components/layout/MenuBar.tsx`
- `src/renderer/components/layout/Toolbar.tsx`
- `src/renderer/components/layout/StatusBar.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `LayoutComponentProps`
- `src/renderer/store/index.ts`

**Deliverables:**
- ✅ App shell with 3-panel layout
- ✅ Menu bar with File/Edit/View menus
- ✅ Toolbar with action buttons
- ✅ Status bar with metrics

---

### Track 8: Media Library UI
**Agent:** Media-UI-Dev  
**Duration:** 5-7 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/media/MediaLibrary.tsx`
- `src/renderer/components/media/MediaItem.tsx`
- `src/renderer/components/media/MediaGrid.tsx`
- `src/renderer/components/media/ImportButton.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `MediaLibraryComponentProps`
- `src/renderer/store/mediaStore.ts`

**Deliverables:**
- ✅ Media library panel
- ✅ Thumbnail grid display
- ✅ Drag-drop to timeline
- ✅ Import button with file picker

---

### Track 9: Timeline UI 🔥 MOST COMPLEX
**Agent:** Timeline-UI-Dev  
**Duration:** 10-12 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/timeline/Timeline.tsx`
- `src/renderer/components/timeline/TimelineCanvas.tsx`
- `src/renderer/components/timeline/TimeRuler.tsx`
- `src/renderer/components/timeline/Track.tsx`
- `src/renderer/components/timeline/TimelineClip.tsx`
- `src/renderer/components/timeline/Playhead.tsx`
- `src/renderer/components/timeline/TimelineControls.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `TimelineComponentProps`
- `src/renderer/store/timelineStore.ts`

**Deliverables:**
- ✅ Canvas-based timeline rendering
- ✅ Clip drag-drop interaction
- ✅ Trim handles functional
- ✅ Zoom/scroll controls
- ✅ Multi-track support
- ✅ Playhead synchronization

---

### Track 10: Video Preview UI
**Agent:** Preview-UI-Dev  
**Duration:** 6-8 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/preview/VideoPreview.tsx`
- `src/renderer/components/preview/VideoPlayer.tsx`
- `src/renderer/components/preview/PlaybackControls.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `VideoPreviewComponentProps`
- `src/renderer/store/timelineStore.ts`

**Deliverables:**
- ✅ HTML5 video player
- ✅ Play/pause/seek controls
- ✅ Timeline synchronization
- ✅ Scrubbing support
- ✅ Volume control

---

### Track 11: Recording UI
**Agent:** Recording-UI-Dev  
**Duration:** 5-6 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/recording/RecordDialog.tsx`
- `src/renderer/components/recording/SourceSelector.tsx`
- `src/renderer/components/recording/CameraPreview.tsx`
- `src/renderer/components/recording/RecordControls.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `RecordingComponentProps`
- `src/renderer/store/recordingStore.ts`

**Deliverables:**
- ✅ Recording modal dialog
- ✅ Screen/window source picker
- ✅ Webcam preview
- ✅ Start/stop controls
- ✅ Countdown timer

---

### Track 12: Export UI
**Agent:** Export-UI-Dev  
**Duration:** 4-5 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/components/export/ExportDialog.tsx`
- `src/renderer/components/export/ExportSettings.tsx`
- `src/renderer/components/export/ExportProgress.tsx`
- `src/renderer/components/export/QualityPreset.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `ExportComponentProps`
- `src/renderer/store/exportStore.ts`

**Deliverables:**
- ✅ Export modal dialog
- ✅ Quality/resolution settings
- ✅ Progress bar with ETA
- ✅ Quality preset buttons

---

### Track 13: Common Components ⚡ START FIRST
**Agent:** Common-UI-Dev  
**Duration:** 3-4 hours  
**Dependencies:** None  

**Files to Create:**
- `src/renderer/components/common/Button.tsx`
- `src/renderer/components/common/Dialog.tsx`
- `src/renderer/components/common/Dropdown.tsx`
- `src/renderer/components/common/ProgressBar.tsx`
- `src/renderer/components/common/Slider.tsx`

**Consumes (Read-Only):**
- `src/shared/contracts/components.ts` → `CommonComponentProps`

**Deliverables:**
- ✅ Button with variants (primary, secondary, danger, ghost)
- ✅ Modal dialog component
- ✅ Dropdown menu
- ✅ Progress bar
- ✅ Slider component

---

### Track 14: Custom Hooks
**Agent:** Hooks-Dev  
**Duration:** 3-4 hours  
**Dependencies:** Track 6 (Stores)  

**Files to Create:**
- `src/renderer/hooks/useTimeline.ts`
- `src/renderer/hooks/usePlayback.ts`
- `src/renderer/hooks/useKeyboard.ts`
- `src/renderer/hooks/useIPC.ts`
- `src/renderer/hooks/useRecording.ts`

**Consumes (Read-Only):**
- `src/renderer/store/index.ts`
- `src/shared/contracts/ipc.ts`

**Deliverables:**
- ✅ Timeline interaction hook
- ✅ Playback control hook
- ✅ Keyboard shortcut hook (Space, Delete, Cmd+K, etc.)
- ✅ IPC wrapper hook
- ✅ Recording management hook

---

## 📊 Critical Path Analysis

### Must Complete First (Day 1 AM)
1. **Track 1** (Main Core) - Blocks all main process tracks
2. **Track 6** (Stores) - Blocks all UI tracks
3. **Track 13** (Common UI) - Used by all UI tracks

### Must Complete Second (Day 1 PM)
4. **Track 2** (Media Service) - Blocks Track 4
5. **Track 7** (Layout) - Needed for visual structure
6. **Track 14** (Hooks) - Used by complex UI tracks

### Can Complete in Parallel (Day 2)
- **Tracks 3, 5** (Recording/Project Services)
- **Tracks 8, 10, 11, 12** (UI Components)

### Complex/Final (Day 2-3)
- **Track 4** (Export Service) - Needs Track 2
- **Track 9** (Timeline UI) - Most complex, allocate most time

---

## 🚨 File Conflict Prevention Rules

### ❌ NEVER DO THIS:
```typescript
// BAD: Importing from another module's implementation
import { MediaService } from '../../main/services/MediaService';
```

### ✅ ALWAYS DO THIS:
```typescript
// GOOD: Importing from shared contracts
import { IMediaService } from '@/shared/contracts/services';
import { MediaIPC } from '@/shared/contracts/ipc';
```

### ❌ NEVER DO THIS:
```typescript
// BAD: Directly accessing another module's store
import { useMediaStore } from '../store/mediaStore';
```

### ✅ ALWAYS DO THIS:
```typescript
// GOOD: Using combined store interface
import { useStore } from '../store';
const { mediaLibrary } = useStore();
```

---

## 📝 Daily Standup Template

**Post in Team Chat:**

```
Track [X]: [Track Name]
Status: [In Progress | Ready for Integration | Complete]
Progress: [X]% done
Blockers: [None | Waiting on Track Y]
Next: [What you're working on next]
```

**Example:**
```
Track 9: Timeline UI
Status: In Progress
Progress: 60% done
Blockers: None
Next: Implementing trim handle dragging
```

---

## 🔗 Integration Schedule

| Day | Time | Integration Point |
|-----|------|-------------------|
| Day 1 | 5 PM | Foundation (Tracks 1, 6, 13) |
| Day 2 | 10 AM | Media (Tracks 2, 8) |
| Day 2 | 2 PM | Timeline (Track 9) |
| Day 2 | 5 PM | Playback (Track 10) |
| Day 3 | 10 AM | Recording (Tracks 3, 11) |
| Day 3 | 2 PM | Export (Tracks 4, 12) |

---

## ✅ Track Completion Checklist

**Before marking track as "Complete":**

- [ ] All files in track created
- [ ] Implements contract interfaces correctly
- [ ] TypeScript compiles with no errors
- [ ] No linter errors
- [ ] Unit tests written (if applicable)
- [ ] Manual testing completed
- [ ] PR submitted with clear description
- [ ] No files from other tracks modified

---

**Quick Links:**
- Full Architecture: [ClipForge-Architecture.md](ClipForge-Architecture.md)
- Modular Contracts: [ClipForge-Modular-Architecture.md](ClipForge-Modular-Architecture.md)
- PRD: [ClipForge-Video-Editor-PRD.md](ClipForge-Video-Editor-PRD.md)

---

**Last Updated:** October 27, 2025  
**Architect:** Winston (BMAD)

