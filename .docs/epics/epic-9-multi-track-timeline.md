# Epic 9: Multi-Track Timeline

**Epic ID:** CLIP-EPIC-009  
**Priority:** P1 (Important for Final Submission)  
**Status:** Ready for Development  
**Timeline:** Phase 3 (Wednesday AM)  
**Estimated Effort:** Covered in Epic 3  
**Dependencies:** Epic 3 (Timeline Editor)

---

## Epic Goal

**Note:** Multi-track timeline functionality is already covered in **Epic 3: Timeline Editor, Story 9**. This epic serves as a reference placeholder to match PRD section 3.9.

See: `.docs/epics/epic-3-timeline-editor.md` - Story 9: Multi-Track Timeline

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.9)

**Functional Requirements - Must Pass:**
- ✅ Timeline displays at least 2 tracks vertically:
  - Track 1: Main video
  - Track 2: Overlay (PiP, lower thirds, etc.)
- ✅ Drag clips between tracks
- ✅ Track controls:
  - Solo (show only this track)
  - Mute (disable audio)
  - Lock (prevent edits)
- ✅ Compositing order: Top tracks overlay bottom tracks
- ✅ Opacity control per clip (P2)
- ✅ User drags webcam clip to Track 2 → Appears as overlay
- ✅ Overlay clip visible during preview
- ✅ Export includes both tracks composited
- ✅ User can reorder clips across tracks

**Non-Functional Requirements - Must Pass:**
- ✅ Rendering performance: Maintain 30+ FPS with 2 tracks
- ✅ Compositing latency: <100ms to update preview

---

## Implementation Reference

All acceptance criteria and implementation details are in:
**Epic 3: Timeline Editor - Story 9: Multi-Track Timeline**

Key features implemented:
- 2+ vertical tracks
- Track controls (mute, lock, solo, visibility)
- Drag clips between tracks
- Track compositing order
- Track-specific clip rendering

---

## Change Log

- **v1.0 (2025-10-27):** Reference epic pointing to Epic 3 Story 9

