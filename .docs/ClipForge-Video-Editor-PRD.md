# Product Requirements Document (PRD)
## ClipForge - Desktop Video Editor

**Version:** 1.0  
**Date:** October 27, 2025  
**Status:** Draft  
**Document Type:** Greenfield PRD  
**Project Timeline:** 72 hours (Oct 27-29, 2025)

---

## Executive Summary

ClipForge is a desktop video editor designed for rapid content creation, targeting creators, educators, and professionals who need to record, edit, and export videos quickly. Built with Electron and React, ClipForge provides screen recording, webcam capture, timeline editing, and video export capabilities in a native desktop application.

**Core Value Proposition:** Record, edit, and export professional videos entirely within a single desktop app—no cloud uploads, no subscriptions required.

---

## 1. Product Vision & Goals

### Vision Statement
Create the most accessible desktop video editor that empowers anyone to create professional content without a learning curve.

### Business Goals
- Prove technical capability to build production-grade desktop apps
- Demonstrate rapid prototyping skills (72-hour timeline)
- Create portfolio piece showcasing full-stack desktop development

### Success Metrics
- **MVP Checkpoint (Oct 28, 10:59 PM):** All P0 features functional
- **Final Submission (Oct 29, 10:59 PM):** All P0 + P1 features functional
- **Quality:** App launches reliably, no critical crashes
- **Performance:** Export 1-minute 1080p video in <2 minutes
- **Usability:** User can complete record → edit → export workflow without documentation

---

## 2. Target Users & Personas

### Primary Persona: The Content Creator

**Demographics:** 20-40 years old, YouTubers, course creators, social media managers

**Pain Points:**
- Existing video editors are too complex or expensive
- Screen recording tools don't include editing capabilities
- Cloud-based editors require upload/download time
- Need to record and edit in same workflow

**Use Cases:**
- Tutorial videos (screen + webcam)
- Product demos
- Social media content
- Course materials
- Meeting recordings with edits

**Value:** One app for entire video workflow, fast local processing, no cloud dependency

---

## 3. Core Features & Requirements

### 3.1 Desktop Application Shell

**Priority:** P0 (Must-Have for MVP)

**Description:** Native desktop application that provides the foundation for all video editing features.

**Functional Requirements:**
- Launch native desktop app on macOS/Windows/Linux
- Main window with menu bar, toolbar, and workspace
- IPC communication between main and renderer processes
- File system access for video import/export
- Application can be packaged as standalone executable

**Non-Functional Requirements:**
- Startup time: <3 seconds on modern hardware
- Memory footprint: <200MB at idle
- Cross-platform compatibility: macOS 10.15+, Windows 10+, Linux (Ubuntu 20.04+)

**Acceptance Criteria:**
- User double-clicks app icon → Application launches
- Main window displays with UI elements visible
- User can quit application without errors
- Packaged app runs without requiring Node.js installation

---

### 3.2 Video Import & Media Library

**Priority:** P0 (Must-Have for MVP)

**Description:** Import video files from disk and manage them in a media library.

**Functional Requirements:**
- Support drag-and-drop of video files onto app window
- File picker dialog for manual video selection
- Supported formats: MP4, MOV, WebM
- Display imported videos in media library panel with:
  - Thumbnail preview
  - Filename
  - Duration
  - File size
  - Resolution
- Store file paths and metadata

**Non-Functional Requirements:**
- Import time: <2 seconds for files under 100MB
- Memory efficiency: Don't load entire video into memory
- File validation: Detect corrupt or unsupported files

**Acceptance Criteria:**
- User drags MP4 file onto app → File appears in media library
- User clicks "Import" button → File picker opens → Selected file appears in library
- Library displays accurate metadata (duration, size)
- Unsupported file formats show error message

---

### 3.3 Timeline Editor

**Priority:** P0 (Must-Have for MVP - Basic); P1 (Advanced Features)

**Description:** Visual timeline interface for arranging and editing video clips.

**P0 Functional Requirements (MVP):**
- Canvas-based timeline with time ruler
- Visual playhead indicator (current time position)
- Display single clip on timeline as colored rectangle
- Click on media library clip to add to timeline
- Timeline shows clip duration proportionally

