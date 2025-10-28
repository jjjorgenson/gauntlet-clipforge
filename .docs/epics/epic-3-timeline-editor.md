# Epic 3: Timeline Editor

**Epic ID:** CLIP-EPIC-003  
**Priority:** P0 (Must-Have for MVP - Basic); P1 (Advanced Features)  
**Status:** Ready for Development  
**Timeline:** Phase 1-3 (Monday Evening - Wednesday AM)  
**Estimated Effort:** 12-16 hours  
**Dependencies:** Epic 1 (Desktop Shell), Epic 2 (Media Library)

---

## Epic Goal

Build a visual, interactive timeline interface where users can arrange, reorder, and manipulate video clips through direct manipulation, creating the core editing workspace that transforms imported media into composed video projects.

**Value Statement:** The timeline is the heart of video editing - where creativity happens. Without it, ClipForge is just a file viewer. This epic delivers the primary editing canvas that defines the user experience.

---

## Epic Description

### What We're Building

A canvas-based timeline editor that:
- **MVP (P0):** Displays clips as visual blocks, shows playhead position, allows adding clips from library
- **Final (P1):** Supports drag-and-drop reordering, clip splitting, deletion, multi-track composition, zoom controls, and snapping

The timeline provides:
- Temporal visualization of video composition
- Direct manipulation for clip arrangement
- Visual playhead synchronized with preview
- Time ruler for temporal reference
- Track-based organization (main video + overlays)

### Why It Matters

The timeline interface determines how intuitive and powerful the editor feels. Users need:
- **Visual representation** - See entire project at a glance
- **Direct manipulation** - Move clips like physical objects
- **Precision** - Frame-accurate positioning
- **Feedback** - Real-time updates during interaction

### Technical Foundation

This epic establishes:
1. **Canvas Rendering Engine** - HTML5 Canvas for 60 FPS performance
2. **Timeline State Management** - Clip positions, tracks, selection
3. **Interaction System** - Mouse/touch handlers for drag, select, resize
4. **Rendering Pipeline** - Efficient redraw using requestAnimationFrame
5. **Track Management** - Multi-track compositing system

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.3)

**P0 Functional Requirements (MVP) - Must Pass:**
- ✅ Canvas-based timeline with time ruler
- ✅ Visual playhead indicator (current time position)
- ✅ Display single clip on timeline as colored rectangle
- ✅ Click on media library clip to add to timeline
- ✅ Timeline shows clip duration proportionally
- ✅ User selects clip from library → Clip appears on timeline
- ✅ Timeline accurately represents clip duration
- ✅ Playhead moves along timeline when video plays

**P1 Functional Requirements (Final) - Must Pass:**
- ✅ Drag clips from media library onto timeline
- ✅ Multiple clips displayed in sequence
- ✅ Drag clips to reorder on timeline
- ✅ Select clip (highlight/border when selected)
- ✅ Delete selected clip (keyboard Delete or button)
- ✅ Split clip at playhead position
- ✅ Multiple tracks (2 minimum: main video + overlay)
- ✅ Zoom in/out on timeline (horizontal scaling)
- ✅ Snap-to-grid or snap-to-clip edges
- ✅ Audio waveform visualization (P2 acceptable)
- ✅ User drags clip on timeline → Clip position updates in real-time
- ✅ User splits clip → Two separate clips appear at split point
- ✅ User deletes clip → Clip removed, timeline updates
- ✅ Multiple clips play in sequence without gaps

**Non-Functional Requirements - Must Pass:**
- ✅ Rendering performance: 60 FPS timeline animation
- ✅ Interaction latency: <50ms response to user actions
- ✅ Canvas optimization: Use requestAnimationFrame
- ✅ Scalability: Handle 50+ clips without lag

### MVP Checkpoint (Tuesday 10:59 PM CT)

**P0 Features (Must Have):**
- ✅ Timeline canvas renders with time ruler
- ✅ Playhead visible and moveable
- ✅ Single track displayed
- ✅ Clips added from library appear on timeline
- ✅ Clips display proportional to duration
- ✅ Click to select clip
- ✅ Basic timeline rendering at 30+ FPS

### Final Checkpoint (Wednesday 10:59 PM CT)

**P1 Features (Must Have):**
- ✅ Drag clips from library to timeline
- ✅ Drag clips to reorder on timeline
- ✅ Multiple clips in sequence
- ✅ Delete clips (keyboard + button)
- ✅ Split clips at playhead
- ✅ Two tracks (main + overlay)
- ✅ Zoom in/out controls
- ✅ Snap-to-clip edges
- ✅ Smooth 60 FPS rendering

---

## User Stories

