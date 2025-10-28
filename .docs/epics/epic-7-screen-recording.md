# Epic 7: Screen Recording

**Epic ID:** CLIP-EPIC-007  
**Priority:** P1 (Important for Final Submission)  
**Status:** Ready for Development  
**Timeline:** Phase 3 (Wednesday AM)  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Epic 1-2 (Desktop Shell, Media Library)

---

## Epic Goal

Capture screen/window content directly within ClipForge using Electron's desktopCapturer API, allowing users to record tutorials, demos, and presentations without external recording software.

**Value Statement:** Screen recording is a core content creation tool for tutorials and demos. Integrating it into the editor eliminates the need for separate recording apps.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.7)

**Functional Requirements - Must Pass:**
- ✅ "Record Screen" button in toolbar
- ✅ Source selection dialog showing:
  - Full screen (all monitors)
  - Individual monitors
  - Specific windows (per application)
- ✅ Recording controls:
  - Start/Stop button
  - Countdown timer (3-2-1)
  - Recording indicator (red dot)
- ✅ Save recording directly to timeline
- ✅ Support system audio capture (computer sound output)
- ✅ User clicks "Record Screen" → Source selection dialog appears
- ✅ User selects window → Recording starts after countdown
- ✅ User clicks Stop → Recording saved and added to timeline
- ✅ Recording quality is clear and smooth

**Non-Functional Requirements - Must Pass:**
- ✅ Recording latency: <2 seconds from start to capture
- ✅ Frame rate: 30 FPS minimum, 60 FPS preferred
- ✅ Quality: Lossless or high-quality H.264
- ✅ Performance: <10% CPU overhead during recording

---

## User Stories

### Story 1: Screen Source Selection

**Acceptance Criteria:**
- [ ] "Record Screen" button in toolbar (red dot icon)
- [ ] Click button → Source selection dialog opens
- [ ] Dialog uses Electron desktopCapturer API
- [ ] Lists all available sources:
  - [ ] "Entire Screen" (all displays combined)
  - [ ] Individual monitors: "Screen 1", "Screen 2", etc.
  - [ ] All open windows with app names and titles
  - [ ] Window thumbnails for identification
- [ ] Sources refreshed on dialog open
- [ ] Select source + click "Start Recording"
- [ ] Cancel button closes dialog

**Source Permissions:**
- [ ] macOS: Request Screen Recording permission
- [ ] Windows: No permission needed (varies by version)
- [ ] Linux: Screen capture permission (if Wayland)
- [ ] Permission denied → Show instructions to grant access

---

### Story 2: Recording Start with Countdown

**Acceptance Criteria:**
- [ ] User selects source → Countdown begins
- [ ] Countdown overlay: 3... 2... 1...
- [ ] Large centered numbers
- [ ] Audio beep each second (optional)
- [ ] After countdown → Recording starts
- [ ] Recording indicator appears (red dot + "REC")
- [ ] Timer display: "00:05" (elapsed time)
- [ ] Minimize ClipForge window (optional behavior)

---

### Story 3: Screen Capture Implementation

**Acceptance Criteria:**
- [ ] Use Electron desktopCapturer API
- [ ] Get media stream: `navigator.mediaDevices.getUserMedia()`
- [ ] MediaRecorder API for recording
- [ ] Capture settings:
  - [ ] Video: 1920x1080 @ 30fps (or source resolution)
  - [ ] Codec: VP9 or H.264
  - [ ] Bitrate: 5-8 Mbps (high quality)
- [ ] Optional: System audio capture (complex, P2)
- [ ] Save chunks to temporary file during recording
- [ ] Finalize file on stop

**Technical Implementation:**
```typescript
async function startScreenRecording(sourceId: string) {
  // Get source stream
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false, // System audio is complex
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: 1280,
        maxWidth: 1920,
        minHeight: 720,
        maxHeight: 1080,
        minFrameRate: 30,
        maxFrameRate: 60
      }
    }
  });
  
  // Create recorder
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000
  });
  
  // Handle data
  recorder.ondataavailable = (e) => {
    recordedChunks.push(e.data);
  };
  
  recorder.start(1000); // 1s chunks
  return recorder;
}
```

---

### Story 4: Recording Controls & Stop

**Acceptance Criteria:**
- [ ] Stop button visible during recording
- [ ] Click Stop → Recording stops
- [ ] Finalize video file
- [ ] Processing indicator: "Saving recording..."
- [ ] File saved to temp directory
- [ ] Metadata extracted (duration, resolution)
- [ ] Thumbnail generated
- [ ] Added to media library automatically
- [ ] Added to timeline at playhead position (optional)
- [ ] Success notification: "Recording saved!"

**Recording Window:**
- [ ] Small floating window with:
  - [ ] Timer display
  - [ ] Stop button
  - [ ] Pause button (P2)
  - [ ] Always on top
  - [ ] Minimal, non-intrusive

---

### Story 5: System Audio Capture (P2)

**Acceptance Criteria:**
- [ ] Checkbox: "Record system audio"
- [ ] If checked: Capture computer audio output
- [ ] Mixed with screen video
- [ ] Platform-specific implementation:
  - [ ] macOS: Use Soundflower or BlackHole (requires install)
  - [ ] Windows: Use Stereo Mix or similar
  - [ ] Linux: PulseAudio loopback
- [ ] Complex to implement → P2 priority
- [ ] Document limitations if not implemented

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Screen Recording System                         │
├───────────────────────────────┬─────────────────────────────┤
│        Main Process           │      Renderer Process        │
│                               │                              │
│  IPC Handlers                 │  ScreenRecorder.tsx          │
│  - recording:getSources       │  - Source picker UI          │
│  - recording:start            │  - Recording controls        │
│  - recording:stop             │  - Timer display             │
│                               │                              │
│  File Management              │  MediaRecorder API           │
│  - Save recorded file         │  - Capture video stream      │
│  - Generate thumbnail         │  - Write chunks              │
│  - Extract metadata           │  - Finalize file             │
│  - Add to media library       │                              │
└───────────────────────────────┴─────────────────────────────┘
```

---

## Definition of Done

- [ ] Screen recording button functional
- [ ] Source selection dialog displays sources
- [ ] Recording starts after countdown
- [ ] Screen captures at 30+ FPS
- [ ] Recording saves to file
- [ ] File added to media library
- [ ] Recording quality acceptable
- [ ] Stop button works
- [ ] CPU usage <10% during recording

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.7

