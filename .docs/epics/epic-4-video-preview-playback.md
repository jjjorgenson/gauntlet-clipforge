# Epic 4: Video Preview & Playback

**Epic ID:** CLIP-EPIC-004  
**Priority:** P0 (Must-Have for MVP)  
**Status:** Ready for Development  
**Timeline:** Phase 2 (Tuesday AM-PM)  
**Estimated Effort:** 8-10 hours  
**Dependencies:** Epic 1 (Desktop Shell), Epic 2 (Media Library), Epic 3 (Timeline)

---

## Epic Goal

Implement a real-time video preview player synchronized with the timeline playhead, enabling users to see their edited video composition as they work, providing immediate visual feedback for all editing operations.

**Value Statement:** Without preview playback, users are editing blind. This epic delivers the visual feedback loop that makes video editing intuitive and confidence-inspiring.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.4)

**Functional Requirements - Must Pass:**
- ✅ Video player window displaying current frame
- ✅ Play/pause button functional
- ✅ Playback respects timeline composition (clips, trim points)
- ✅ Scrubbing: Drag playhead to any timeline position → Preview updates
- ✅ Audio playback synchronized with video
- ✅ Playback controls:
  - Play/Pause (space bar)
  - Stop (return to start)
  - Seek forward/backward (arrow keys)
- ✅ User clicks Play → Video plays from current playhead position
- ✅ User drags playhead → Preview updates to show frame at that position
- ✅ Audio plays in sync with video
- ✅ Preview window displays correct frame for timeline composition

**Non-Functional Requirements - Must Pass:**
- ✅ Video latency: Preview starts playing in <500ms
- ✅ Sync accuracy: Audio/video drift <50ms
- ✅ Frame rate: Match source video frame rate (24/30/60 FPS)
- ✅ Supported codecs: H.264 (MP4), H.265 (HEVC)

---

## User Stories

### Story 1: Video Player Component

**As a** video editor  
**I need** a video player in the preview panel  
**So that** I can watch my timeline composition

**Acceptance Criteria:**

**Player UI:**
- [ ] HTML5 `<video>` element in center preview panel
- [ ] Video sized to fit panel (maintain aspect ratio)
- [ ] Black letterbox for non-16:9 videos
- [ ] Video controls below player:
  - [ ] ◀ Previous Frame button
  - [ ] ⏸/▶ Play/Pause button (toggle)
  - [ ] ▶ Next Frame button
  - [ ] ⏹ Stop button
  - [ ] Time display: "00:15 / 02:30" (current / total)
  - [ ] Volume slider (0-100%)
  - [ ] Mute button
  - [ ] Fullscreen button (P2)

**Video Element:**
- [ ] Autoplay disabled (controlled programmatically)
- [ ] Controls hidden (custom controls used)
- [ ] Preload metadata only (not full video)
- [ ] Cross-origin handling for file:// URLs
- [ ] Hardware acceleration enabled

**Playback State:**
- [ ] Playing: Video plays, button shows pause icon
- [ ] Paused: Video frozen, button shows play icon
- [ ] Stopped: Video at 0:00, button shows play icon
- [ ] Loading: Spinner overlay while buffering
- [ ] Error: Error message if video fails to load

**Time Display:**
- [ ] Current time updates during playback (every 100ms)
- [ ] Total duration from timeline
- [ ] Format: MM:SS or HH:MM:SS for long videos
- [ ] Time clickable to enter specific time (P2)

**Verification Tests:**
- [ ] Add clip to timeline → Player loads first frame
- [ ] Click Play → Video plays
- [ ] Click Pause → Video pauses
- [ ] Time display updates while playing
- [ ] Stop → Returns to start
- [ ] Volume slider → Adjusts audio level

---

### Story 2: Timeline-Player Synchronization

**As a** video editor  
**I need** the player synchronized with timeline playhead  
**So that** what I see matches where I am in the timeline

**Acceptance Criteria:**

**Playhead → Player Sync:**
- [ ] When playhead moves → Player jumps to that time
- [ ] When timeline clip selected → Player shows that clip
- [ ] When scrubbing timeline → Player updates in real-time
- [ ] Frame-accurate synchronization

**Player → Playhead Sync:**
- [ ] When video plays → Playhead moves along timeline
- [ ] Playhead position = video.currentTime
- [ ] Playhead updates at 60 FPS during playback
- [ ] When video ends → Playhead stops at end

