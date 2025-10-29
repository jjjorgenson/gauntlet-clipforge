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
import { TimelineControls } from './TimelineControls';
import { TrackHeader } from './TrackHeader';
import { TrimDialog } from './TrimDialog';
import { Clip, Track } from '@types';

export const Timeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'clip' | 'trim-left' | 'trim-right' | 'playhead' | 'pan' | null;
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

  // Track selection state
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  // Trim dialog state
  const [trimClipTarget, setTrimClipTarget] = useState<Clip | null>(null);
  
  // Timeline store state - Direct subscriptions for reactive updates
  const tracks = useTimelineStore((state) => state.tracks);
  const duration = useTimelineStore((state) => state.duration);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const zoom = useTimelineStore((state) => state.zoom);
  const scrollLeft = useTimelineStore((state) => state.scrollLeft);
  const selectedClipIds = useTimelineStore((state) => state.selectedClipIds);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const setZoom = useTimelineStore((state) => state.setZoom);
  const setScrollLeft = useTimelineStore((state) => state.setScrollLeft);
  const seek = useTimelineStore((state) => state.seek);
  const moveClip = useTimelineStore((state) => state.moveClip);
  const trimClip = useTimelineStore((state) => state.trimClip);
  const selectClip = useTimelineStore((state) => state.selectClip);
  const clearSelection = useTimelineStore((state) => state.clearSelection);
  const deleteSelectedClips = useTimelineStore((state) => state.deleteSelectedClips);
  const addTrack = useTimelineStore((state) => state.addTrack);
  const removeTrack = useTimelineStore((state) => state.removeTrack);
  const updateTrack = useTimelineStore((state) => state.updateTrack);

  // Timeline constants
  const PIXELS_PER_SECOND_BASE = 100;
  const TRACK_HEIGHT = 60;
  const TRACK_MARGIN = 4;
  const TRIM_HANDLE_WIDTH = 8;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10.0;
  const ZOOM_STEP = 0.1;
  const TRACK_HEADER_WIDTH = 200;

  // Utility functions
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;
  
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  const pixelsToTime = useCallback((pixels: number): number => {
    return (pixels + scrollLeft) / pixelsPerSecond;
  }, [pixelsPerSecond, scrollLeft]);

  // Initialize with default track if empty
  useEffect(() => {
    if (tracks.length === 0) {
      addTrack('Track 1');
    }
  }, [tracks.length, addTrack]);

  // Enhanced zoom functions
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
    if (newZoom !== zoom) {
      // Maintain center point during zoom
      const centerX = dimensions.width / 2;
      const centerTime = pixelsToTime(centerX);
      const newPixelsPerSecond = PIXELS_PER_SECOND_BASE * newZoom;
      const newScrollLeft = centerTime * newPixelsPerSecond - centerX;
      
      setZoom(newZoom);
      setScrollLeft(Math.max(0, newScrollLeft));
    }
  }, [zoom, dimensions.width, pixelsToTime, setZoom, setScrollLeft]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
    if (newZoom !== zoom) {
      // Maintain center point during zoom
      const centerX = dimensions.width / 2;
      const centerTime = pixelsToTime(centerX);
      const newPixelsPerSecond = PIXELS_PER_SECOND_BASE * newZoom;
      const newScrollLeft = centerTime * newPixelsPerSecond - centerX;
      
      setZoom(newZoom);
      setScrollLeft(Math.max(0, newScrollLeft));
    }
  }, [zoom, dimensions.width, pixelsToTime, setZoom, setScrollLeft]);

  const fitToWindow = useCallback(() => {
    if (duration > 0 && dimensions.width > 0) {
      const targetZoom = (dimensions.width - TRACK_HEADER_WIDTH) / (duration * PIXELS_PER_SECOND_BASE);
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
      
      setZoom(clampedZoom);
      setScrollLeft(0);
    }
  }, [duration, dimensions.width, setZoom, setScrollLeft]);

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
      if (e.deltaY > 0) {
        zoomOut();
      } else {
        zoomIn();
      }
    } else {
      // Horizontal scroll with wheel
      const scrollDelta = e.deltaY;
      const maxScroll = Math.max(0, duration * pixelsPerSecond - (dimensions.width - TRACK_HEADER_WIDTH));
      setScrollLeft(Math.max(0, Math.min(maxScroll, scrollLeft + scrollDelta)));
    }
  };

  // Handle trim clip request (right-click context menu)
  const handleTrimClip = useCallback((clipId: string) => {
    // Find the clip
    let targetClip: Clip | null = null;
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        targetClip = clip;
        break;
      }
    }

    if (targetClip) {
      setTrimClipTarget(targetClip);
    }
  }, [tracks]);

  // Handle trim dialog confirm
  const handleTrimConfirm = useCallback((clipId: string, startTime: number, endTime: number) => {
    try {
      trimClip(clipId, startTime, endTime);
      console.log(`✂️ Clip trimmed: ${clipId} → ${startTime}s to ${endTime}s`);
      setTrimClipTarget(null);
    } catch (error: any) {
      console.error('❌ Trim failed:', error);
    }
  }, [trimClip]);

  // Handle trim dialog cancel
  const handleTrimCancel = useCallback(() => {
    setTrimClipTarget(null);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Adjust x to account for track header (timeline starts at TRACK_HEADER_WIDTH)
    const timelineX = x - TRACK_HEADER_WIDTH;
    const time = pixelsToTime(timelineX);

    // Check if clicking on playhead
    const playheadX = timeToPixels(currentTime);
    if (Math.abs(timelineX - playheadX) < 10) {
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
    const clipHit = findClipAtPosition(timelineX, y);
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
        dragStartX: timelineX,
        dragStartTime: clip.startTime,
        dragOffset: timelineX - timeToPixels(clip.startTime)
      });
      return;
    }

    // Check if clicking on track header area (for panning)
    if (x < TRACK_HEADER_WIDTH) {
      // Clicked on track header area
      return;
    }

    // Start panning if middle mouse button or right mouse button
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setDragState({
        isDragging: true,
        dragType: 'pan',
        dragClipId: null,
        dragStartX: x,
        dragStartTime: 0,
        dragOffset: scrollLeft
      });
      return;
    }

    // Clicked on empty space
    if (!e.ctrlKey && !e.metaKey) {
      clearSelection();
    }
  }, [currentTime, pixelsToTime, timeToPixels, findClipAtPosition, selectClip, clearSelection, scrollLeft]);

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

  // Drop zone state
  const [dropZone, setDropZone] = useState<{
    isActive: boolean;
    trackIndex: number;
    dropTime: number;
  } | null>(null);

  // Drop handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only show drop zone in timeline area (not track headers)
    if (x >= TRACK_HEADER_WIDTH && tracks.length > 0) {
      const adjustedX = x - TRACK_HEADER_WIDTH;
      const dropTime = pixelsToTime(adjustedX);
      const trackIndex = Math.max(0, Math.min(tracks.length - 1, Math.floor((y - 40) / (TRACK_HEIGHT + TRACK_MARGIN))));
      
      setDropZone({
        isActive: true,
        trackIndex,
        dropTime: Math.max(0, dropTime)
      });
    } else {
      setDropZone(null);
    }
  }, [pixelsToTime, tracks]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drop zone if leaving the container
    if (e.currentTarget === e.target) {
      setDropZone(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      setDropZone(null);
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only handle drops in the timeline area (not track headers)
    if (x < TRACK_HEADER_WIDTH) {
      setDropZone(null);
      return;
    }

    // Get clip data from drag
    const clipData = e.dataTransfer.getData('application/clipforge-clip');
    if (!clipData) {
      console.warn('No clip data found in drag event');
      setDropZone(null);
      return;
    }

    try {
      const clipInfo = JSON.parse(clipData);
      
      // Calculate drop position
      const adjustedX = x - TRACK_HEADER_WIDTH;
      let dropTime = Math.max(0, pixelsToTime(adjustedX));
      
      // Snap to 0 if very close to start
      if (dropTime < 0.05) {
        dropTime = 0;
      }
      
      const trackIndex = Math.max(0, Math.min(tracks.length - 1, Math.floor((y - 40) / (TRACK_HEIGHT + TRACK_MARGIN))));
      const targetTrack = tracks[trackIndex];
      
      if (targetTrack) {
        const duration = clipInfo.duration || 5;
        
        // Snap drop time to nearby clips
        const snappedTime = snapToClips(dropTime);
        
        // Create new clip at drop position
        const newClip: Clip = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          trackId: targetTrack.id,
          sourceFile: clipInfo.sourceFile,
          startTime: snappedTime,
          endTime: snappedTime + duration,
          trimIn: 0,
          trimOut: duration,
          metadata: {
            duration,
            resolution: {
              width: clipInfo.width || 1920,
              height: clipInfo.height || 1080
            },
            frameRate: clipInfo.fps || 30,
            codec: clipInfo.codec || 'h264',
            size: clipInfo.size || 0
          }
        };
        
        // Check for collisions and adjust if necessary
        let finalStartTime = snappedTime;
        const hasCollision = targetTrack.clips.some(clip => 
          (newClip.startTime < clip.endTime && newClip.endTime > clip.startTime)
        );
        
        if (hasCollision) {
          // Find the next available position after the collision
          const sortedClips = [...targetTrack.clips].sort((a, b) => a.startTime - b.startTime);
          for (const clip of sortedClips) {
            if (finalStartTime < clip.endTime) {
              finalStartTime = clip.endTime;
            }
          }
          newClip.startTime = finalStartTime;
          newClip.endTime = finalStartTime + duration;
        }
        
        // Add clip to track using updateTrack
        const updatedTrack = {
          ...targetTrack,
          clips: [...targetTrack.clips, newClip].sort((a, b) => a.startTime - b.startTime)
        };
        updateTrack(targetTrack.id, updatedTrack);
        
        // Select the newly added clip
        selectClip(newClip.id, false);
        
        // Seek to the start of the new clip so video preview shows it
        seek(newClip.startTime);
        
        console.log('Clip added to timeline:', {
          track: targetTrack.name,
          startTime: newClip.startTime,
          duration: newClip.endTime - newClip.startTime
        });
      }
    } catch (error) {
      console.error('Failed to parse clip data:', error);
    } finally {
      setDropZone(null);
    }
  }, [pixelsToTime, tracks, updateTrack, snapToClips, selectClip]);

  // Global mouse events for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const timelineX = x - TRACK_HEADER_WIDTH;
      const y = e.clientY - rect.top;
      const time = pixelsToTime(timelineX);

      if (dragState.dragType === 'playhead') {
        const clampedTime = Math.max(0, Math.min(time, duration));
        seek(clampedTime);
      } else if (dragState.dragType === 'pan') {
        // Handle panning
        const deltaX = x - dragState.dragStartX;
        const newScrollLeft = dragState.dragOffset - deltaX;
        const maxScroll = Math.max(0, duration * pixelsPerSecond - (dimensions.width - TRACK_HEADER_WIDTH));
        setScrollLeft(Math.max(0, Math.min(maxScroll, newScrollLeft)));
      } else if (dragState.dragClipId && dragState.dragType) {
        const clip = tracks.flatMap(t => t.clips).find(c => c.id === dragState.dragClipId);
        if (!clip) return;

        if (dragState.dragType === 'clip') {
          const newStartTime = snapToClips(time - dragState.dragOffset / pixelsPerSecond, clip.id);
          const clipDuration = clip.endTime - clip.startTime;
          const newEndTime = newStartTime + clipDuration;

          const targetTrack = tracks.find(t => {
            const trackIndex = tracks.indexOf(t);
            const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
            return y >= trackY && y <= trackY + TRACK_HEIGHT;
          });

          // Allow movement if start time is valid (don't restrict by timeline duration - it will expand)
          if (targetTrack && newStartTime >= 0) {
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        cursor: dragState.isDragging ? 'grabbing' : 'default',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Timeline Controls */}
      <TimelineControls
        zoom={zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitToWindow={fitToWindow}
        onAddTrack={() => addTrack(`Track ${tracks.length + 1}`)}
        onDeleteTrack={() => {
          // Delete the last track
          if (tracks.length > 1) {
            const lastTrack = tracks[tracks.length - 1];
            removeTrack(lastTrack.id);
          }
        }}
        trackCount={tracks.length}
        canDeleteTrack={tracks.length > 1}
      />

      {/* Main Timeline Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Track Headers */}
        <div
          style={{
            width: TRACK_HEADER_WIDTH,
            backgroundColor: '#2a2a2a',
            borderRight: '1px solid #444',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {tracks.map((track, index) => (
            <TrackHeader
              key={track.id}
              track={track}
              trackIndex={index}
              height={TRACK_HEIGHT + TRACK_MARGIN}
              onTrackClick={setSelectedTrackId}
              onTrackRename={(trackId, newName) => updateTrack(trackId, { name: newName })}
              onTrackDelete={removeTrack}
              isSelected={selectedTrackId === track.id}
            />
          ))}
        </div>

        {/* Timeline Content */}
        <div
          ref={timelineRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#1a1a1a'
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
            {/* Empty State Overlay */}
            {tracks.length > 0 && tracks.every(track => track.clips.length === 0) && !dropZone && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px',
                    backgroundColor: 'rgba(42, 42, 42, 0.6)',
                    borderRadius: '16px',
                    border: '2px dashed rgba(100, 100, 100, 0.4)',
                    maxWidth: '400px'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>
                    🎬
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                    Drop clips here to start editing
                  </h3>
                  <p style={{ fontSize: '14px', color: '#999', marginBottom: '16px' }}>
                    Drag video clips from the Media Library to add them to your timeline
                  </p>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4096ff' }}></div>
                      <span>Drag clips to arrange them</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4096ff' }}></div>
                      <span>Trim edges to adjust duration</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4096ff' }}></div>
                      <span>Press Delete to remove clips</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TimelineCanvas
              tracks={tracks}
              currentTime={currentTime}
              zoom={zoom}
              scrollLeft={scrollLeft}
              selectedClipIds={selectedClipIds}
              dragState={{
                ...dragState,
                dragType: dragState.dragType === 'pan' ? null : dragState.dragType
              }}
              onClipClick={(clipId: string, multiSelect: boolean) => {
                selectClip(clipId, multiSelect);
              }}
              onClipDragStart={(clipId: string) => {
                // Find the clip to set up drag state
                const clip = tracks.flatMap(t => t.clips).find(c => c.id === clipId);
                if (clip && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const clipX = timeToPixels(clip.startTime);
                  setDragState({
                    isDragging: true,
                    dragType: 'clip',
                    dragClipId: clipId,
                    dragStartX: clipX,
                    dragStartTime: clip.startTime,
                    dragOffset: 0
                  });
                }
              }}
              onClipDragEnd={(_clipId: string, _trackId: string, _position: number) => {
                // Cleanup handled by global mouse up
              }}
              onTrimHandleDrag={(_clipId: string, _handle: 'start' | 'end', _delta: number) => {
                // Handled by mouse events
              }}
              onPlayheadDrag={(time: number) => {
                seek(time);
              }}
              onTrim={handleTrimClip}
            />
            
            {/* Drop Zone Indicator */}
            {dropZone && dropZone.isActive && (
              <>
                {/* Highlight target track */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: dropZone.trackIndex * (TRACK_HEIGHT + TRACK_MARGIN),
                    width: '100%',
                    height: TRACK_HEIGHT,
                    backgroundColor: 'rgba(59, 130, 246, 0.18)',
                    border: '2px dashed rgba(59, 130, 246, 0.8)',
                    pointerEvents: 'none',
                    zIndex: 100,
                    borderRadius: '6px',
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                {/* Glow effect behind track */}
                <div
                  style={{
                    position: 'absolute',
                    left: -4,
                    top: dropZone.trackIndex * (TRACK_HEIGHT + TRACK_MARGIN) - 4,
                    width: 'calc(100% + 8px)',
                    height: TRACK_HEIGHT + 8,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 99,
                    borderRadius: '8px',
                    filter: 'blur(4px)'
                  }}
                />
                {/* Drop position indicator line */}
                <div
                  style={{
                    position: 'absolute',
                    left: timeToPixels(dropZone.dropTime),
                    top: dropZone.trackIndex * (TRACK_HEIGHT + TRACK_MARGIN) - 4,
                    width: '4px',
                    height: TRACK_HEIGHT + 8,
                    backgroundColor: 'rgba(59, 130, 246, 1)',
                    pointerEvents: 'none',
                    zIndex: 101,
                    boxShadow: '0 0 16px rgba(59, 130, 246, 0.8), 0 0 32px rgba(59, 130, 246, 0.4)',
                    borderRadius: '2px'
                  }}
                >
                  {/* Arrow indicator at top */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: -6,
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '10px solid rgba(59, 130, 246, 1)',
                      filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
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
      {/* Trim Dialog */}
      <TrimDialog
        clip={trimClipTarget}
        onConfirm={handleTrimConfirm}
        onCancel={handleTrimCancel}
      />
    </div>
  );
};
