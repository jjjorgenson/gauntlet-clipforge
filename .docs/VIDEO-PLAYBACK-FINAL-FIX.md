# Video Playback - Final Fix Complete ✅

## Problem Summary
Video would load the first frame but not play. When pressing play, `isPlaying` would rapidly toggle between `true` and `false`, creating an infinite render loop and preventing playback.

---

## Root Causes Found

### 1. ❌ **`seek()` was auto-pausing** (timelineStore.ts:286)
```typescript
// BEFORE (WRONG):
seek: (time: number) => {
  set({ 
    currentTime: Math.max(0, Math.min(time, get().duration)),
    isPlaying: false  // ❌ This was causing the toggle loop!
  });
}
```

**Problem**: Every time the video naturally updated its time during playback, `VideoPreview.handleTimeUpdate()` would call `seek()`, which would set `isPlaying: false`, causing the video to pause, creating an infinite toggle loop.

**Fix**: Removed `isPlaying: false` from `seek()`. Seeking should only update `currentTime`, not control playback state.

```typescript
// AFTER (CORRECT):
seek: (time: number) => {
  set({ 
    currentTime: Math.max(0, Math.min(time, get().duration))
    // NOTE: Don't set isPlaying: false here! This causes infinite toggle loops
    // when the video naturally updates its time during playback
  });
}
```

---

### 2. ❌ **`usePlayback` RAF loop was fighting the video** (usePlayback.ts:82-115)
```typescript
// BEFORE (WRONG):
useEffect(() => {
  if (isPlaying) {
    const updatePlayback = (timestamp: number) => {
      // ... manual time calculation ...
      timeline.pause();  // Line 96
      timeline.seek(newTime);  // Line 99 - called 60 times per second!
      animationFrameRef.current = requestAnimationFrame(updatePlayback);
    };
    animationFrameRef.current = requestAnimationFrame(updatePlayback);
  }
}, [isPlaying, currentTime, duration, timeline]);
```

**Problem**: The `usePlayback` hook had its own `requestAnimationFrame` loop that was manually driving timeline time forward. This created **two competing time sources**:
1. The video element's natural playback
2. The RAF loop manually updating `currentTime`

They were fighting each other, with the RAF loop calling `timeline.pause()` and `timeline.seek()` 60 times per second!

**Fix**: Disabled the RAF loop. The video element is now the master clock, syncing time via `VideoPreview.handleTimeUpdate()`.

```typescript
// AFTER (CORRECT):
// Playback loop effect - DISABLED
// NOTE: This RAF loop was driving timeline time forward manually,
// but it conflicts with the video element's natural playback.
// The video element is now the master clock via VideoPreview.handleTimeUpdate()
useEffect(() => {
  // Clean up any existing RAF
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);
```

---

### 3. ✅ **Video event handlers removed** (VideoPlayer.tsx:200-201)
```typescript
// BEFORE (WRONG):
<video
  onPlay={handlePlay}   // ❌ Creating feedback loop
  onPause={handlePause} // ❌ Creating feedback loop
  ...
/>
```

**Problem**: The video element's `onPlay` and `onPause` events were syncing state back to the store, creating a bidirectional feedback loop with the play/pause `useEffect`.

**Fix**: Removed these event handlers. The store is the **single source of truth** for play/pause state. Flow is now unidirectional:

```
User clicks play → store.play() → isPlaying: true → VideoPlayer useEffect → video.play() → DONE
```

```typescript
// AFTER (CORRECT):
<video
  onTimeUpdate={handleTimeUpdate}  // ✅ Only for time sync
  onEnded={handleEnded}            // ✅ Only for natural end
  ...
/>
```

---

## Architecture Changes

### Before (Broken)
```
┌─────────────────┐
│  Play Button    │
└────────┬────────┘
         │
         ▼
    ┌────────┐        ┌──────────────────┐
    │ Store  │◄───────│ usePlayback RAF  │ ❌ Fighting!
    └───┬────┘        │ (60fps updates)  │
        │             └──────────────────┘
        │ isPlaying
        ▼
    ┌──────────────┐
    │ VideoPlayer  │
    │   <video>    │
    └──────┬───────┘
           │ onPlay/onPause
           └──────────► Store  ❌ Feedback loop!
```

### After (Fixed)
```
┌─────────────────┐
│  Play Button    │
└────────┬────────┘
         │
         ▼
    ┌────────┐ (Single Source of Truth)
    │ Store  │
    └───┬────┘
        │ isPlaying
        ▼
    ┌──────────────┐
    │ VideoPlayer  │
    │   <video>    │
    └──────┬───────┘
           │ onTimeUpdate only
           └──────────► VideoPreview.handleTimeUpdate()
                              │
                              └──► seek(time) ✅ (doesn't pause)
```

---

## Key Principles

1. **Store is the single source of truth** for `isPlaying`
2. **Video element is the master clock** for `currentTime`
3. **Unidirectional data flow**: Store → VideoPlayer → Time updates → Store (via seek)
4. **`seek()` only updates time**, never touches playback state
5. **No RAF loop needed** when video element handles playback

---

## Testing

✅ **Working flow:**
1. Import video
2. Drag to timeline
3. Press play ▶️
4. Video plays smoothly
5. `currentTime` updates naturally
6. Timeline playhead moves
7. No infinite loops
8. No rapid `isPlaying` toggles

---

## Files Modified

1. `src/renderer/store/timelineStore.ts` - Removed `isPlaying: false` from `seek()`
2. `src/renderer/hooks/usePlayback.ts` - Disabled RAF loop
3. `src/renderer/components/preview/VideoPlayer.tsx` - Removed `onPlay`/`onPause` handlers

---

## Debugging Tools Added

Added `console.trace()` to store methods for debugging:
- `play()` - Shows who called play
- `pause()` - Shows who called pause  
- `seek()` - Shows who called seek

These can be removed later for production.

---

## Status: ✅ COMPLETE

Video playback is now fully functional with:
- ✅ Smooth playback
- ✅ No infinite loops
- ✅ Proper time synchronization
- ✅ Single source of truth architecture
- ✅ Clean unidirectional data flow