**Bidirectional Communication:**
- [ ] Timeline store → Player (via state)
- [ ] Player events → Timeline store (update playhead)
- [ ] State changes trigger appropriate updates
- [ ] No circular update loops

**Seek Operations:**
- [ ] Click timeline → Player seeks to that time
- [ ] Seek latency <100ms
- [ ] Seek shows loading indicator if buffering needed
- [ ] Seek cancels if new seek requested

**Verification Tests:**
- [ ] Move playhead on timeline → Player jumps to frame
- [ ] Click Play → Playhead and video move together
- [ ] Drag playhead while playing → Video follows
- [ ] Click different position → Both update immediately

---

### Story 3: Playback Controls & Keyboard Shortcuts

**As a** video editor  
**I need** keyboard shortcuts and intuitive controls  
**So that** I can efficiently navigate video playback

**Acceptance Criteria:**

**Keyboard Shortcuts:**
- [ ] **Space** - Play/Pause toggle
- [ ] **K** - Play/Pause toggle (alternate)
- [ ] **J** - Rewind (play backward at -1x speed) - P2
- [ ] **L** - Fast forward (play at 2x speed) - P2
- [ ] **Left Arrow** - Previous frame (1/fps second)
- [ ] **Right Arrow** - Next frame (1/fps second)
- [ ] **Shift+Left** - Jump back 1 second
- [ ] **Shift+Right** - Jump forward 1 second
- [ ] **Home** - Jump to start (0:00)
- [ ] **End** - Jump to end
- [ ] **I** - Set in point (mark clip start) - P2
- [ ] **O** - Set out point (mark clip end) - P2

**Button Controls:**
- [ ] Play button → Starts playback
- [ ] Pause button → Pauses playback
- [ ] Stop button → Stops and returns to start
- [ ] Previous frame → Steps back one frame
- [ ] Next frame → Steps forward one frame
- [ ] All buttons have tooltips with shortcuts

**Playback Speed:**
- [ ] Normal speed: 1x
- [ ] Half speed: 0.5x (P2)
- [ ] Double speed: 2x (P2)
- [ ] Speed control dropdown (P2)

**Loop Mode:**
- [ ] Loop button in controls (P2)
- [ ] When enabled: Video loops at end
- [ ] Loop selection: Loops selected region (P2)

**Verification Tests:**
- [ ] Press Space → Video plays/pauses
- [ ] Press Right Arrow → Advances one frame
- [ ] Press Shift+Right → Jumps 1 second forward
- [ ] Press Home → Returns to start
- [ ] Click Play button → Starts playback
- [ ] All shortcuts work as documented

---

### Story 4: Multi-Clip Playback

**As a** video editor  
**I need** seamless playback across multiple timeline clips  
**So that** I can preview my edited composition

**Acceptance Criteria:**

**Clip Sequencing:**
- [ ] Playback starts at playhead position
- [ ] Plays current clip to its end
- [ ] Automatically transitions to next clip
- [ ] No gap or freeze between clips
- [ ] Continues until timeline end or pause

**Clip Transitions:**
- [ ] Detect when current clip ends
- [ ] Load next clip source
- [ ] Seek to correct position in next clip
- [ ] Respect trim points (trimIn/trimOut)
- [ ] Transition time <50ms (imperceptible)

**Clip Source Switching:**
- [ ] Each clip may reference different video file
- [ ] Switch video.src when transitioning clips
- [ ] Preload next clip while current playing (P2)
- [ ] Handle source switch without pause

**Trim Point Handling:**
- [ ] Clip has trimIn and trimOut values
- [ ] Playback starts at trimIn offset in source
- [ ] Playback stops at trimOut offset
- [ ] Source file plays: [trimIn → originalDuration - trimOut]

**Timeline End Behavior:**
- [ ] Reaches last clip end → Stops
- [ ] Playhead stays at timeline end
- [ ] Play button resets to start (or continues from end)

**Error Handling:**
- [ ] Missing clip file → Skip to next clip, show warning
- [ ] Corrupt clip → Skip to next clip, show error
- [ ] Decode error → Pause and display error message

**Verification Tests:**
- [ ] Add 3 clips to timeline
- [ ] Play from start → All 3 clips play in sequence
- [ ] No visible gap between clips
- [ ] Audio continues smoothly across clips
- [ ] Playback stops at timeline end
- [ ] Remove middle clip → Playback skips correctly

---

### Story 5: Audio Synchronization

**As a** video editor  
**I need** audio synchronized with video  
**So that** my content has proper AV sync