### Story 1: Canvas-Based Timeline Rendering (P0)

**As a** video editor  
**I need** a visual timeline canvas  
**So that** I can see my video composition spatially and temporally

**Acceptance Criteria:**

**Canvas Setup:**
- [ ] HTML5 Canvas element in timeline panel (from Epic 1)
- [ ] Canvas sized to fill timeline panel width and height
- [ ] Canvas resolution matches display (handle DPI scaling)
- [ ] Canvas clears and redraws on state changes
- [ ] Canvas uses requestAnimationFrame for smooth rendering

**Time Ruler:**
- [ ] Time ruler drawn at top of timeline
- [ ] Tick marks every second (large ticks)
- [ ] Tick marks every 0.5 seconds (medium ticks)
- [ ] Tick marks every 0.1 seconds (small ticks) when zoomed in
- [ ] Time labels at major intervals (0:00, 0:05, 0:10, etc.)
- [ ] Time labels formatted as MM:SS or HH:MM:SS
- [ ] Ruler background distinct from timeline background

**Timeline Grid:**
- [ ] Horizontal grid lines between tracks
- [ ] Vertical grid lines at time intervals (optional, subtle)
- [ ] Background color: Dark gray or theme color
- [ ] Grid color: Lighter gray, low opacity

**Coordinate System:**
- [ ] Time-to-pixel conversion: `pixelX = time * pixelsPerSecond`
- [ ] Pixel-to-time conversion: `time = pixelX / pixelsPerSecond`
- [ ] Default scale: 100 pixels per second
- [ ] Zoom changes pixelsPerSecond (50-500 range)
- [ ] Scroll offset for horizontal panning

**Rendering Pipeline:**
- [ ] Clear canvas on each frame
- [ ] Draw time ruler
- [ ] Draw tracks (background)
- [ ] Draw clips on tracks
- [ ] Draw playhead on top
- [ ] Draw selection highlights
- [ ] FPS counter in dev mode (optional)

**Performance:**
- [ ] Maintains 60 FPS with 10 clips
- [ ] Maintains 30+ FPS with 50 clips
- [ ] Rendering optimizations:
  - [ ] Only redraw when state changes
  - [ ] Dirty rectangle optimization (only redraw changed areas)
  - [ ] Offscreen canvas for complex elements
- [ ] No visible flicker or tearing

**Verification Tests:**
- [ ] Timeline renders with time ruler visible
- [ ] Time labels correct (0:00, 0:05, 0:10...)
- [ ] Canvas fills panel width
- [ ] Resize window → Canvas resizes proportionally
- [ ] No console errors
- [ ] FPS stays above 30 during interaction

---

### Story 2: Playhead Implementation (P0)

**As a** video editor  
**I need** a playhead indicator showing current time position  
**So that** I know where I am in the video timeline

**Acceptance Criteria:**

**Playhead Rendering:**
- [ ] Vertical line drawn from top to bottom of timeline
- [ ] Line color: Bright (red or blue) for visibility
- [ ] Line width: 2-3 pixels
- [ ] Playhead handle at top (triangle or circle)
- [ ] Handle can be grabbed for dragging
- [ ] Current time label near playhead (e.g., "0:15")

**Playhead Position:**
- [ ] Starts at time 0:00 (left edge)
- [ ] Position updates during video playback (Epic 4 integration)
- [ ] Position updates when dragged by user
- [ ] Position snaps to frame boundaries (frame-accurate)
- [ ] Position constrained to timeline bounds (0 to totalDuration)

**Playhead Interaction:**
- [ ] Click on timeline → Playhead jumps to click position
- [ ] Drag playhead handle → Playhead follows mouse
- [ ] Drag updates current time in real-time
- [ ] Release updates video preview (Epic 4 integration)
- [ ] Smooth animation when jumping (optional)

**Scrubbing:**
- [ ] Click and hold on playhead handle → Enter scrub mode
- [ ] Drag left/right → Playhead follows
- [ ] Preview updates during scrub (Epic 4 integration)
- [ ] Audio scrubs (short playback snippets) - P2 feature
- [ ] Release → Stops at new position

**Keyboard Control:**
- [ ] Left arrow → Move playhead back 1 frame
- [ ] Right arrow → Move playhead forward 1 frame
- [ ] Shift+Left → Jump back 1 second
- [ ] Shift+Right → Jump forward 1 second
- [ ] Home → Jump to start (0:00)
- [ ] End → Jump to end

**Performance:**
- [ ] Playhead updates at 60 FPS during drag
- [ ] No lag during scrubbing
- [ ] Smooth visual movement

