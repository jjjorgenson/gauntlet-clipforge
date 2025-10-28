# Epic 10: Additional Editing Features

**Epic ID:** CLIP-EPIC-010  
**Priority:** P2 (Nice-to-Have)  
**Status:** Ready for Development  
**Timeline:** Phase 4 (Post-MVP, if time permits)  
**Estimated Effort:** 10-15 hours  
**Dependencies:** Epic 1-6 (All core features)

---

## Epic Goal

Implement quality-of-life editing features including undo/redo, copy/paste, clip duplication, ripple delete, snapping controls, markers, audio fades, transitions, and text overlays to enhance the editing experience and workflow efficiency.

**Value Statement:** These features elevate ClipForge from functional to professional-grade, providing the polish and efficiency that experienced editors expect.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.10)

**Functional Requirements - Must Pass:**
- ✅ Undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- ✅ Copy/paste clips (Cmd/Ctrl+C/V)
- ✅ Duplicate clip
- ✅ Ripple delete (remove clip and close gap)
- ✅ Snapping toggle (snap to playhead, clip edges, markers)
- ✅ Markers/bookmarks on timeline
- ✅ Audio fade in/out
- ✅ Transitions between clips (dissolve, fade to black)
- ✅ Text overlays (simple titles)
- ✅ User presses Cmd+Z → Last action undoes
- ✅ User enables snapping → Clips snap to grid
- ✅ User adds transition → Smooth fade between clips

---

## User Stories

### Story 1: Undo/Redo System (P2)

**Acceptance Criteria:**
- [ ] Cmd/Ctrl+Z → Undo last action
- [ ] Cmd/Ctrl+Shift+Z → Redo undone action
- [ ] Edit > Undo/Redo menu items
- [ ] Undo stack: Track all timeline modifications
- [ ] Supported operations:
  - [ ] Add/remove clips
  - [ ] Move clips
  - [ ] Trim clips
  - [ ] Split clips
  - [ ] Delete clips
- [ ] Undo stack size: 50 operations (configurable)
- [ ] Clear undo history on new project

**State Management:**
```typescript
interface UndoManager {
  undoStack: TimelineState[];
  redoStack: TimelineState[];
  maxStackSize: number;
  
  push(state: TimelineState): void;
  undo(): TimelineState | null;
  redo(): TimelineState | null;
  clear(): void;
}
```

---

### Story 2: Copy/Paste & Duplicate (P2)

**Acceptance Criteria:**
- [ ] Select clip + Cmd/Ctrl+C → Copy to clipboard
- [ ] Cmd/Ctrl+V → Paste at playhead position
- [ ] Paste preserves trim points
- [ ] Paste creates new clip instance (unique ID)
- [ ] Duplicate: Right-click menu or Cmd/Ctrl+D
- [ ] Duplicate places copy immediately after original
- [ ] Multi-select copy/paste supported

---

### Story 3: Ripple Delete (P2)

**Acceptance Criteria:**
- [ ] Delete clip + Shift → Ripple delete
- [ ] Removes clip and closes gap
- [ ] All clips after deleted clip shift left
- [ ] Timeline duration shortens
- [ ] Maintains clip synchronization
- [ ] Undo restores original layout

---

### Story 4: Timeline Markers (P2)

**Acceptance Criteria:**
- [ ] Press M → Add marker at playhead
- [ ] Marker appears as vertical line/flag
- [ ] Marker label (optional text)
- [ ] Markers snap playhead when scrubbing
- [ ] Delete marker: Select + Delete
- [ ] Marker list view (P2)
- [ ] Jump to marker: Shift+M (next), Shift+Option+M (prev)

---

### Story 5: Audio Fade In/Out (P2)

**Acceptance Criteria:**
- [ ] Right-click clip → "Add Fade In"
- [ ] Right-click clip → "Add Fade Out"
- [ ] Fade duration: 0.5-2 seconds (adjustable)
- [ ] Visual indicator: Curved line at clip edge
- [ ] Fade applied during playback
- [ ] Fade applied during export

**FFmpeg Implementation:**
```bash
# Fade in (2s)
-af "afade=t=in:st=0:d=2"

# Fade out (2s from end)
-af "afade=t=out:st=8:d=2"
```

---

### Story 6: Video Transitions (P2)

**Acceptance Criteria:**
- [ ] Drag transition from effects panel to clip boundary
- [ ] Supported transitions:
  - [ ] Dissolve/Crossfade
  - [ ] Fade to Black
  - [ ] Fade to White
  - [ ] Dip to Black (fade out then in)
- [ ] Transition duration: 0.5-2 seconds
- [ ] Visual indicator between clips
- [ ] Preview shows transition
- [ ] Export applies transition

**FFmpeg Transition:**
```bash
# Crossfade between clips
-filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=9[v]"
```

---

### Story 7: Text Overlays (P2)

**Acceptance Criteria:**
- [ ] "Add Text" button in toolbar
- [ ] Text overlay editor:
  - [ ] Text input field
  - [ ] Font selection (5-10 common fonts)
  - [ ] Font size (12-72pt)
  - [ ] Color picker
  - [ ] Position: Top, Center, Bottom, Custom
  - [ ] Background: None, Solid, Semi-transparent
- [ ] Text appears on timeline as overlay clip (Track 2+)
- [ ] Duration adjustable
- [ ] Preview shows text overlay
- [ ] Export burns in text

**FFmpeg Text Overlay:**
```bash
-vf "drawtext=text='Hello World':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2"
```

---

### Story 8: Snapping Controls (Covered in Epic 3 Story 11)

**Note:** Snapping functionality is already detailed in Epic 3: Timeline Editor - Story 11.

**Quick Reference:**
- [ ] Magnet icon toggle button
- [ ] Snap to playhead, clip edges, markers
- [ ] Snap tolerance: 5 pixels
- [ ] Temporary disable: Hold Cmd/Ctrl

---

## Technical Architecture

### Undo/Redo Implementation

```typescript
class UndoManager {
  private undoStack: TimelineState[] = [];
  private redoStack: TimelineState[] = [];
  private maxSize = 50;
  
  saveState(state: TimelineState) {
    this.undoStack.push(cloneDeep(state));
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }
  
  undo(currentState: TimelineState): TimelineState | null {
    if (this.undoStack.length === 0) return null;
    
    this.redoStack.push(currentState);
    return this.undoStack.pop()!;
  }
  
  redo(): TimelineState | null {
    if (this.redoStack.length === 0) return null;
    
    const state = this.redoStack.pop()!;
    this.undoStack.push(state);
    return state;
  }
}
```

---

## Definition of Done

### P2 Features (Optional for MVP)
- [ ] Undo/redo functional for major operations
- [ ] Copy/paste works
- [ ] Ripple delete closes gaps
- [ ] Markers can be added/removed
- [ ] Audio fades applied in export
- [ ] At least 2 transitions available
- [ ] Text overlays can be added
- [ ] All features documented

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.10