**Acceptance Criteria:**

**Audio Playback:**
- [ ] Video element audio enabled
- [ ] Audio plays automatically with video
- [ ] Audio respects trim points (same as video)
- [ ] Audio continues across clip transitions
- [ ] Audio stops when playback stops

**Sync Accuracy:**
- [ ] Audio/video drift <50ms (imperceptible)
- [ ] Sync maintained during long playback (>5 minutes)
- [ ] Sync maintained after seeking
- [ ] Sync maintained across clip transitions

**Volume Control:**
- [ ] Volume slider: 0-100%
- [ ] Mute button: Toggle audio on/off
- [ ] Volume persists between sessions
- [ ] Mute state persists
- [ ] System volume independent

**Multi-Track Audio:**
- [ ] Track 1 audio plays normally
- [ ] Track 2 audio mixed with Track 1 (if both have audio)
- [ ] Muted tracks don't contribute audio
- [ ] Audio balance adjustable per track (P2)

**Audio-Only Clips:**
- [ ] Clips with audio but no video show waveform
- [ ] Audio plays during timeline playback
- [ ] Visual indicator in preview (audio icon, waveform)

**Verification Tests:**
- [ ] Play video with audio → Audio audible
- [ ] Adjust volume → Audio level changes
- [ ] Mute → Audio silenced
- [ ] Seek to different position → Audio synced
- [ ] Add 2 clips with audio → Audio plays continuously
- [ ] Monitor AV sync → No noticeable drift

---

### Story 6: Scrubbing & Frame Seeking

**As a** video editor  
**I need** to scrub through video quickly  
**So that** I can find specific frames or moments

**Acceptance Criteria:**

**Scrubbing:**
- [ ] Drag playhead on timeline → Preview updates in real-time
- [ ] Scrub speed: 30-60 FPS update rate
- [ ] Shows frames at playhead position
- [ ] Audio scrubbing: Brief audio snippets (P2)
- [ ] Smooth visual feedback during scrub

**Frame Stepping:**
- [ ] Previous frame button → Steps back 1 frame
- [ ] Next frame button → Steps forward 1 frame
- [ ] Left/Right arrows → Same as buttons
- [ ] Frame-accurate (1/fps precision)
- [ ] Preview updates immediately

**Seek Performance:**
- [ ] Seek latency <100ms
- [ ] Fast seek (within same clip): <50ms
- [ ] Slow seek (different clip): <200ms
- [ ] Loading indicator if seek takes >200ms
- [ ] Cancel pending seek if new seek requested

**Seek Accuracy:**
- [ ] Seek to exact frame requested
- [ ] No off-by-one frame errors
- [ ] Respects clip trim points
- [ ] Handles variable frame rate videos

**Visual Feedback:**
- [ ] Frame updates immediately on seek
- [ ] Loading spinner if buffering
- [ ] Current time display updates
- [ ] No black frames or flicker

**Verification Tests:**
- [ ] Drag playhead slowly → See every frame
- [ ] Drag playhead fast → Updates keep up
- [ ] Press Right Arrow 10 times → Advances 10 frames
- [ ] Seek to middle of clip → Shows correct frame
- [ ] Seek to trimmed section → Respects trim bounds

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Video Preview System                      │
├───────────────────────────────┬─────────────────────────────┤
│     VideoPlayer.tsx           │   Playback Controller        │
│     - <video> element         │   - playbackStore.ts         │
│     - Controls UI             │   - State: playing, paused   │
│     - Time display            │   - currentTime: number      │
│     - Volume controls         │   - duration: number         │
│                               │   - volume: number           │
│     Event Handlers            │   - muted: boolean           │
│     - onPlay                  │                              │
│     - onPause                 │   Actions:                   │
│     - onTimeUpdate            │   - play()                   │
│     - onSeeked                │   - pause()                  │
│     - onEnded                 │   - seek(time)               │
│     - onError                 │   - setVolume(level)         │
│                               │   - nextFrame()              │
│     Sync Logic                │   - prevFrame()              │
│     - Subscribe to timeline   │                              │
│     - Update playhead         │   Clip Sequencer             │
│     - Switch video sources    │   - getClipAtTime(time)      │
│     - Handle transitions      │   - loadNextClip()           │
│                               │   - calculateSeekPosition()  │
└───────────────────────────────┴─────────────────────────────┘
```

### Data Flow

```
Timeline Playhead Update:
1. User drags playhead on timeline
2. Timeline store updates playhead time
3. Playback store observes change
4. Calculate which clip at that time
5. Load clip source if different
6. Seek to position within clip (accounting for trimIn)
7. Update video element currentTime
8. Preview displays new frame