**Verification Tests:**
- [ ] Playhead visible at timeline start
- [ ] Click timeline at 5 second mark → Playhead jumps to 5s
- [ ] Drag playhead → Follows mouse smoothly
- [ ] Press right arrow → Playhead moves forward
- [ ] Press Home → Playhead returns to start
- [ ] Playhead time label updates correctly

---

### Story 3: Add Clips to Timeline (P0)

**As a** video editor  
**I need** to add clips from media library to timeline  
**So that** I can start composing my video

**Acceptance Criteria:**

**Click to Add (MVP):**
- [ ] Click media library item → Adds clip to timeline
- [ ] Clip appears at playhead position
- [ ] If playhead at occupied space, add at end of timeline
- [ ] Clip added to currently selected track (default: Track 1)
- [ ] Success feedback (clip highlights briefly)

**Clip Rendering:**
- [ ] Clip drawn as rounded rectangle on timeline
- [ ] Clip color: Unique per clip or based on video type
- [ ] Clip shows thumbnail at start (small preview)
- [ ] Clip shows filename text (truncated if needed)
- [ ] Clip shows duration at bottom (e.g., "2:45")
- [ ] Clip width proportional to duration

**Clip Position Calculation:**
- [ ] Start time: Where clip begins on timeline
- [ ] End time: Start time + clip duration
- [ ] Position in pixels: `startTime * pixelsPerSecond`
- [ ] Width in pixels: `duration * pixelsPerSecond`

**Clip Data Model:**
```typescript
interface TimelineClip {
  id: string;                    // UUID
  mediaId: string;               // Reference to MediaItem
  trackId: string;               // Which track clip is on
  startTime: number;             // Seconds from timeline start
  duration: number;              // Clip duration (may be trimmed)
  trimIn: number;                // Trim start (seconds from media start)
  trimOut: number;               // Trim end (seconds from media end)
  selected: boolean;
}
```

**Timeline State:**
- [ ] Timeline store manages clips array
- [ ] Clips sorted by startTime
- [ ] Total timeline duration calculated from clips
- [ ] Add clip action updates state
- [ ] State change triggers canvas redraw

**Collision Detection:**
- [ ] Check if new clip overlaps existing clips
- [ ] If overlap: Place after last clip
- [ ] If overlap: Show warning (P1)
- [ ] Auto-snap to end of last clip

**Verification Tests:**
- [ ] Click media item → Clip appears on timeline
- [ ] Click same item again → Second instance appears
- [ ] Add 5 clips → All appear in sequence
- [ ] Each clip shows thumbnail and name
- [ ] Clip widths proportional to their durations
- [ ] Add 3-second clip → Width is 300px at 100px/sec scale

---

### Story 4: Clip Selection and Highlighting (P0)

**As a** video editor  
**I need** to select clips on the timeline  
**So that** I can perform actions on specific clips

**Acceptance Criteria:**

**Selection Interaction:**
- [ ] Click clip → Selects clip
- [ ] Click empty timeline → Deselects all
- [ ] Cmd/Ctrl+click → Toggle selection (multi-select)
- [ ] Click and drag on empty space → Marquee selection (P1)
- [ ] Selected clip(s) highlighted visually

**Visual Feedback:**
- [ ] Selected clip: Bright border (2-3px, blue or accent color)
- [ ] Selected clip: Slightly lighter background
- [ ] Unselected clips: Normal appearance
- [ ] Hover state: Subtle highlight before click
- [ ] Multiple selection: All selected clips highlighted

**Selection State:**
- [ ] Timeline store tracks selectedClipIds array
- [ ] Only one clip selected at a time (MVP)
- [ ] Multi-select supported (P1)
- [ ] Selection persists until changed
- [ ] Deselect on play (optional)

**Selection Actions:**
- [ ] Select All: Cmd/Ctrl+A (P1)
- [ ] Deselect All: Escape key
- [ ] Select Next: Tab key (P1)
- [ ] Select Previous: Shift+Tab (P1)

**Context Menu:**
- [ ] Right-click selected clip → Context menu
- [ ] Menu items:
  - [ ] "Delete" - Removes clip
  - [ ] "Duplicate" - Creates copy (P1)
  - [ ] "Split at Playhead" - Splits clip (P1)
  - [ ] "Properties" - Shows clip details (P2)

**Verification Tests:**
- [ ] Click clip → Clip highlights with border
- [ ] Click different clip → First deselects, second selects
- [ ] Click empty space → Deselects clip
- [ ] Cmd/Ctrl+click two clips → Both highlighted (P1)
- [ ] Press Escape → All clips deselected
- [ ] Right-click clip → Context menu appears

---

### Story 5: Drag Clips from Library to Timeline (P1)