**P1 Functional Requirements (Final):**
- Drag clips from media library onto timeline
- Multiple clips displayed in sequence
- Drag clips to reorder on timeline
- Select clip (highlight/border when selected)
- Delete selected clip (keyboard Delete or button)
- Split clip at playhead position
- Multiple tracks (2 minimum: main video + overlay)
- Zoom in/out on timeline (horizontal scaling)
- Snap-to-grid or snap-to-clip edges
- Audio waveform visualization

**Non-Functional Requirements:**
- Rendering performance: 60 FPS timeline animation
- Interaction latency: <50ms response to user actions
- Canvas optimization: Use requestAnimationFrame
- Scalability: Handle 50+ clips without lag

**Acceptance Criteria (P0):**
- User selects clip from library → Clip appears on timeline
- Timeline accurately represents clip duration
- Playhead moves along timeline when video plays

**Acceptance Criteria (P1):**
- User drags clip on timeline → Clip position updates in real-time
- User splits clip → Two separate clips appear at split point
- User deletes clip → Clip removed, timeline updates
- Multiple clips play in sequence without gaps

---

### 3.4 Video Preview & Playback

**Priority:** P0 (Must-Have for MVP)

**Description:** Real-time video preview synchronized with timeline position.

**Functional Requirements:**
- Video player window displaying current frame
- Play/pause button
- Playback respects timeline composition (clips, trim points)
- Scrubbing: Drag playhead to any timeline position → Preview updates
- Audio playback synchronized with video
- Playback controls:
  - Play/Pause (space bar)
  - Stop (return to start)
  - Seek forward/backward (arrow keys)

**Non-Functional Requirements:**
- Video latency: Preview starts playing in <500ms
- Sync accuracy: Audio/video drift <50ms
- Frame rate: Match source video frame rate (24/30/60 FPS)
- Supported codecs: H.264 (MP4), H.265 (HEVC)

**Acceptance Criteria:**
- User clicks Play → Video plays from current playhead position
- User drags playhead → Preview updates to show frame at that position
- Audio plays in sync with video
- Preview window displays correct frame for timeline composition

---

### 3.5 Clip Trimming

**Priority:** P0 (Must-Have for MVP)

**Description:** Adjust start and end points of video clips without re-encoding.

**Functional Requirements:**
- Visual trim handles at start/end of clip on timeline
- Drag trim handles to adjust in/out points
- Preview window updates to show trimmed content
- Non-destructive editing (original file unchanged)
- Display trimmed duration vs. original duration
- Trim precision: Frame-accurate

**Non-Functional Requirements:**
- Trim operation: <100ms to apply
- Visual feedback: Handle position updates in real-time
- Minimum clip duration: 0.1 seconds (prevent invalid trims)

