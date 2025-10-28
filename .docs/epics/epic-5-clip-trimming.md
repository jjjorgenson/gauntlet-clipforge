# Epic 5: Clip Trimming

**Epic ID:** CLIP-EPIC-005  
**Priority:** P0 (Must-Have for MVP)  
**Status:** Ready for Development  
**Timeline:** Phase 2 (Tuesday PM)  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Epic 3 (Timeline), Epic 4 (Video Preview)

---

## Epic Goal

Enable non-destructive trimming of video clips directly on the timeline through intuitive drag handles, allowing users to adjust start and end points with frame-accurate precision while preserving original source files.

**Value Statement:** Trimming is the most fundamental editing operation. Without it, users can only use entire clips, severely limiting creative control.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.5)

**Functional Requirements - Must Pass:**
- ✅ Visual trim handles at start/end of clip on timeline
- ✅ Drag trim handles to adjust in/out points
- ✅ Preview window updates to show trimmed content
- ✅ Non-destructive editing (original file unchanged)
- ✅ Display trimmed duration vs. original duration
- ✅ Trim precision: Frame-accurate
- ✅ User drags start handle right → Clip starts later, duration shortens
- ✅ User drags end handle left → Clip ends earlier, duration shortens
- ✅ Preview respects trim points (doesn't show trimmed sections)
- ✅ Export only includes trimmed portions

**Non-Functional Requirements - Must Pass:**
- ✅ Trim operation: <100ms to apply
- ✅ Visual feedback: Handle position updates in real-time
- ✅ Minimum clip duration: 0.1 seconds (prevent invalid trims)

---

## User Stories

### Story 1: Trim Handle UI

**As a** video editor  
**I need** visual trim handles on clips  
**So that** I can identify and grab the trim points

**Acceptance Criteria:**

**Handle Rendering:**
- [ ] Left handle: Drawn at clip start edge
- [ ] Right handle: Drawn at clip end edge
- [ ] Handle appearance: Vertical bar or bracket shape
- [ ] Handle color: Accent color (yellow, orange) for visibility
- [ ] Handle width: 4-6 pixels
- [ ] Handle height: Full clip height
- [ ] Handles only visible on selected clip

**Handle Interaction States:**
- [ ] Default: Subtle, visible but not prominent
- [ ] Hover: Brighter, cursor changes to resize (↔)
- [ ] Active (dragging): Highlighted, full opacity
- [ ] Disabled (locked clip): Grayed out, no interaction

**Cursor Changes:**
- [ ] Hover left handle: `cursor: ew-resize` (← →)
- [ ] Hover right handle: `cursor: ew-resize` (← →)
- [ ] Hover clip center: `cursor: move` (✋)
- [ ] Dragging handle: `cursor: col-resize`

**Handle Hit Area:**
- [ ] Hit area wider than visual width (10px total)
- [ ] Easier to grab, especially when zoomed out
- [ ] Hit area doesn't overlap clip center

**Visual Indicators:**
- [ ] Trimmed area: Darker or striped overlay (optional)
- [ ] Trim amount label: Shows how much trimmed (P2)
- [ ] Handle icons: Bracket shapes [ ] at edges

**Verification Tests:**
- [ ] Select clip → Handles appear at edges
- [ ] Hover left handle → Cursor changes to resize
- [ ] Deselect clip → Handles disappear
- [ ] Handles visible at all zoom levels

---

### Story 2: Trim by Dragging Handles

**As a** video editor  
**I need** to drag trim handles  
**So that** I can adjust clip start/end points precisely

**Acceptance Criteria:**

**Drag Start Handle (Trim In):**
- [ ] Mouse down on left handle → Start drag
- [ ] Drag right → Clip starts later (trim from start)
- [ ] Drag left → Clip starts earlier (undo trim)
- [ ] Cannot drag beyond clip end (minimum 0.1s duration)
- [ ] Cannot drag left of original clip start
- [ ] Clip width decreases as trimmed
- [ ] Clip position (startTime) stays same
- [ ] trimIn value increases

**Drag End Handle (Trim Out):**
- [ ] Mouse down on right handle → Start drag
- [ ] Drag left → Clip ends earlier (trim from end)
- [ ] Drag right → Clip ends later (undo trim)
- [ ] Cannot drag before clip start (minimum 0.1s)
- [ ] Cannot drag right of original clip end
- [ ] Clip width decreases as trimmed
- [ ] trimOut value increases

**Real-Time Updates:**
- [ ] Handle position updates every frame (60 FPS)
- [ ] Clip width updates in real-time
- [ ] Timeline redraws efficiently
- [ ] No lag or stutter during drag

**Snap Behavior:**
- [ ] Handles snap to playhead (5px tolerance)
- [ ] Handles snap to other clip edges
- [ ] Handles snap to frame boundaries
- [ ] Snapping provides visual/haptic feedback
- [ ] Hold Cmd/Ctrl to disable snapping

**Constraints:**
- [ ] Minimum clip duration: 0.1 seconds
- [ ] Maximum trim: Cannot trim entire clip
- [ ] Handle stops at constraint boundaries
- [ ] Visual feedback when hitting constraint

**Undo Support:**
- [ ] Trim operation added to undo stack
- [ ] Cmd/Ctrl+Z → Reverts trim
- [ ] Redo supported

**Verification Tests:**
- [ ] Drag left handle right 2 seconds → Clip shortens
- [ ] Clip startTime unchanged, trimIn = 2s
- [ ] Drag right handle left 3 seconds → Clip shortens
- [ ] Clip duration = original - 5s (2s + 3s trimmed)
- [ ] Try to trim entire clip → Stops at minimum duration
- [ ] Undo → Trim reverted

---

### Story 3: Preview Updates During Trim

**As a** video editor  
**I need** the preview to update while trimming  
**So that** I can see exactly what frame I'm trimming to

**Acceptance Criteria:**

**Live Preview:**
- [ ] While dragging start handle → Preview shows current trim-in frame
- [ ] While dragging end handle → Preview shows current trim-out frame
- [ ] Preview updates in real-time (30+ FPS)
- [ ] Frame-accurate preview

**Scrubbing Effect:**
- [ ] Dragging handle acts like scrubbing
- [ ] See video frames as handle moves
- [ ] Audio scrub snippets (P2)
- [ ] Smooth visual feedback

**After Trim:**
- [ ] Release handle → Preview shows frame at playhead
- [ ] Play trimmed clip → Only shows untrimmed portion
- [ ] Playhead cannot move into trimmed areas

**Visual Indicators:**
- [ ] Trimmed region grayed out or striped on timeline
- [ ] Trim overlay shows what will be cut
- [ ] Duration label updates: "Original: 10s, Trimmed: 7s"

**Verification Tests:**
- [ ] Drag start handle → Preview shows different frames
- [ ] Release at 2s mark → Preview shows frame at 2s
- [ ] Play clip → Starts at trimmed in-point
- [ ] Doesn't play trimmed sections

---

### Story 4: Trim Data Model & State

**As a** developer  
**I need** proper trim data structure  
**So that** trims are stored and applied correctly

**Acceptance Criteria:**

**Clip Data Structure:**
```typescript
interface TimelineClip {
  id: string;
  mediaId: string;
  startTime: number;             // Position on timeline (unchanged by trim)
  duration: number;              // Visible duration (after trim)
  originalDuration: number;      // Source media duration
  trimIn: number;                // Seconds trimmed from start
  trimOut: number;               // Seconds trimmed from end
  // ...
}
```

**Trim Calculations:**
```typescript
// Visible duration after trim:
duration = originalDuration - trimIn - trimOut

// Playback range in source video:
sourceStart = trimIn
sourceEnd = originalDuration - trimOut

// Valid trim constraints:
trimIn >= 0
trimOut >= 0
trimIn + trimOut < originalDuration - MIN_DURATION
```

**State Management:**
- [ ] Timeline store updates clip trim values
- [ ] Trim operation triggers:
  - [ ] State update (store)
  - [ ] Canvas redraw (timeline)
  - [ ] Preview update (player)
- [ ] Trim values persist in project
- [ ] Export respects trim values

**Non-Destructive:**
- [ ] Original media file never modified
- [ ] Trim values stored separately
- [ ] Can reset trim (set trimIn/Out to 0)
- [ ] Can adjust trim repeatedly

**Verification Tests:**
- [ ] Trim clip → State updated correctly
- [ ] Check clip.trimIn and clip.trimOut values
- [ ] Original media file unchanged
- [ ] Reload project → Trim values restored
- [ ] Reset trim → Clip returns to full duration

---

### Story 5: Trim Precision & Frame Accuracy

**As a** video editor  
**I need** frame-accurate trimming  
**So that** my edits are precise and professional

**Acceptance Criteria:**

**Frame Snapping:**
- [ ] Trim points snap to frame boundaries
- [ ] Frame duration = 1/fps (e.g., 1/30 = 0.0333s)
- [ ] Trim values rounded to nearest frame:
  ```typescript
  trimIn = Math.round(trimIn * fps) / fps
  ```
- [ ] No sub-frame trimming (causes sync issues)

**Frame Indicators:**
- [ ] Show frame numbers during trim (optional)
- [ ] "Frame 45 of 300" display (P2)
- [ ] Timecode display: HH:MM:SS:FF (P2)

**Variable Frame Rate:**
- [ ] Handle VFR videos (average FPS)
- [ ] May not be perfectly frame-accurate for VFR
- [ ] Document limitation

**Precision Settings:**
- [ ] Frame-accurate mode (default)
- [ ] Sub-frame mode for VFR (P2)
- [ ] Snap-to-frame toggle

**Verification Tests:**
- [ ] 30fps video: Trim increments in 0.0333s steps
- [ ] 60fps video: Trim increments in 0.0167s steps
- [ ] Frame count matches expected (visual inspection)
- [ ] Export has no duplicate or skipped frames

---

## Technical Architecture

### Trim Interaction Flow

```
1. User hovers over clip edge
   → Detect hover on handle hit area
   → Change cursor to resize
   
2. User mouse down on handle
   → Capture initial mouse position
   → Capture initial trim value
   → Enter drag state
   
3. User drags mouse
   → Calculate delta: current mouse - initial mouse
   → Convert delta pixels to time: deltaTime = deltaPixels / zoom
   → Calculate new trim: newTrim = initialTrim + deltaTime
   → Constrain trim (min duration, max trim)
   → Round to frame boundary
   → Update clip state
   → Trigger redraw
   → Update preview (seek to new trim point)
   
4. User releases mouse
   → Exit drag state
   → Add trim operation to undo stack
   → Reset cursor
```

### Trim Calculations

```typescript
class TrimHandler {
  private initialMouseX: number;
  private initialTrimValue: number;
  private draggedHandle: 'start' | 'end' | null;
  
  onMouseDown(clip: TimelineClip, handle: 'start' | 'end', mouseX: number) {
    this.draggedHandle = handle;
    this.initialMouseX = mouseX;
    this.initialTrimValue = handle === 'start' ? clip.trimIn : clip.trimOut;
  }
  
  onMouseMove(mouseX: number, zoom: number, fps: number) {
    const deltaPixels = mouseX - this.initialMouseX;
    const deltaTime = deltaPixels / zoom;
    
    let newTrim = this.initialTrimValue + 
                  (this.draggedHandle === 'start' ? deltaTime : -deltaTime);
    
    // Constrain trim
    newTrim = Math.max(0, newTrim);
    newTrim = Math.min(clip.originalDuration - MIN_DURATION, newTrim);
    
    // Snap to frame
    newTrim = Math.round(newTrim * fps) / fps;
    
    // Update clip
    if (this.draggedHandle === 'start') {
      updateClipTrimIn(clip.id, newTrim);
    } else {
      updateClipTrimOut(clip.id, newTrim);
    }
    
    // Update preview
    const previewTime = this.draggedHandle === 'start' ? 
                        clip.trimIn : 
                        clip.originalDuration - clip.trimOut;
    seekPreview(clip.mediaId, previewTime);
  }
}
```

---

## Dependencies & Blockers

### Dependencies
- **Epic 3:** Timeline (clip rendering, selection)
- **Epic 4:** Video Preview (visual feedback during trim)

### Enables
- **Epic 6:** Video Export (exports trimmed clips)
- More precise editing workflows

---

## Risks & Mitigation

### Risk 1: Performance During Drag
**Impact:** MEDIUM - Laggy trim interaction  
**Probability:** LOW  
**Mitigation:**
- Throttle preview updates (30 FPS sufficient)
- Optimize canvas redraw (dirty rectangles)
- Defer heavy operations until drag ends

**Contingency:** Update preview only on release, not during drag

---

### Risk 2: Frame Accuracy Errors
**Impact:** MEDIUM - Frames skipped or duplicated  
**Probability:** MEDIUM  
**Mitigation:**
- Always round to frame boundaries
- Test with multiple frame rates (24, 30, 60 fps)
- Validate trim values before export

**Contingency:** Document "best effort" frame accuracy for VFR

---

## Definition of Done

- [ ] Trim handles visible on selected clips
- [ ] Drag handles updates trim values
- [ ] Preview updates during trim
- [ ] Frame-accurate trimming
- [ ] Minimum duration enforced (0.1s)
- [ ] Undo/redo works
- [ ] Trim data persists
- [ ] Export respects trims

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.5