**As a** video editor  
**I need** to drag clips from media library onto timeline  
**So that** I can quickly add and position content

**Acceptance Criteria:**

**Drag Start:**
- [ ] Mouse down on media library item → Drag starts
- [ ] Drag threshold: 5 pixels movement before activating
- [ ] Cursor changes to grabbing hand
- [ ] Ghost image follows cursor (semi-transparent clip preview)
- [ ] Original item remains in library

**Drag Over Timeline:**
- [ ] Timeline highlights when clip dragged over it
- [ ] Drop position indicator (vertical line) shows where clip will land
- [ ] Drop position snaps to playhead, clip edges, or time markers
- [ ] Invalid drop zones show "no drop" cursor
- [ ] Real-time position calculation as mouse moves

**Drag Drop:**
- [ ] Release mouse → Clip added at drop position
- [ ] Clip inserted at indicated time
- [ ] If overlapping existing clip: Push clips right (ripple) or reject
- [ ] Success animation (clip fades in)
- [ ] Failure animation (clip snaps back) if invalid

**Drag Cancel:**
- [ ] Press Escape during drag → Cancels drag
- [ ] Drag outside window → Cancels drag
- [ ] Ghost image disappears
- [ ] No clip added

**Snap Behavior:**
- [ ] Snap to playhead (5-pixel tolerance)
- [ ] Snap to clip start/end edges (5-pixel tolerance)
- [ ] Snap to time markers (whole seconds)
- [ ] Visual snap feedback (position indicator jumps)
- [ ] Snapping can be toggled with modifier key (Cmd/Ctrl)

**Performance:**
- [ ] Ghost image updates at 60 FPS
- [ ] No lag during drag
- [ ] Position calculation efficient (<5ms)

**Verification Tests:**
- [ ] Drag media item to timeline → Drop indicator appears
- [ ] Release → Clip added at that position
- [ ] Drag near playhead → Snaps to playhead
- [ ] Drag near existing clip → Snaps to clip edge
- [ ] Press Escape during drag → Drag cancels
- [ ] Drag to invalid area → Shows "no drop" cursor

---

### Story 6: Reorder Clips by Dragging (P1)

**As a** video editor  
**I need** to drag clips to new positions on timeline  
**So that** I can rearrange my video composition

**Acceptance Criteria:**

**Drag Selected Clip:**
- [ ] Mouse down on selected clip → Drag starts
- [ ] Cursor changes to move cursor
- [ ] Clip becomes semi-transparent during drag
- [ ] Other clips remain in place
- [ ] Drop indicator shows new position

**Reordering Behavior:**
- [ ] Drag clip left → Can move earlier in timeline
- [ ] Drag clip right → Can move later in timeline
- [ ] Drop at new position → Clip moves there
- [ ] Other clips shift to accommodate (ripple mode)
- [ ] Or: Clips swap positions (shuffle mode)
- [ ] Configurable in settings (default: ripple)

**Collision Handling:**
- [ ] If new position overlaps clip → Push that clip forward
- [ ] Or: Reject drop (show error)
- [ ] Or: Insert mode (split and make space)
- [ ] User preference determines behavior

**Snap to Clips:**
- [ ] Dragged clip snaps to adjacent clip edges
- [ ] Visual feedback when snapped (highlight)
- [ ] Snap tolerance: 5 pixels
- [ ] Disable snapping: Hold Cmd/Ctrl while dragging

**Multi-Clip Drag:**
- [ ] Select multiple clips (Cmd/Ctrl+click)
- [ ] Drag one → All selected clips move together
- [ ] Maintain relative positions
- [ ] Drop → All clips placed at new positions

**Undo Support:**
- [ ] Drag operation added to undo stack
- [ ] Cmd/Ctrl+Z → Reverts clip to original position
- [ ] Redo supported

**Verification Tests:**
- [ ] Add 3 clips in sequence
- [ ] Drag middle clip to end → Becomes last clip
- [ ] Drag last clip to start → Becomes first clip
- [ ] Clips don't overlap after drag
- [ ] Undo → Clip returns to original position
- [ ] Drag near clip edge → Snaps to edge

---

### Story 7: Delete Clips (P1)

**As a** video editor  
**I need** to remove clips from timeline  
**So that** I can discard unwanted content

**Acceptance Criteria:**

**Delete Methods:**
- [ ] Select clip + press Delete/Backspace → Clip removed
- [ ] Select clip + click toolbar Delete button → Clip removed
- [ ] Right-click clip → "Delete" in context menu → Clip removed
- [ ] Select multiple clips + Delete → All removed