**Acceptance Criteria:**
- User drags start handle right → Clip starts later, duration shortens
- User drags end handle left → Clip ends earlier, duration shortens
- Preview respects trim points (doesn't show trimmed sections)
- Export only includes trimmed portions

---

### 3.6 Video Export

**Priority:** P0 (Must-Have for MVP)

**Description:** Render timeline composition to single video file.

**Functional Requirements:**
- Export dialog with:
  - Output filename
  - Save location (file picker)
  - Quality preset: 720p, 1080p, 4K (P1 for presets)
  - Format: MP4 (H.264 codec)
- Progress bar showing export status
- Estimated time remaining
- Success notification with "Open File" button
- Cancel export option

**Non-Functional Requirements:**
- Export speed: Real-time or faster (1 min video → <2 min export)
- CPU usage: Use FFmpeg hardware acceleration if available
- File size: Efficient encoding (1 min 1080p → ~50MB)
- Error handling: Graceful failure with error message

**Acceptance Criteria:**
- User clicks "Export" → Dialog opens
- User selects location + filename → Export starts
- Progress bar updates during export
- Export completes → Notification shows → File plays in VLC/QuickTime
- Exported file matches timeline composition

---

### 3.7 Screen Recording

**Priority:** P1 (Important for Final Submission)

**Description:** Capture screen/window content directly within the app.

**Functional Requirements:**
- "Record Screen" button in toolbar
- Source selection dialog showing:
  - Full screen (all monitors)
  - Individual monitors
  - Specific windows (per application)
- Recording controls:
  - Start/Stop button
  - Countdown timer (3-2-1)
  - Recording indicator (red dot)
- Save recording directly to timeline
- Support system audio capture (computer sound output)

**Technical Implementation:**
- Electron: Use `desktopCapturer` API + `getUserMedia()`
- Store recording as temporary file during capture
- Add to media library after stopping

**Non-Functional Requirements:**
- Recording latency: <2 seconds from start to capture
- Frame rate: 30 FPS minimum, 60 FPS preferred
- Quality: Lossless or high-quality H.264
- Performance: <10% CPU overhead during recording

**Acceptance Criteria:**
- User clicks "Record Screen" → Source selection dialog appears
- User selects window → Recording starts after countdown
- User clicks Stop → Recording saved and added to timeline
- Recording quality is clear and smooth

---

### 3.8 Webcam Recording

**Priority:** P1 (Important for Final Submission)

**Description:** Capture webcam video directly within the app.

**Functional Requirements:**
- "Record Webcam" button in toolbar
- Camera selection if multiple cameras available
- Preview window showing webcam feed before recording
- Recording controls (same as screen recording)
- Microphone audio capture
- Simultaneous screen + webcam recording (picture-in-picture)
- Adjustable webcam overlay size/position for PiP

**Technical Implementation:**
- Use `navigator.mediaDevices.getUserMedia()` for camera/mic
- MediaRecorder API for capture
- Store as WebM or MP4

**Non-Functional Requirements:**
- Camera access time: <1 second
- Audio sync: <50ms offset from video
- Resolution: Support 720p and 1080p webcams

**Acceptance Criteria:**
- User clicks "Record Webcam" → Permission request appears
- User grants permission → Webcam preview shows
- User starts recording → Video + audio captured
- Recording added to timeline as separate clip
- PiP mode: Webcam appears as overlay on screen recording

---

### 3.9 Multi-Track Timeline

**Priority:** P1 (Important for Final Submission)

**Description:** Support multiple video tracks for overlays and picture-in-picture.

**Functional Requirements:**
- Timeline displays at least 2 tracks vertically:
  - Track 1: Main video
  - Track 2: Overlay (PiP, lower thirds, etc.)
- Drag clips between tracks
- Track controls:
  - Solo (show only this track)
  - Mute (disable audio)
  - Lock (prevent edits)
- Compositing order: Top tracks overlay bottom tracks
- Opacity control per clip (P2)

**Non-Functional Requirements:**
- Rendering performance: Maintain 30+ FPS with 2 tracks
- Compositing latency: <100ms to update preview

**Acceptance Criteria:**
- User drags webcam clip to Track 2 → Appears as overlay
- Overlay clip visible during preview
- Export includes both tracks composited
- User can reorder clips across tracks

---

### 3.10 Additional Editing Features

**Priority:** P2 (Nice-to-Have)

**Description:** Quality-of-life features for better editing experience.

**Functional Requirements:**
- Undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- Copy/paste clips (Cmd/Ctrl+C/V)
- Duplicate clip
- Ripple delete (remove clip and close gap)
- Snapping toggle (snap to playhead, clip edges, markers)
- Markers/bookmarks on timeline
- Audio fade in/out
- Transitions between clips (dissolve, fade to black)
- Text overlays (simple titles)

**Acceptance Criteria:**
- User presses Cmd+Z → Last action undoes
- User enables snapping → Clips snap to grid
- User adds transition → Smooth fade between clips

---

## 4. Technical Architecture

### 4.1 System Components

**Desktop Framework:**
- Electron 28+ (Node.js runtime + Chromium)
- Provides OS integration, file system access, native menus

**Main Process (Node.js):**
- IPC handlers for renderer communication
- File I/O operations
- FFmpeg process management
- Recording service (screen/webcam capture)
- Export service (video rendering)

**Renderer Process (Chromium):**
- React 18 + TypeScript frontend
- Timeline Canvas rendering
- Video playback (HTML5 `<video>`)
- UI components (buttons, dialogs, controls)

**Media Processing:**
- FFmpeg (bundled binary)
- fluent-ffmpeg (Node.js wrapper)
- Handles: trimming, concatenating, encoding, format conversion

### 4.2 Data Models

**Clip**
```typescript
interface Clip {
  id: string;
  sourceFile: string;        // Absolute path to video file
  startTime: number;         // Seconds
  endTime: number;           // Seconds
  trimIn: number;            // Trim start (seconds from file start)
  trimOut: number;           // Trim end (seconds from file start)
  trackId: string;
  metadata: {
    duration: number;
    resolution: { width: number; height: number };
    frameRate: number;
    codec: string;
  };
}
```

**Track**
```typescript
interface Track {
  id: string;
  name: string;
  clips: Clip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}
```

**Project**
```typescript
interface Project {
  id: string;
  name: string;
  timeline: {
    tracks: Track[];
    duration: number;      // Total timeline duration
  };
  settings: {
    fps: number;
    resolution: { width: number; height: number };
  };
}
```

### 4.3 Technology Stack

**Core:**
- Electron 28.0+
- React 18.2+
- TypeScript 5.2+
- Zustand (state management)

**Build Tools:**
- Vite (dev server + bundler)
- electron-builder (packaging)

**Media:**
- fluent-ffmpeg 2.1+
- FFmpeg 6.0+ (bundled binary)

**UI:**
- Tailwind CSS 3.0+
- HTML5 Canvas (timeline)
- HTML5 Video (preview)

---

## 5. User Experience & Interface

### 5.1 Application Layout

```
┌─────────────────────────────────────────────────────────────┐
│  File  Edit  View  Window  Help           ● Rec  🎥 Export  │ ← Menu Bar
├─────────────────────────────────────────────────────────────┤
│  📁 Import   ✂️ Split   🗑️ Delete   ⟲ Undo   ⟳ Redo        │ ← Toolbar
├───────────────────┬─────────────────────────────────────────┤
│                   │                                         │
│  Media Library    │         Video Preview                   │
│                   │                                         │
│  [Clip 1]         │      ┌─────────────────────┐            │
│  [Clip 2]         │      │                     │            │
│  [Clip 3]         │      │   Video Player      │            │
│                   │      │                     │            │
│                   │      └─────────────────────┘            │
│                   │      ◀ ⏸ ▶  00:00 / 01:23              │
├───────────────────┴─────────────────────────────────────────┤
│                                                             │
│                       Timeline                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Track 1  ██████████░░░░ ████████                    │   │
│  │ Track 2       ░░██░░                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  0:00      0:10      0:20      0:30      0:40              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Workflows

**Workflow 1: Import and Trim Video**
1. User clicks "Import" → File picker opens
2. User selects video file → File appears in media library
3. User clicks clip → Clip added to timeline
4. User drags trim handles → Adjusts start/end points
5. User clicks "Export" → Saves trimmed video

**Workflow 2: Record and Edit Screen Capture**
1. User clicks "Record Screen" → Source selector appears
2. User selects monitor/window → Recording starts
3. User performs actions, clicks Stop → Recording saved
4. Recording automatically added to timeline
5. User splits at desired points, deletes unwanted sections
6. User exports final video

**Workflow 3: Picture-in-Picture Tutorial**
1. User records screen (main content)
2. User records webcam (presenter)
3. User adds screen recording to Track 1
4. User adds webcam to Track 2 (overlay)
5. User positions webcam clip to corner
6. User exports video with both tracks

### 5.3 Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Play/Pause | Space | Space |
| Import | Cmd+I | Ctrl+I |
| Export | Cmd+E | Ctrl+E |
| Undo | Cmd+Z | Ctrl+Z |
| Redo | Cmd+Shift+Z | Ctrl+Shift+Z |
| Delete Clip | Delete | Delete |
| Split at Playhead | Cmd+K | Ctrl+K |
| Zoom In | Cmd++ | Ctrl++ |
| Zoom Out | Cmd+- | Ctrl+- |

---

## 6. Risks & Mitigation

### Technical Risks

**Risk:** FFmpeg integration fails on certain platforms
- **Impact:** Cannot export videos
- **Mitigation:** Test FFmpeg on all platforms early; include binaries in app package; fallback to @ffmpeg.wasm

**Risk:** Timeline performance degrades with many clips
- **Impact:** Laggy UI, poor user experience
- **Mitigation:** Use Canvas for timeline (GPU-accelerated); implement virtual scrolling; profile and optimize

**Risk:** Video playback sync issues
- **Impact:** Audio/video out of sync
- **Mitigation:** Use video.currentTime as source of truth; implement frame-accurate scrubbing; test with various codecs

**Risk:** Packaging fails or app won't launch on clean machine
- **Impact:** Cannot submit native app
- **Mitigation:** Test electron-builder config early; validate on VM without dev tools; include all dependencies

### Scope Risks

**Risk:** Too many features, run out of time
- **Impact:** Incomplete submission
- **Mitigation:** Strict prioritization (P0 → P1 → P2); time-box features (2 hours max); cut scope if behind

---

## 7. Success Criteria

### MVP Checkpoint (Tuesday 10:59 PM CT)

**Must Pass:**
- ✅ Desktop app launches
- ✅ Video import works (drag & drop + file picker)
- ✅ Timeline displays clips
- ✅ Video preview plays
- ✅ Trim functionality works
- ✅ Export to MP4 succeeds
- ✅ Native app builds (.dmg or .exe)

### Final Submission (Wednesday 10:59 PM CT)

**Must Pass:**
- ✅ All MVP features +
- ✅ Screen recording functional
- ✅ Webcam recording functional
- ✅ Multiple clips on timeline
- ✅ Split and delete clips
- ✅ Multi-track (PiP) works
- ✅ Keyboard shortcuts implemented
- ✅ UI polished and responsive

---

## 8. Timeline & Milestones

### Phase 1: MVP Foundation (Monday-Tuesday AM)
- Setup: Electron + React + TypeScript boilerplate
- Core: Video import, timeline rendering, preview player
- Features: Trim functionality, export pipeline

### Phase 2: MVP Completion (Tuesday PM)
- Testing: Verify all MVP requirements
- Build: Package native app
- Submission: Deploy by 10:59 PM CT

### Phase 3: Final Features (Wednesday AM)
- Recording: Screen + webcam capture
- Timeline: Multi-clip, split, delete
- Tracks: Multi-track + PiP

### Phase 4: Polish & Submit (Wednesday PM)
- UI: Keyboard shortcuts, improved UX
- Testing: End-to-end workflows
- Documentation: README + demo video
- Submission: Deploy by 10:59 PM CT

---

## Appendix A: FFmpeg Commands Reference

**Trim Video:**
```bash
ffmpeg -i input.mp4 -ss 00:00:10 -to 00:00:30 -c copy output.mp4
```

**Concatenate Videos:**
```bash
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
```

**Resize Video:**
```bash
ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4
```

**Add Overlay (PiP):**
```bash
ffmpeg -i main.mp4 -i overlay.mp4 -filter_complex "[1]scale=320:240[ovr];[0][ovr]overlay=W-w-10:H-h-10" output.mp4
```

---

## Appendix B: Electron APIs Required

**Main Process:**
- `app` - Application lifecycle
- `BrowserWindow` - Create windows
- `ipcMain` - IPC communication
- `dialog` - File/folder pickers
- `desktopCapturer` - Screen recording sources

**Renderer Process:**
- `ipcRenderer` - Communicate with main
- `navigator.mediaDevices.getUserMedia()` - Webcam/mic access
- `navigator.mediaDevices.getDisplayMedia()` - Screen capture

---

## Document Control

**Change Log:**
- v1.0 (2025-10-27): Initial PRD for ClipForge video editor

**Approvers:**
- Technical Lead: [Pending]
- Project Owner: [Pending]

**Next Steps:**
1. Review and approve PRD
2. Create Epic breakdown with BMAD PM agent
3. Generate architecture document with BMAD Architect
4. Create user stories with BMAD SM agent
5. Begin development sprint
