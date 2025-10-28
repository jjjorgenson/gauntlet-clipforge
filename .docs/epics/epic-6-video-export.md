# Epic 6: Video Export

**Epic ID:** CLIP-EPIC-006  
**Priority:** P0 (Must-Have for MVP)  
**Status:** Ready for Development  
**Timeline:** Phase 2-3 (Tuesday PM - Wednesday AM)  
**Estimated Effort:** 8-10 hours  
**Dependencies:** Epic 1-5 (All prior features needed for export)

---

## Epic Goal

Render the timeline composition to a single MP4 video file using FFmpeg, providing progress tracking, quality presets, and hardware acceleration for efficient export of the edited video project.

**Value Statement:** Export is the final deliverable. Without it, ClipForge is useless - all editing must result in a shareable video file.

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.6)

**Functional Requirements - Must Pass:**
- ✅ Export dialog with:
  - Output filename
  - Save location (file picker)
  - Quality preset: 720p, 1080p, 4K (P1 for presets)
  - Format: MP4 (H.264 codec)
- ✅ Progress bar showing export status
- ✅ Estimated time remaining
- ✅ Success notification with "Open File" button
- ✅ Cancel export option
- ✅ User clicks "Export" → Dialog opens
- ✅ User selects location + filename → Export starts
- ✅ Progress bar updates during export
- ✅ Export completes → Notification shows → File plays in VLC/QuickTime
- ✅ Exported file matches timeline composition

**Non-Functional Requirements - Must Pass:**
- ✅ Export speed: Real-time or faster (1 min video → <2 min export)
- ✅ CPU usage: Use FFmpeg hardware acceleration if available
- ✅ File size: Efficient encoding (1 min 1080p → ~50MB)
- ✅ Error handling: Graceful failure with error message

---

## User Stories

### Story 1: Export Dialog UI

**Acceptance Criteria:**
- [ ] "Export Video" button in toolbar (prominent)
- [ ] File > Export Video menu item (Cmd/Ctrl+E)
- [ ] Export dialog modal opens
- [ ] Dialog fields:
  - [ ] Filename input (default: "ClipForge Export.mp4")
  - [ ] Browse button (save location picker)
  - [ ] Quality dropdown: 720p, 1080p, Source Quality
  - [ ] Format: MP4 (fixed for MVP, dropdown for P1)
  - [ ] Codec: H.264 (info label)
  - [ ] Estimated file size display
- [ ] Cancel and Export buttons
- [ ] Export button disabled until location selected

---

### Story 2: FFmpeg Export Process

**Acceptance Criteria:**
- [ ] FFmpeg binary bundled with app
- [ ] Export runs in main process (Node.js)
- [ ] FFmpeg command construction:
  - [ ] Concatenate clips respecting timeline order
  - [ ] Apply trim points (trimIn/trimOut)
  - [ ] Scale to target resolution
  - [ ] Encode to H.264/AAC
- [ ] Progress tracking via FFmpeg stderr parsing
- [ ] Hardware acceleration flags (if available):
  - [ ] macOS: `-hwaccel videotoolbox`
  - [ ] Windows: `-hwaccel d3d11va`
  - [ ] Linux: `-hwaccel vaapi` or NVENC

**FFmpeg Command Example:**
```bash
ffmpeg -i clip1.mp4 -ss 2.5 -t 10 -i clip2.mp4 -ss 0 -t 15 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 23 -preset medium \
  -c:a aac -b:a 192k -movflags +faststart output.mp4
```

---

### Story 3: Export Progress & Cancellation

**Acceptance Criteria:**
- [ ] Progress dialog replaces export dialog
- [ ] Progress bar: 0-100%
- [ ] Status text: "Exporting... 45%"
- [ ] Time remaining estimate: "~2 minutes remaining"
- [ ] Current operation: "Encoding video..."
- [ ] Cancel button functional
- [ ] Cancel kills FFmpeg process gracefully
- [ ] Cleanup temp files on cancel
- [ ] Progress updates every 500ms

---

### Story 4: Multi-Clip & Multi-Track Export

**Acceptance Criteria:**
- [ ] Multiple clips concatenated in sequence
- [ ] Trim points applied per clip
- [ ] Track 2 overlaid on Track 1 (if multi-track)
- [ ] Overlay positioning (P1: configurable, MVP: corner)
- [ ] Audio mixed from all tracks
- [ ] Muted tracks excluded from export

---

### Story 5: Export Completion & Validation

**Acceptance Criteria:**
- [ ] Export completes → Success notification
- [ ] Notification shows:
  - [ ] "Export Complete!"
  - [ ] File size
  - [ ] Export duration
  - [ ] "Open File" button
  - [ ] "Reveal in Finder/Explorer" button
- [ ] Open File → Plays in default video player
- [ ] Validation checks:
  - [ ] File exists
  - [ ] File size > 0
  - [ ] Duration matches timeline (±1 second)
  - [ ] Playable in VLC/QuickTime
- [ ] Error handling:
  - [ ] FFmpeg failure → Error message with details
  - [ ] Disk full → Error: "Insufficient disk space"
  - [ ] Permission denied → Error: "Cannot write to location"

---

## Technical Architecture

### Export Pipeline

```
1. User clicks Export
2. Open export dialog
3. User selects location/settings
4. Build FFmpeg command:
   - Get all timeline clips
   - For each clip:
     * Input file path
     * Trim parameters (-ss, -t)
   - Concat filter
   - Encode settings
5. Spawn FFmpeg process (main process)
6. Parse progress from stderr
7. Send progress to renderer via IPC
8. Renderer updates progress UI
9. FFmpeg completes
10. Validate output file
11. Show success notification
```

### FFmpeg Command Builder

```typescript
function buildExportCommand(
  clips: TimelineClip[],
  outputPath: string,
  settings: ExportSettings
): string[] {
  const inputs: string[] = [];
  const filters: string[] = [];
  
  // Add inputs with trim
  clips.forEach((clip, i) => {
    const media = getMediaItem(clip.mediaId);
    inputs.push(
      `-ss`, clip.trimIn.toString(),
      `-t`, clip.duration.toString(),
      `-i`, media.filepath
    );
  });
  
  // Concat filter
  const concatInputs = clips.map((_, i) => `[${i}:v][${i}:a]`).join('');
  filters.push(
    `${concatInputs}concat=n=${clips.length}:v=1:a=1[outv][outa]`
  );
  
  // Build command
  return [
    'ffmpeg',
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[outv]',
    '-map', '[outa]',
    '-c:v', 'libx264',
    '-crf', '23',
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    outputPath
  ];
}
```

---

## Definition of Done

- [ ] Export dialog functional
- [ ] FFmpeg exports timeline correctly
- [ ] Progress bar updates during export
- [ ] Multi-clip concatenation works
- [ ] Trim points respected
- [ ] Export completes in <2x realtime
- [ ] Output file playable
- [ ] Cancel export works
- [ ] Error handling comprehensive

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.6