**Delete Behavior:**
- [ ] Selected clip(s) removed immediately
- [ ] Gap left in timeline (default)
- [ ] Or: Ripple delete (clips shift left to close gap)
- [ ] User preference or modifier key determines behavior

**Ripple Delete:**
- [ ] Hold Shift while deleting → Ripple mode
- [ ] All clips after deleted clip shift left
- [ ] No gaps in timeline
- [ ] Total timeline duration decreases

**Visual Feedback:**
- [ ] Clip fades out (quick animation)
- [ ] Remaining clips shift smoothly (if ripple)
- [ ] Timeline redraws

**Undo Support:**
- [ ] Delete operation added to undo stack
- [ ] Cmd/Ctrl+Z → Restores deleted clip
- [ ] Clip restored at original position
- [ ] Redo supported (re-deletes clip)

**Confirmation:**
- [ ] No confirmation for single delete (undo available)
- [ ] Confirmation dialog for deleting many clips (>5)
- [ ] "Delete X clips?" with Cancel/Delete buttons

**Verification Tests:**
- [ ] Select clip + press Delete → Clip removed
- [ ] Delete middle clip → Gap remains
- [ ] Delete with Shift → Gap closes (ripple)
- [ ] Delete last clip → Timeline duration shortens
- [ ] Undo delete → Clip restored
- [ ] Delete multiple clips → All removed

---

### Story 8: Split Clip at Playhead (P1)

**As a** video editor  
**I need** to split clips at the playhead position  
**So that** I can remove sections or rearrange parts

**Acceptance Criteria:**

**Split Trigger:**
- [ ] Select clip + press Cmd/Ctrl+K → Split at playhead
- [ ] Or: Click toolbar "Split" button
- [ ] Or: Right-click clip → "Split at Playhead"
- [ ] Playhead must be within clip bounds
- [ ] If playhead outside clip → No action or error message

**Split Behavior:**
- [ ] Original clip splits into two clips
- [ ] Left clip: Start → playhead position
- [ ] Right clip: Playhead position → original end
- [ ] Both clips reference same media file
- [ ] Trim points adjusted for each clip
- [ ] No gap between clips

**Clip Data After Split:**
```typescript
// Original clip: [0s - 10s]
// Split at 4s:
// Clip A: startTime=0s, duration=4s, trimIn=0s, trimOut=6s
// Clip B: startTime=4s, duration=6s, trimIn=4s, trimOut=0s
```

**Visual Feedback:**
- [ ] Split line appears at playhead (animation)
- [ ] Clips separate slightly (1-2px gap animation)
- [ ] Both clips remain selected after split
- [ ] Timeline redraws

**Precision:**
- [ ] Split at exact frame boundary
- [ ] No frames lost or duplicated
- [ ] Frame-accurate to 1/fps

**Multiple Clips:**
- [ ] Split affects only selected clip
- [ ] If multiple clips selected → Split all at playhead
- [ ] Each clip splits individually

**Undo Support:**
- [ ] Split operation added to undo stack
- [ ] Undo → Rejoins clips into original
- [ ] Redo → Re-splits

**Verification Tests:**
- [ ] Add 10-second clip
- [ ] Move playhead to 4 seconds
- [ ] Select clip + press Cmd+K
- [ ] Two clips appear: 4s and 6s
- [ ] Play through split → No visible seam
- [ ] Undo → Original 10s clip restored
- [ ] Split at 0s or 10s → No split (at edges)

---

### Story 9: Multi-Track Timeline (P1)

**As a** video editor  
**I need** multiple tracks on the timeline  
**So that** I can layer videos (e.g., picture-in-picture)

**Acceptance Criteria:**

**Track Structure:**
- [ ] Timeline displays 2 tracks minimum
  - [ ] Track 1: Main video (bottom)
  - [ ] Track 2: Overlay video (top)
- [ ] Tracks stacked vertically
- [ ] Each track has label (e.g., "Track 1", "Track 2")
- [ ] Each track has independent clip lanes
- [ ] More tracks can be added (P2, up to 5)

**Track Rendering:**
- [ ] Track height: 80-100 pixels each
- [ ] Tracks separated by horizontal line
- [ ] Track background alternates slightly (contrast)
- [ ] Track labels on left side
- [ ] Clips drawn within track bounds

**Track Controls:**
- [ ] Each track has control panel:
  - [ ] Solo button (S) - Mute other tracks
  - [ ] Mute button (M) - Disable audio
  - [ ] Lock button (L) - Prevent editing
  - [ ] Visibility toggle (eye icon)
- [ ] Control panel collapses/expands (P2)

