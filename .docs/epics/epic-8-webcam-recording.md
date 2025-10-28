# Epic 8: Webcam Recording

**Epic ID:** CLIP-EPIC-008  
**Priority:** P1 (Important for Final Submission)  
**Status:** Ready for Development  
**Timeline:** Phase 3 (Wednesday AM)  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Epic 1-2 (Desktop Shell, Media Library), Epic 7 (Recording patterns)

---

## Epic Goal

Capture webcam video and microphone audio directly within ClipForge, enabling users to record presenter commentary, talking-head videos, and picture-in-picture overlays for tutorials.

**Value Statement:** Webcam recording completes the content creation toolkit, allowing users to add personal presence to their videos without external tools.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.8)

**Functional Requirements - Must Pass:**
- ✅ "Record Webcam" button in toolbar
- ✅ Camera selection if multiple cameras available
- ✅ Preview window showing webcam feed before recording
- ✅ Recording controls (same as screen recording)
- ✅ Microphone audio capture
- ✅ Simultaneous screen + webcam recording (picture-in-picture)
- ✅ Adjustable webcam overlay size/position for PiP (P2)
- ✅ User clicks "Record Webcam" → Permission request appears
- ✅ User grants permission → Webcam preview shows
- ✅ User starts recording → Video + audio captured
- ✅ Recording added to timeline as separate clip
- ✅ PiP mode: Webcam appears as overlay on screen recording

**Non-Functional Requirements - Must Pass:**
- ✅ Camera access time: <1 second
- ✅ Audio sync: <50ms offset from video
- ✅ Resolution: Support 720p and 1080p webcams

---

## User Stories

### Story 1: Webcam & Microphone Permissions

**Acceptance Criteria:**
- [ ] "Record Webcam" button in toolbar (camera icon)
- [ ] Click button → Request camera + mic permissions
- [ ] Browser permission dialog appears
- [ ] User grants → Proceed to camera selection
- [ ] User denies → Show instructions to grant in system settings
- [ ] Permission remembered for future sessions

---

### Story 2: Camera Selection & Preview

**Acceptance Criteria:**
- [ ] After permissions → Camera selection dialog
- [ ] List all available cameras:
  - [ ] Built-in webcam
  - [ ] External USB cameras
  - [ ] Virtual cameras (OBS, etc.)
- [ ] List available microphones:
  - [ ] Built-in mic
  - [ ] External mics
  - [ ] Default system mic (pre-selected)
- [ ] Live preview of selected camera
- [ ] Preview resolution: 640x480 or 1280x720
- [ ] Audio level meter (visual feedback)
- [ ] Test mic: See level bars respond to voice
- [ ] Start Recording button

**Technical Implementation:**
```typescript
async function getCameraStream(deviceId?: string) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
  return stream;
}
```

---

### Story 3: Webcam Recording

**Acceptance Criteria:**
- [ ] Click "Start Recording" → Countdown (3-2-1)
- [ ] Recording starts after countdown
- [ ] Recording indicator: Red dot + "REC"
- [ ] Timer shows elapsed time
- [ ] Video + audio captured simultaneously
- [ ] MediaRecorder API used
- [ ] Output format: WebM (VP9 + Opus) or MP4
- [ ] Saved to temporary file
- [ ] Stop button functional
- [ ] Stop → Finalize and add to media library

---

### Story 4: Picture-in-Picture Mode (P1)

**Acceptance Criteria:**
- [ ] Option: "Record screen + webcam (PiP)"
- [ ] Starts both recordings simultaneously
- [ ] Screen recording in one file
- [ ] Webcam recording in separate file
- [ ] Both added to timeline:
  - [ ] Screen on Track 1
  - [ ] Webcam on Track 2 (overlay)
- [ ] Webcam clip positioned in corner (default: bottom-right)
- [ ] Webcam clip scaled down (e.g., 25% of screen size)
- [ ] P2: Adjustable position and size

---

### Story 5: Audio Quality & Processing

**Acceptance Criteria:**
- [ ] Echo cancellation enabled
- [ ] Noise suppression enabled
- [ ] Auto gain control enabled
- [ ] Audio bitrate: 128-192 kbps
- [ ] Audio synchronized with video (<50ms drift)
- [ ] Mono or stereo based on mic capabilities

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Webcam Recording System                         │
├───────────────────────────────────────────────────────────────┤
│  WebcamRecorder.tsx                                          │
│  - Device enumeration                                         │
│  - Camera preview                                             │
│  - Microphone level meter                                     │
│  - MediaRecorder (video + audio)                              │
│  - Recording controls                                         │
│                                                               │
│  PiP Mode:                                                    │
│  - Start screen recording (Epic 7)                            │
│  - Start webcam recording (simultaneously)                    │
│  - Save both recordings                                       │
│  - Add screen to Track 1, webcam to Track 2                   │
│  - Position webcam overlay                                    │
└───────────────────────────────────────────────────────────────┘
```

---

## Definition of Done

- [ ] Webcam recording button functional
- [ ] Camera selection dialog works
- [ ] Preview shows webcam feed
- [ ] Recording captures video + audio
- [ ] Audio synchronized (<50ms)
- [ ] Recording added to media library
- [ ] PiP mode creates 2-track timeline
- [ ] Permissions handled gracefully

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.8

