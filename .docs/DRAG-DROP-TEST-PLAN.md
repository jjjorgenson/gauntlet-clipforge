# Drag & Drop Testing Plan

## Quick Start Test

### Prerequisites
```bash
npm run dev
```

### Basic Test (30 seconds)
1. Click "Import Video" button
2. Select any video file(s)
3. Wait for thumbnail generation
4. **Drag** a video thumbnail from Media Library
5. **Drop** it onto the Timeline area
6. ✅ **PASS**: Clip appears on timeline with proper thumbnail
7. ❌ **FAIL**: Nothing happens, error in console, or clip doesn't appear

---

## Comprehensive Test Suite

### Test 1: Media Library Import
**Expected behavior**: Videos appear with proper thumbnails

- [ ] Click "Import Video" or use Ctrl+I
- [ ] Select 2-3 video files
- [ ] Verify thumbnails generate (may take a few seconds)
- [ ] Verify 16:9 aspect ratio maintained
- [ ] Verify file metadata shows (resolution, fps, codec)
- [ ] Verify hover effect shows play button overlay
- [ ] Verify selection ring appears when clicked

### Test 2: Drag Feedback
**Expected behavior**: Clear visual feedback during drag

- [ ] Mouse over video thumbnail → cursor changes to `grab` (open hand)
- [ ] Click and hold → cursor changes to `grabbing` (closed hand)
- [ ] Start dragging → thumbnail follows cursor with blue tint
- [ ] Drag over timeline → drop zone highlights with pulse animation
- [ ] Drag over different tracks → highlight follows mouse
- [ ] Release → clip appears at drop location

### Test 3: Timeline Empty State
**Expected behavior**: Helpful onboarding for new users

- [ ] Open app for first time (or clear all clips)
- [ ] Timeline shows "Drop clips here to start editing" message
- [ ] Message includes helpful tips (drag, trim, delete)
- [ ] Message disappears when dragging starts
- [ ] Message reappears if all clips removed

### Test 4: Drop Zone Visualization
**Expected behavior**: Clear target indication

- [ ] Drag clip over timeline
- [ ] Blue pulsing highlight appears on target track
- [ ] Vertical blue line shows exact drop position
- [ ] Arrow indicator at top of line
- [ ] Glow effect around drop zone
- [ ] Drop zone updates as mouse moves
- [ ] All visual indicators disappear after drop

### Test 5: Single Clip Drop
**Expected behavior**: Clip is added to timeline

- [ ] Drag clip from media library
- [ ] Drop on timeline at 0:00
- [ ] Clip appears with correct thumbnail
- [ ] Clip duration matches source video
- [ ] Clip is automatically selected (blue outline)
- [ ] Console logs: "Clip added to timeline: {track, startTime, duration}"

### Test 6: Multiple Clip Drop
**Expected behavior**: Multiple clips can be arranged

- [ ] Drop first clip at 0:00
- [ ] Drop second clip at 0:05
- [ ] Drop third clip at 0:10
- [ ] All clips visible on timeline
- [ ] Clips maintain proper spacing
- [ ] Each clip shows correct thumbnail
- [ ] Timeline duration extends to cover all clips

### Test 7: Collision Detection
**Expected behavior**: Clips don't overlap

- [ ] Drop clip at 0:00 (duration 5s)
- [ ] Try to drop another clip at 0:03 (should cause collision)
- [ ] Second clip should snap to 0:05 (after first clip)
- [ ] Both clips visible without overlap
- [ ] Console may show collision adjustment

### Test 8: Multi-Track Layout
**Expected behavior**: Clips can be on different tracks

- [ ] Drop clip on Track 1
- [ ] Use "Add Track" button to create Track 2
- [ ] Drop clip on Track 2
- [ ] Both clips visible on different tracks
- [ ] Tracks labeled correctly
- [ ] Track headers show track names

### Test 9: Clip Selection
**Expected behavior**: Clips can be selected and deselected