**Drag Clips Between Tracks:**
- [ ] Drag clip vertically → Moves to different track
- [ ] Drop indicator shows target track
- [ ] Clip switches tracks on drop
- [ ] Clip maintains start time position
- [ ] Visual feedback during drag

**Track Compositing:**
- [ ] Track 2 (top) overlays Track 1 (bottom)
- [ ] Compositing order: higher tracks on top
- [ ] Preview shows combined result (Epic 4 integration)
- [ ] Export renders all tracks composited (Epic 6 integration)

**Track Selection:**
- [ ] Click track label → Selects track (highlights)
- [ ] New clips added to selected track
- [ ] Track selection persists

**Track State Management:**
```typescript
interface Track {
  id: string;
  name: string;
  index: number;              // 0 = bottom, higher = on top
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
  height: number;             // Pixels
}
```

**Verification Tests:**
- [ ] Timeline shows 2 tracks
- [ ] Add clip → Goes to selected track
- [ ] Drag clip from Track 1 to Track 2 → Moves successfully
- [ ] Mute Track 2 → Audio from that track silenced
- [ ] Lock Track 1 → Cannot edit clips on that track
- [ ] Toggle Track 2 visibility → Clips disappear but remain in project

---

### Story 10: Timeline Zoom Controls (P1)

**As a** video editor  
**I need** to zoom in/out on the timeline  
**So that** I can see fine details or overall project structure

**Acceptance Criteria:**

**Zoom Controls:**
- [ ] Zoom in button (+) in timeline header
- [ ] Zoom out button (-) in timeline header
- [ ] Zoom slider (optional)
- [ ] Keyboard shortcuts:
  - [ ] Cmd/Ctrl++ → Zoom in
  - [ ] Cmd/Ctrl+- → Zoom out
  - [ ] Cmd/Ctrl+0 → Reset to 100%
- [ ] Mouse wheel zoom: Scroll with Cmd/Ctrl held

**Zoom Levels:**
- [ ] Minimum zoom: 25% (25 pixels per second)
- [ ] Maximum zoom: 500% (500 pixels per second)
- [ ] Default zoom: 100% (100 pixels per second)
- [ ] Zoom increments: 25% steps or smooth continuous
- [ ] Current zoom level displayed (e.g., "100%")

**Zoom Behavior:**
- [ ] Zoom centered on playhead position
- [ ] Or: Zoom centered on mouse position (mouse wheel)
- [ ] Clips scale proportionally
- [ ] Time ruler updates tick spacing
- [ ] Playhead position remains anchored

**Zoom-Dependent Rendering:**
- [ ] Zoomed out: Fewer time labels, larger tick spacing
- [ ] Zoomed in: More time labels, smaller tick intervals
- [ ] Zoomed in: Clip details more visible (frames, waveforms)
- [ ] Zoomed out: Simplified clip rendering (performance)

**Auto-Zoom Features:**
- [ ] "Fit to Window" button → Scales timeline to fit all clips
- [ ] "Zoom to Selection" → Focuses on selected clip(s)

**Horizontal Scrolling:**
- [ ] Scrollbar at bottom of timeline
- [ ] Drag scrollbar → Pans timeline
- [ ] Mouse wheel (without modifier) → Horizontal scroll
- [ ] Scroll position persists

**Performance:**
- [ ] Zoom transition smooth (animated over 200ms)
- [ ] No lag during zoom
- [ ] Canvas redraws efficiently at new scale

**Verification Tests:**
- [ ] Click "+" → Timeline zooms in (clips wider)
- [ ] Click "-" → Timeline zooms out (clips narrower)
- [ ] Press Cmd++ → Zooms in
- [ ] Cmd+scroll wheel → Zooms smoothly
- [ ] Zoom in → Time labels show smaller intervals (0.5s, 0.1s)
- [ ] Zoom out → Time labels show larger intervals (10s, 30s)
- [ ] Click "Fit to Window" → All clips visible
- [ ] Zoom maintains playhead center position

---

### Story 11: Snap-to-Edge Feature (P1)

**As a** video editor  
**I need** clips to snap to other clip edges  
**So that** I can precisely align clips without gaps

**Acceptance Criteria:**

**Snap Points:**
- [ ] Clip start edge snaps to:
  - [ ] Other clip end edges
  - [ ] Other clip start edges (alignment)
  - [ ] Playhead position
  - [ ] Time markers (whole seconds)
  - [ ] Track boundaries (vertical snap)
- [ ] Snap tolerance: 5 pixels (adjustable)

**Snap Feedback:**
- [ ] Visual indicator when snapped (highlight or line)
- [ ] Snap line drawn from snap source to target
- [ ] Subtle haptic feedback (if supported)
- [ ] Snapped position locks until moved beyond tolerance