Video Playback:
1. User presses Play
2. Playback store sets playing=true
3. Video element starts playing
4. requestAnimationFrame loop:
   - Read video.currentTime
   - Convert to timeline time
   - Update timeline playhead position
   - Check if clip ended → Load next clip
   - Repeat
5. User presses Pause → Stop loop
```

### State Management

```typescript
interface PlaybackStore {
  playing: boolean;
  currentTime: number;           // Timeline time (seconds)
  duration: number;              // Total timeline duration
  volume: number;                // 0-1
  muted: boolean;
  playbackRate: number;          // 0.5, 1.0, 2.0
  loop: boolean;
  
  // Current clip being played
  currentClipId: string | null;
  currentClipStartTime: number;  // When clip starts in timeline
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  
  // Internal
  syncWithTimeline: () => void;
  loadClipAtTime: (time: number) => Promise<void>;
}
```

### Video Source Management

```typescript
function getClipAtTime(time: number, clips: TimelineClip[]): TimelineClip | null {
  return clips.find(clip => 
    time >= clip.startTime && time < clip.startTime + clip.duration
  ) || null;
}

function calculateClipSeekPosition(clip: TimelineClip, timelineTime: number): number {
  // Time within clip
  const clipTime = timelineTime - clip.startTime;
  
  // Add trim offset
  const sourceTime = clip.trimIn + clipTime;
  
  return sourceTime;
}

async function loadClip(clip: TimelineClip, videoElement: HTMLVideoElement) {
  const media = getMediaItem(clip.mediaId);
  if (!media) throw new Error('Media not found');
  
  // Set video source
  videoElement.src = `file://${media.filepath}`;
  
  // Wait for metadata load
  await new Promise((resolve) => {
    videoElement.addEventListener('loadedmetadata', resolve, { once: true });
  });
  
  return videoElement;
}
```

---

## Dependencies & Blockers

### Dependencies
- **Epic 1:** Desktop Shell (UI framework)
- **Epic 2:** Media Library (video file paths)
- **Epic 3:** Timeline (playhead position, clips)

### Enables
- **Epic 5:** Clip Trimming (visual feedback while trimming)
- **Epic 6:** Video Export (preview of export result)

---

## Risks & Mitigation

### Risk 1: Clip Transition Lag
**Impact:** HIGH - Visible gaps ruin user experience  
**Probability:** MEDIUM  
**Mitigation:**
- Preload next clip during current playback
- Use multiple video elements for seamless switch
- Test with various video formats
- Optimize source switching code

**Contingency:** Accept brief pause (<100ms) between clips for MVP

---

### Risk 2: Audio/Video Sync Drift
**Impact:** HIGH - Unwatchable content  
**Probability:** MEDIUM  
**Mitigation:**
- Use video.currentTime as source of truth
- Sync audio position to video position
- Monitor drift and correct if exceeds 50ms
- Test with long videos (>10 minutes)

**Contingency:** Reset sync every N seconds, accept minor drift for MVP

---

## Definition of Done

### Functionality
- [ ] Video player displays clips
- [ ] Play/Pause controls work
- [ ] Playhead synchronized with player
- [ ] Multiple clips play in sequence
- [ ] Audio synchronized with video
- [ ] Keyboard shortcuts functional
- [ ] Scrubbing updates preview in real-time

### Performance
- [ ] Preview latency <500ms
- [ ] AV sync drift <50ms
- [ ] Scrubbing at 30+ FPS
- [ ] Smooth playback at source frame rate

### Testing
- [ ] Play single clip → Works correctly
- [ ] Play 5 clips in sequence → Seamless transitions
- [ ] Scrub through entire timeline → All frames visible
- [ ] Audio stays in sync for 5+ minute video
- [ ] All keyboard shortcuts work

---

## Timeline & Milestones

### Tuesday Morning (Hours 13-16)
- Story 1: Video player component
- Story 2: Timeline synchronization

### Tuesday Afternoon (Hours 17-20)
- Story 3: Playback controls
- Story 4: Multi-clip playback
- Story 5: Audio synchronization

### Tuesday Evening (Hours 21-24)
- Story 6: Scrubbing & seeking
- Integration testing
- Bug fixes

**Checkpoint: Tuesday 10:59 PM** ✅

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.4