- [ ] Click on clip → blue selection ring appears
- [ ] Click elsewhere → selection clears
- [ ] Ctrl+Click on multiple clips → all selected
- [ ] Delete key → selected clips removed
- [ ] Timeline empty state reappears if all clips deleted

### Test 10: Keyboard Navigation
**Expected behavior**: Full keyboard support

- [ ] Tab key moves focus through Media Library items
- [ ] Each item shows blue focus ring when focused
- [ ] Space/Enter on focused item selects it
- [ ] Tab to timeline area
- [ ] Arrow keys navigate clips (if implemented)
- [ ] Delete key removes selected clips

---

## Performance Tests

### Test 11: Large Media Library
**Expected behavior**: Smooth performance with many items

- [ ] Import 20+ video files
- [ ] Scroll through media library → smooth 60fps
- [ ] Drag any clip → no frame drops
- [ ] Drop on timeline → instant response

### Test 12: Drag Performance
**Expected behavior**: Buttery smooth drag operations

- [ ] Start drag → immediate cursor change (< 16ms)
- [ ] Drag across screen → drop zone updates smoothly (60fps)
- [ ] No stuttering or lag during drag
- [ ] Drop → clip appears immediately (< 100ms)

### Test 13: Multiple Tracks & Clips
**Expected behavior**: Complex timeline still performs well

- [ ] Create 5 tracks
- [ ] Add 10 clips per track (50 total)
- [ ] Drag new clip over timeline → smooth drop zone
- [ ] Zoom in/out → smooth scaling
- [ ] Pan timeline → smooth scrolling

---

## Edge Case Tests

### Test 14: Invalid Drag Source
**Expected behavior**: Graceful handling of non-video drags

- [ ] Try dragging text file from desktop onto timeline
- [ ] Should show "not allowed" cursor
- [ ] No error in console
- [ ] Timeline unchanged

### Test 15: Boundary Drop Positions
**Expected behavior**: Clips can be placed at edges

- [ ] Drop clip at very start (0:00) → works
- [ ] Drop clip at far right of timeline → works
- [ ] Drop clip on track header area → rejected (no drop)
- [ ] Drop outside timeline entirely → rejected

### Test 16: Rapid Operations
**Expected behavior**: No race conditions or crashes

- [ ] Quickly drag-drop 5 clips in succession
- [ ] All clips appear correctly
- [ ] No duplicate clips
- [ ] No missing clips
- [ ] Timeline state consistent

### Test 17: Zero Duration Clips
**Expected behavior**: Minimal duration enforced

- [ ] Drop clip with metadata.duration = 0
- [ ] Should default to 5 seconds (see Timeline.tsx line 394)
- [ ] Clip visible and playable

---

## Visual Regression Tests

### Test 18: Empty State Styling
- [ ] Empty state centered in timeline
- [ ] Semi-transparent dark panel
- [ ] Dashed border visible
- [ ] Icon, title, description properly formatted
- [ ] Tips list aligned correctly