**Snap Toggle:**
- [ ] Snapping enabled by default
- [ ] Toggle button in timeline toolbar (magnet icon)
- [ ] Keyboard shortcut: S key toggles snapping
- [ ] Temporary disable: Hold Cmd/Ctrl while dragging

**Snap Behavior:**
- [ ] While dragging clip:
  - [ ] Check proximity to all snap points
  - [ ] If within tolerance → Snap to closest point
  - [ ] Clip position locked to snap point
  - [ ] Visual feedback appears
- [ ] Release → Clip stays at snapped position

**Snap Settings:**
- [ ] Snap tolerance: 5px (default)
- [ ] Snap to grid: Every 1 second (optional)
- [ ] Snap to frames: Frame-accurate positioning
- [ ] Snap to playhead: Always enabled

**Performance:**
- [ ] Snap calculation efficient (<5ms)
- [ ] No lag during drag
- [ ] Snap detection runs every frame (60 FPS)

**Verification Tests:**
- [ ] Add 2 clips with gap
- [ ] Drag second clip left → Snaps to first clip end
- [ ] Visual snap line appears
- [ ] Clips align perfectly (no gap, no overlap)
- [ ] Click magnet icon → Snapping disabled
- [ ] Drag clip → No snapping occurs
- [ ] Hold Cmd while dragging → Temporarily disables snap

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Timeline System                           │
├───────────────────────────────┬─────────────────────────────┤
│        Canvas Renderer        │      State Management        │
│                               │                              │
│  TimelineCanvas.tsx           │  timelineStore.ts (Zustand)  │
│  - Canvas ref & context       │  - tracks: Track[]           │
│  - Render loop (rAF)          │  - clips: TimelineClip[]     │
│  - Draw time ruler            │  - playhead: number          │
│  - Draw tracks                │  - selectedClipIds: string[] │
│  - Draw clips                 │  - zoom: number              │
│  - Draw playhead              │  - scrollOffset: number      │
│  - Draw selection             │                              │
│                               │  Actions:                    │
│  Interaction Handlers         │  - addClip(clip)             │
│  - Mouse down/move/up         │  - moveClip(id, time)        │
│  - Click detection            │  - deleteClip(id)            │
│  - Drag detection             │  - splitClip(id, time)       │
│  - Scroll handling            │  - selectClip(id)            │
│                               │  - setPlayhead(time)         │
│  Utils                        │  - setZoom(level)            │
│  - timeToPixel(time)          │                              │
│  - pixelToTime(pixel)         │  Selectors:                  │
│  - detectCollision()          │  - getClipsForTrack(id)      │
│  - snapToPoint()              │  - getTotalDuration()        │
│                               │  - getSelectedClips()        │
└───────────────────────────────┴─────────────────────────────┘
```

### Data Models

**TimelineClip**
```typescript
interface TimelineClip {
  id: string;
  mediaId: string;               // Reference to MediaItem
  trackId: string;
  startTime: number;             // Seconds from timeline start
  duration: number;              // Current duration (may be trimmed)
  originalDuration: number;      // Original media duration
  trimIn: number;                // Trim from start (seconds)
  trimOut: number;               // Trim from end (seconds)
  selected: boolean;
  locked: boolean;
  color?: string;                // Custom clip color
}
```

**Track**
```typescript
interface Track {
  id: string;
  name: string;
  index: number;                 // 0 = bottom layer
  muted: boolean;
  locked: boolean;
  visible: boolean;
  solo: boolean;
  height: number;                // Pixels
  color?: string;
}
```

**Timeline State**
```typescript
interface TimelineStore {
  tracks: Track[];
  clips: TimelineClip[];
  playhead: number;              // Current time (seconds)
  selectedClipIds: string[];
  zoom: number;                  // Pixels per second
  scrollOffset: number;          // Horizontal scroll (pixels)
  snapping: boolean;
  duration: number;              // Total timeline duration
  
  // Actions
  addClip: (mediaId: string, trackId: string, startTime: number) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  deleteClip: (clipId: string, ripple?: boolean) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  selectClip: (clipId: string, multi?: boolean) => void;
  setPlayhead: (time: number) => void;
  setZoom: (zoom: number) => void;
  toggleSnapping: () => void;
}
```

### Rendering Pipeline

```
Every Frame (requestAnimationFrame):
1. Check if state changed (dirty flag)
2. If changed:
   a. Clear canvas
   b. Calculate visible time range (based on scroll)
   c. Draw time ruler (only visible portion)
   d. For each track:
      - Draw track background
      - Draw track label
      - For each clip in track (only visible):
        * Calculate clip position/size
        * Draw clip rectangle
        * Draw clip thumbnail
        * Draw clip label
        * Draw selection highlight (if selected)
   e. Draw playhead line
   f. Draw drag ghost (if dragging)
   g. Draw snap indicators (if snapping)
