/**
 * Timeline Component - Main Container
 * 
 * Main timeline container that manages canvas dimensions and wraps all timeline sub-components.
 * Implements TimelineComponentProps.Timeline interface.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../store/timelineStore';
import { TimelineCanvas } from './TimelineCanvas';
import { TimeRuler } from './TimeRuler';
import { Clip, Track } from '@types';

export const Timeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'clip' | 'trim-left' | 'trim-right' | 'playhead' | null;
    dragClipId: string | null;
    dragStartX: number;
    dragStartTime: number;
    dragOffset: number;
  }>({
    isDragging: false,
    dragType: null,
    dragClipId: null,
    dragStartX: 0,
    dragStartTime: 0,
    dragOffset: 0
  });
  
  // Timeline store state
  const {
    tracks,
    duration,
    currentTime,
    zoom,
    scrollLeft,
    selectedClipIds,
    setZoom,
    setScrollLeft,
    seek,
    moveClip,
    trimClip,
    selectClip,
    clearSelection,
    deleteSelectedClips
  } = useTimelineStore();

  // Timeline constants
  const PIXELS_PER_SECOND_BASE = 100;
  const TRACK_HEIGHT = 60;
  const TRACK_MARGIN = 4;
  const TRIM_HANDLE_WIDTH = 8;

  // Utility functions
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;
  
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  const pixelsToTime = useCallback((pixels: number): number => {
    return (pixels + scrollLeft) / pixelsPerSecond;
  }, [pixelsPerSecond, scrollLeft]);

  // Find clip at position
  const findClipAtPosition = useCallback((x: number, y: number): { clip: Clip; track: Track; hitRegion: 'body' | 'trim-left' | 'trim-right' } | null => {
    for (const track of tracks) {
      const trackIndex = tracks.indexOf(track);
      const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
      
      if (y >= trackY && y <= trackY + TRACK_HEIGHT) {
        for (const clip of track.clips) {
          const clipX = timeToPixels(clip.startTime);
          const clipWidth = timeToPixels(clip.endTime) - clipX;
          const clipY = trackY + 4; // 4px margin
          
          if (x >= clipX && x <= clipX + clipWidth && y >= clipY && y <= clipY + (TRACK_HEIGHT - 8)) {
            // Determine hit region
            if (x <= clipX + TRIM_HANDLE_WIDTH) {
              return { clip, track, hitRegion: 'trim-left' };
            } else if (x >= clipX + clipWidth - TRIM_HANDLE_WIDTH) {
              return { clip, track, hitRegion: 'trim-right' };
            } else {
              return { clip, track, hitRegion: 'body' };
            }
          }
        }
      }
    }
    return null;
  }, [tracks, timeToPixels]);

  // Snap to nearby clips
  const snapToClips = useCallback((time: number, excludeClipId?: string): number => {
    const snapThreshold = 0.1; // 100ms snap threshold
    let snapTime = time;
    
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.id === excludeClipId) continue;
        
        // Snap to clip start/end
        if (Math.abs(time - clip.startTime) < snapThreshold) {
          snapTime = clip.startTime;
        } else if (Math.abs(time - clip.endTime) < snapThreshold) {
          snapTime = clip.endTime;
        }
      }
    }
    
    return snapTime;
  }, [tracks]);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Listen for resize events
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Handle wheel events for zoom and scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + wheel
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + zoomDelta);
    } else {
      // Horizontal scroll with wheel
      const scrollDelta = e.deltaY;
      setScrollLeft(scrollLeft + scrollDelta);
    }
  };

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = pixelsToTime(x);

    // Check if clicking on playhead
    const playheadX = timeToPixels(currentTime);
    if (Math.abs(x - playheadX) < 10) {
      setDragState({
        isDragging: true,
        dragType: 'playhead',
        dragClipId: null,
        dragStartX: x,
        dragStartTime: currentTime,
        dragOffset: 0
      });
      return;
    }

    // Check if clicking on a clip
    const clipHit = findClipAtPosition(x, y);
    if (clipHit) {
      const { clip, hitRegion } = clipHit;
      
      // Select clip if not multi-selecting
      if (!e.ctrlKey && !e.metaKey) {
        selectClip(clip.id, false);
      } else {
        selectClip(clip.id, true);
      }

      // Start drag based on hit region
      let dragType: 'clip' | 'trim-left' | 'trim-right' = 'clip';
      if (hitRegion === 'trim-left') dragType = 'trim-left';
      else if (hitRegion === 'trim-right') dragType = 'trim-right';

      setDragState({
        isDragging: true,
        dragType,
        dragClipId: clip.id,
        dragStartX: x,
        dragStartTime: clip.startTime,
        dragOffset: x - timeToPixels(clip.startTime)
      });
      return;
    }

    // Clicked on empty space
    if (!e.ctrlKey && !e.metaKey) {
      clearSelection();
    }
  }, [currentTime, pixelsToTime, timeToPixels, findClipAtPosition, selectClip, clearSelection]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      dragClipId: null,
      dragStartX: 0,
      dragStartTime: 0,
      dragOffset: 0
    });
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedClipIds.length > 0) {
        deleteSelectedClips();
      }
    }
  }, [selectedClipIds, deleteSelectedClips]);

  // Global mouse events for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const time = pixelsToTime(x);

      if (dragState.dragType === 'playhead') {
        const clampedTime = Math.max(0, Math.min(time, duration));
        seek(clampedTime);
      } else if (dragState.dragClipId && dragState.dragType) {
        const clip = tracks.flatMap(t => t.clips).find(c => c.id === dragState.dragClipId);
        if (!clip) return;

        if (dragState.dragType === 'clip') {
          const newStartTime = snapToClips(time - dragState.dragOffset / pixelsPerSecond, clip.id);
          const duration = clip.endTime - clip.startTime;
          const newEndTime = newStartTime + duration;

          const targetTrack = tracks.find(t => {
            const trackIndex = tracks.indexOf(t);
            const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
            return y >= trackY && y <= trackY + TRACK_HEIGHT;
          });

          if (targetTrack && newStartTime >= 0 && newEndTime <= duration) {
            moveClip(clip.id, targetTrack.id, newStartTime);
          }
        } else if (dragState.dragType === 'trim-left') {
          const newTrimIn = Math.max(0, Math.min(time - clip.startTime, clip.trimOut - 0.1));
          const snappedTime = snapToClips(clip.startTime + newTrimIn, clip.id);
          const finalTrimIn = snappedTime - clip.startTime;
          
          if (finalTrimIn >= 0 && finalTrimIn < clip.trimOut - 0.1) {
            trimClip(clip.id, finalTrimIn, clip.trimOut);
          }
        } else if (dragState.dragType === 'trim-right') {
          const newTrimOut = Math.max(clip.trimIn + 0.1, Math.min(time - clip.startTime, clip.metadata.duration));
          const snappedTime = snapToClips(clip.startTime + newTrimOut, clip.id);
          const finalTrimOut = snappedTime - clip.startTime;
          
          if (finalTrimOut > clip.trimIn + 0.1 && finalTrimOut <= clip.metadata.duration) {
            trimClip(clip.id, clip.trimIn, finalTrimOut);
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setDragState({
        isDragging: false,
        dragType: null,
        dragClipId: null,
        dragStartX: 0,
        dragStartTime: 0,
        dragOffset: 0
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, pixelsToTime, pixelsPerSecond, snapToClips, tracks, moveClip, trimClip, seek, duration]);

  return (
    <div
      ref={containerRef}
      className={`timeline-container ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        cursor: dragState.isDragging ? 'grabbing' : 'default',
        outline: 'none'
      }}
    >
      {/* Time Ruler */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: '#2a2a2a',
          borderBottom: '1px solid #444',
          zIndex: 10
        }}
      >
        <TimeRuler
          duration={duration}
          zoom={zoom}
          scrollLeft={scrollLeft}
          currentTime={currentTime}
          onSeek={seek}
        />
      </div>

      {/* Timeline Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1a1a1a'
        }}
      >
        <TimelineCanvas
          tracks={tracks}
          currentTime={currentTime}
          zoom={zoom}
          scrollLeft={scrollLeft}
          selectedClipIds={selectedClipIds}
          dragState={dragState}
          onClipClick={(clipId, multiSelect) => {
            selectClip(clipId, multiSelect);
          }}
          onClipDragStart={(clipId) => {
            // Handled by mouse events
          }}
          onClipDragEnd={(clipId, trackId, position) => {
            // Handled by mouse events
          }}
          onTrimHandleDrag={(clipId, handle, delta) => {
            // Handled by mouse events
          }}
          onPlayheadDrag={(time) => {
            seek(time);
          }}
        />
      </div>

      {/* Debug Info (remove in production) */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: '#888',
          fontSize: '12px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 20
        }}
      >
        Zoom: {zoom.toFixed(2)}x | Scroll: {scrollLeft.toFixed(0)}px | Time: {currentTime.toFixed(2)}s
      </div>
    </div>
  );
};