### Test 19: Drop Zone Styling
- [ ] Blue color matches design (#3b82f6)
- [ ] Pulse animation smooth and subtle
- [ ] Glow effect visible but not overwhelming
- [ ] Indicator line bright and clear
- [ ] Arrow at top of line

### Test 20: Media Item Styling
- [ ] Thumbnails fill 16:9 containers
- [ ] Selection ring visible and blue
- [ ] Hover state shows play button overlay
- [ ] Drag cursor appears on hover
- [ ] Focus ring visible when tabbed to

---

## Accessibility Tests

### Test 21: Screen Reader
**Expected behavior**: All actions announced

- [ ] Screen reader announces "Import Video" button
- [ ] Announces media item count
- [ ] Announces selection changes
- [ ] Announces clip added to timeline
- [ ] Announces empty state message

### Test 22: Keyboard Only
**Expected behavior**: Fully functional without mouse

- [ ] Tab to Import button, press Enter
- [ ] Tab through media items
- [ ] Space to select item
- [ ] (Future: Keyboard shortcut to add to timeline)
- [ ] Tab to timeline clips
- [ ] Delete key removes clips

### Test 23: High Contrast Mode
**Expected behavior**: Visible in high contrast

- [ ] Enable Windows High Contrast mode
- [ ] All borders visible
- [ ] Focus indicators clear
- [ ] Drop zone visible
- [ ] Text readable

---

## Browser/Platform Tests

### Test 24: Electron (Primary)
- [ ] Windows 10/11
- [ ] macOS (if available)
- [ ] Linux (if available)
- [ ] All drag-drop features work
- [ ] Performance is smooth

### Test 25: Different Resolutions
- [ ] 1920x1080 (Full HD) → Perfect
- [ ] 1366x768 (Laptop) → Usable
- [ ] 1280x720 (Minimum) → Functional
- [ ] 2560x1440 (QHD) → Scales well
- [ ] 3840x2160 (4K) → Scales well

---

## Error Scenarios

### Test 26: Missing Metadata
**Expected behavior**: Defaults applied

- [ ] Drop clip with incomplete metadata
- [ ] Should use defaults (1920x1080, 30fps, h264)
- [ ] Clip still appears and functions

### Test 27: File Not Found
**Expected behavior**: Graceful error handling

- [ ] Import clip, then delete source file
- [ ] Try to drop on timeline
- [ ] Should show error or placeholder
- [ ] App doesn't crash

### Test 28: Corrupted Thumbnail
**Expected behavior**: Fallback display

- [ ] Clip with failed thumbnail generation
- [ ] Should show codec badge instead
- [ ] Still draggable and droppable

---

## Console Output Verification

### Expected Console Messages (Normal Operation)
```
✓ "Clip added to timeline: { track: 'Track 1', startTime: 0, duration: 5 }"
✓ IPC success messages from media import
✓ Thumbnail generation progress
```

### Unexpected Console Messages (Investigate)
```
✗ "No clip data found in drag event"
✗ "Failed to parse clip data"
✗ Any TypeScript errors
✗ React warnings about keys or refs
```

---

## Regression Checklist

After any changes to drag-drop code, verify:

- [ ] Import still works
- [ ] Thumbnails still generate
- [ ] Drag cursor changes
- [ ] Drop zone appears
- [ ] Clips appear on timeline
- [ ] Selection works
- [ ] Delete works
- [ ] No console errors
- [ ] Performance maintained
- [ ] Keyboard navigation works

---

## Known Issues

### TypeScript Warnings (Non-Critical)
```
Line 10:32: Cannot find module './TimelineCanvas'
Line 11:27: Cannot find module './TimeRuler'
```
**Status**: False positive, files exist and import correctly at runtime. TypeScript cache issue.

### To Be Implemented
- [ ] Drag to reorder clips within timeline
- [ ] Drag to move clips between tracks
- [ ] Drag trim handles to adjust clip duration
- [ ] Undo/redo for clip operations
- [ ] Snap to grid option

---

## Success Criteria

### Minimum Viable (Must Pass)
- ✅ Can import videos
- ✅ Can drag from media library
- ✅ Can drop onto timeline
- ✅ Clips appear correctly
- ✅ No crashes or errors

### Full Feature Set (Should Pass)
- ✅ All visual feedback works
- ✅ Collision detection works
- ✅ Multiple clips/tracks work
- ✅ Keyboard navigation works
- ✅ Performance is smooth

### Polish (Nice to Have)
- ✅ Animations are smooth
- ✅ Empty states are helpful
- ✅ Accessibility is complete
- ✅ All edge cases handled

---

## Reporting Issues

If any test fails, please report:
1. **Test number and name**
2. **Expected behavior**
3. **Actual behavior**
4. **Console errors** (if any)
5. **Steps to reproduce**
6. **Screenshot or video** (if visual issue)
7. **System info** (OS, screen resolution)

---

## Quick Smoke Test (2 minutes)

For rapid verification after changes:

1. ✅ `npm run dev`
2. ✅ Import video
3. ✅ Drag to timeline
4. ✅ Clip appears
5. ✅ Delete clip
6. ✅ No console errors

If all pass → Drag-drop functionality is working! 🎉