3. Mark clean
4. Request next frame
```

### Coordinate Conversions

```typescript
function timeToPixel(time: number, zoom: number, scrollOffset: number): number {
  return (time * zoom) - scrollOffset;
}

function pixelToTime(pixel: number, zoom: number, scrollOffset: number): number {
  return (pixel + scrollOffset) / zoom;
}

function getClipBounds(clip: TimelineClip, zoom: number, scrollOffset: number) {
  const x = timeToPixel(clip.startTime, zoom, scrollOffset);
  const width = clip.duration * zoom;
  const track = getTrack(clip.trackId);
  const y = track.index * TRACK_HEIGHT;
  const height = TRACK_HEIGHT - TRACK_PADDING;
  return { x, y, width, height };
}
```

---

## Dependencies & Blockers

### Dependencies
- **Epic 1:** Desktop Shell (UI framework, canvas rendering)
- **Epic 2:** Media Library (clips to add to timeline)

### Enables
- **Epic 4:** Video Preview & Playback (timeline drives preview)
- **Epic 5:** Clip Trimming (operates on timeline clips)
- **Epic 6:** Video Export (exports timeline composition)

---

## Risks & Mitigation

### Risk 1: Canvas Performance with Many Clips
**Impact:** HIGH - Laggy timeline unusable  
**Probability:** MEDIUM  
**Mitigation:**
- Render only visible clips (viewport culling)
- Use dirty rectangles (only redraw changed areas)
- Offscreen canvas for complex elements
- Throttle render to 30 FPS if needed
- Profile and optimize hot paths

**Contingency:** Simplify rendering (no thumbnails in clips, solid colors only)

---

### Risk 2: Complex Drag-and-Drop Logic
**Impact:** MEDIUM - Buggy interactions frustrate users  
**Probability:** HIGH  
**Mitigation:**
- Start with simple drag (P0: just add clips)
- Incremental feature adds (P1: reorder, snap, multi-track)
- Extensive testing of edge cases
- State machine for drag states (idle, dragging, snapping, dropping)

**Contingency:** Limit to basic drag, skip advanced snapping for MVP

---

### Risk 3: Frame-Accurate Positioning
**Impact:** MEDIUM - Clips misaligned causing playback issues  
**Probability:** MEDIUM  
**Mitigation:**
- All times stored in seconds (float precision)
- Snap to frame boundaries: `Math.round(time * fps) / fps`
- Test with various frame rates (24, 30, 60 fps)
- Validation on clip position changes

**Contingency:** Accept sub-frame accuracy for MVP, note as known issue

---

## Definition of Done

### P0 (MVP Checkpoint - Tuesday)
- [ ] Timeline canvas renders
- [ ] Time ruler visible with correct labels
- [ ] Playhead renders and moves
- [ ] Single track displayed
- [ ] Clips can be added from library
- [ ] Clips display proportionally
- [ ] Click to select clip works
- [ ] 30+ FPS rendering

### P1 (Final Checkpoint - Wednesday)
- [ ] All P0 features working
- [ ] Drag clips from library to timeline
- [ ] Drag clips to reorder
- [ ] Delete clips (keyboard + button)
- [ ] Split clips at playhead
- [ ] Two tracks (main + overlay)
- [ ] Zoom in/out controls
- [ ] Snap-to-edge working
- [ ] 60 FPS rendering with 20+ clips

### Testing
- [ ] Add 20 clips → All visible and manageable
- [ ] Drag clip to reorder → Updates correctly
- [ ] Split clip → Two clips appear
- [ ] Delete clip → Removed from timeline
- [ ] Zoom in/out → Timeline scales correctly
- [ ] All interactions feel responsive (<50ms)

---

## Timeline & Milestones

### Monday Evening (Hours 9-12)
- Story 1: Canvas rendering
- Story 2: Playhead implementation
- Story 3: Add clips to timeline (basic)

### Tuesday Morning (Hours 13-16)
- Story 4: Clip selection
- MVP testing and refinement

**MVP Checkpoint: Tuesday 10:59 PM** ✅

### Tuesday Evening (Hours 17-20)
- Story 5: Drag from library
- Story 6: Reorder clips
- Story 7: Delete clips

### Wednesday Morning (Hours 21-24)
- Story 8: Split clips
- Story 9: Multi-track
- Story 10: Zoom controls
- Story 11: Snapping

**Final Checkpoint: Wednesday 10:59 PM** ✅

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.3

