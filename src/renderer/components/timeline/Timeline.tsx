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
import { TrimDialog } from './TrimDialog';
import { Clip, Track } from '@types';

export const Timeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Scroll synchronization state
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Drag state
  const [dragState, setDragState] = useState<{
    isPreparing: boolean;      // Mouse down but not moved threshold yet
    isDragging: boolean;        // Actually dragging (moved threshold distance)
    dragType: 'clip' | 'trim-left' | 'trim-right' | 'playhead' | 'pan' | null;
    dragClipId: string | null;
    dragStartX: number;
    dragStartTime: number;
    dragOffset: number;
    initialMouseX: number;      // Track initial mouse position for threshold
    initialMouseY: number;
    dragOffsetY: number;        // Vertical offset: where mouse clicked within clip (pixels from clip top)
    dragStartTrackIndex: number; // Track index where drag started
  }>({
    isPreparing: false,
    isDragging: false,
    dragType: null,
    dragClipId: null,
    dragStartX: 0,
    dragStartTime: 0,
    dragOffset: 0,
    initialMouseX: 0,
    initialMouseY: 0,
    dragOffsetY: 0,
    dragStartTrackIndex: -1
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
  const isGridSnapEnabled = useTimelineStore((state) => state.isGridSnapEnabled);
  const gridSnapSize = useTimelineStore((state) => state.gridSnapSize);
  const setZoom = useTimelineStore((state) => state.setZoom);
  const setScrollLeft = useTimelineStore((state) => state.setScrollLeft);
  const seek = useTimelineStore((state) => state.seek);
  const moveClip = useTimelineStore((state) => state.moveClip);
  const trimClip = useTimelineStore((state) => state.trimClip);
  const splitClip = useTimelineStore((state) => state.splitClip);
  const selectClip = useTimelineStore((state) => state.selectClip);
  const clearSelection = useTimelineStore((state) => state.clearSelection);
  const deleteSelectedClips = useTimelineStore((state) => state.deleteSelectedClips);
  const toggleGridSnap = useTimelineStore((state) => state.toggleGridSnap);
  const addTrack = useTimelineStore((state) => state.addTrack);
  const removeTrack = useTimelineStore((state) => state.removeTrack);
  const updateTrack = useTimelineStore((state) => state.updateTrack);

  // Timeline constants
  const PIXELS_PER_SECOND_BASE = 100;
  const TRACK_HEIGHT = 60;
  const TRACK_MARGIN = 4;
  const RULER_HEIGHT = 40; // Height of the time ruler at the top
  const TRIM_HANDLE_WIDTH = 8;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10.0;
  const ZOOM_STEP = 0.1;
  const TRACK_HEADER_WIDTH = 0; // Track headers removed - timeline starts at x=0

  // Utility functions
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;
  
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  const pixelsToTime = useCallback((pixels: number): number => {
    return (pixels + scrollLeft) / pixelsPerSecond;
  }, [pixelsPerSecond, scrollLeft]);

  // Initialize with default tracks if empty
  useEffect(() => {
    if (tracks.length === 0) {
      addTrack('Track 1');
      addTrack('Track 2');
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
      const targetZoom = dimensions.width / (duration * PIXELS_PER_SECOND_BASE);
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
      
      setZoom(clampedZoom);
      setScrollLeft(0);
    }
  }, [duration, dimensions.width, setZoom, setScrollLeft]);

  // Find clip at position
  const findClipAtPosition = useCallback((x: number, y: number): { clip: Clip; track: Track; hitRegion: 'body' | 'trim-left' | 'trim-right' } | null => {
    // Adjust y to account for ruler height (40px) since tracks are in canvas with marginTop
    const adjustedY = y - RULER_HEIGHT;
    
    for (const track of tracks) {
      const trackIndex = tracks.indexOf(track);
      const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
      
      if (adjustedY >= trackY && adjustedY <= trackY + TRACK_HEIGHT) {
        for (const clip of track.clips) {
          const clipX = timeToPixels(clip.startTime);
          const clipWidth = timeToPixels(clip.endTime) - clipX;
          const clipY = trackY + 4; // 4px margin
          
          if (x >= clipX && x <= clipX + clipWidth && adjustedY >= clipY && adjustedY <= clipY + (TRACK_HEIGHT - 8)) {
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

  // Snap to nearby clips and/or grid
  const snapTime = useCallback((time: number, excludeClipId?: string): number => {
    const snapThreshold = 0.1; // 100ms snap threshold for clip edges
    let snappedTime = time;
    let closestDistance = Infinity;
    
    // Snap to clip edges
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.id === excludeClipId) continue;
        
        // Check distance to clip start
        const distToStart = Math.abs(time - clip.startTime);
        if (distToStart < snapThreshold && distToStart < closestDistance) {
          snappedTime = clip.startTime;
          closestDistance = distToStart;
        }
        
        // Check distance to clip end
        const distToEnd = Math.abs(time - clip.endTime);
        if (distToEnd < snapThreshold && distToEnd < closestDistance) {
          snappedTime = clip.endTime;
          closestDistance = distToEnd;
        }
      }
    }
    
    // Snap to grid if enabled (only if no closer clip snap)
    if (isGridSnapEnabled) {
      const gridSnapped = Math.round(time / gridSnapSize) * gridSnapSize;
      const distToGrid = Math.abs(time - gridSnapped);
      
      // Use grid snap if it's closer or no clip snap found
      if (closestDistance === Infinity || distToGrid < closestDistance) {
        snappedTime = gridSnapped;
      }
    }
    
    return snappedTime;
  }, [tracks, isGridSnapEnabled, gridSnapSize]);

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
      const maxScroll = Math.max(0, duration * pixelsPerSecond - dimensions.width);
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

  // Handle split clip button
  const handleSplitClip = useCallback(() => {
    console.log('🔪 HANDLER: Split button clicked', {
      selectedClipIds,
      currentTime,
      trackCount: tracks.length,
      totalClips: tracks.flatMap(t => t.clips).length
    });
    
    // Find clip at current playhead position that is selected
    const clipAtPlayhead = tracks
      .flatMap(t => t.clips)
      .find(c => {
        const isSelected = selectedClipIds.includes(c.id);
        const isAfterStart = currentTime > c.startTime + 0.1;
        const isBeforeEnd = currentTime < c.endTime - 0.1;
        
        console.log('🔍 HANDLER: Checking clip:', {
          clipId: c.id.substring(0, 8),
          startTime: c.startTime,
          endTime: c.endTime,
          currentTime,
          isSelected,
          isAfterStart,
          isBeforeEnd,
          willMatch: isSelected && isAfterStart && isBeforeEnd
        });
        
        return isSelected && isAfterStart && isBeforeEnd;
      });
    
    console.log('🎯 HANDLER: Clip at playhead:', clipAtPlayhead ? {
      clipId: clipAtPlayhead.id.substring(0, 8),
      startTime: clipAtPlayhead.startTime,
      endTime: clipAtPlayhead.endTime
    } : 'NO CLIP FOUND');
    
    if (clipAtPlayhead) {
      console.log('✂️ HANDLER: Calling splitClip function');
      splitClip(clipAtPlayhead.id, currentTime);
      console.log('✅ HANDLER: splitClip call completed');
    } else {
      console.warn('⚠️ HANDLER: No valid clip to split at current playhead position');
    }
  }, [tracks, selectedClipIds, currentTime, splitClip]);

  // Check if split is available (memoized to prevent excessive recalculation)
  const canSplitClip = React.useMemo(() => {
    return tracks
      .flatMap(t => t.clips)
      .some(c => 
        selectedClipIds.includes(c.id) && 
        currentTime > c.startTime + 0.1 && 
        currentTime < c.endTime - 0.1
      );
  }, [tracks, selectedClipIds, currentTime]);

  // Scroll synchronization handler - sync native horizontal scroll with scrollLeft state
  const handleTimelineContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Sync horizontal scroll to state for timeline rendering
    setScrollLeft(target.scrollLeft);
  }, [setScrollLeft]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Timeline starts at 0 now (no track header panel)
    const timelineX = x;
    const time = pixelsToTime(timelineX);

    // Check if clicking on playhead
    const playheadX = timeToPixels(currentTime);
    if (Math.abs(timelineX - playheadX) < 10) {
      setDragState({
        isPreparing: false,
        isDragging: true,
        dragType: 'playhead',
        dragClipId: null,
        dragStartX: x,
        dragStartTime: currentTime,
        dragOffset: 0,
        dragOffsetY: 0,
        dragStartTrackIndex: -1,
        initialMouseX: x,
        initialMouseY: y
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

      const clipStartPixels = timeToPixels(clip.startTime);
      const dragOffset = timelineX - clipStartPixels;

      console.log('🎬 DRAG START:', {
        clipId: clip.id.substring(0, 8) + '...',
        mouseX: timelineX.toFixed(1) + 'px',
        clipStartTime: clip.startTime.toFixed(3) + 's',
        clipStartPixels: clipStartPixels.toFixed(1) + 'px',
        dragOffset: dragOffset.toFixed(1) + 'px',
        dragOffsetTime: (dragOffset / pixelsPerSecond).toFixed(3) + 's',
        hitRegion,
        zoom: zoom.toFixed(2) + 'x'
      });

      setDragState({
        isPreparing: false,
        isDragging: true,
        dragType,
        dragClipId: clip.id,
        dragStartX: timelineX,
        dragStartTime: clip.startTime,
        dragOffset: dragOffset,
        dragOffsetY: 0, // Trim handles don't need vertical offset
        dragStartTrackIndex: -1,
        initialMouseX: timelineX,
        initialMouseY: y
      });
      return;
    }

    // Check if clicking on track header area (for panning)
    if (x < 0) {
      // Clicked on track header area
      return;
    }

    // Start panning if middle mouse button or right mouse button
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setDragState({
        isPreparing: false,
        isDragging: true,
        dragType: 'pan',
        dragClipId: null,
        dragStartX: x,
        dragStartTime: 0,
        dragOffset: scrollLeft,
        dragOffsetY: 0,
        dragStartTrackIndex: -1,
        initialMouseX: x,
        initialMouseY: y
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
      isPreparing: false,
      isDragging: false,
      dragType: null,
      dragClipId: null,
      dragStartX: 0,
      dragStartTime: 0,
      dragOffset: 0,
      dragOffsetY: 0,
      dragStartTrackIndex: -1,
      initialMouseX: 0,
      initialMouseY: 0
    });
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedClipIds.length > 0) {
        deleteSelectedClips();
      }
    } else if (e.key === 's' || e.key === 'S') {
      // Split clip at playhead position
      if (!e.ctrlKey && !e.metaKey) { // Don't interfere with Ctrl+S (save)
        e.preventDefault();
        
        // Find clip at current playhead position that is selected
        const clipAtPlayhead = tracks
          .flatMap(t => t.clips)
          .find(c => 
            selectedClipIds.includes(c.id) && 
            currentTime > c.startTime + 0.1 && // Not too close to start
            currentTime < c.endTime - 0.1      // Not too close to end
          );
        
        if (clipAtPlayhead) {
          splitClip(clipAtPlayhead.id, currentTime);
          console.log('✂️ Split clip at', currentTime.toFixed(3), 's');
        }
      }
    }
  }, [selectedClipIds, deleteSelectedClips, tracks, currentTime, splitClip]);

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
    if (x >= 0 && tracks.length > 0) {
      const adjustedX = x;
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
    if (x < 0) {
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
      const adjustedX = x;
      let dropTime = Math.max(0, pixelsToTime(adjustedX));
      
      // Snap to 0 if very close to start
      if (dropTime < 0.05) {
        dropTime = 0;
      }
      
      const trackIndex = Math.max(0, Math.min(tracks.length - 1, Math.floor((y - 40) / (TRACK_HEIGHT + TRACK_MARGIN))));
      const targetTrack = tracks[trackIndex];
      
      if (targetTrack) {
        const duration = clipInfo.duration || 5;
        
        // Snap drop time to nearby clips and/or grid
        const snappedTime = snapTime(dropTime);
        
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
  }, [pixelsToTime, tracks, updateTrack, snapTime, selectClip]);

  // Global mouse events for drag
  useEffect(() => {
    const DRAG_THRESHOLD = 5; // pixels - must move this far to start drag
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Get timeline canvas rect for all coordinate calculations
      // timelineRef is the scroll container that wraps TimelineCanvas
      const timelineRect = timelineRef.current?.getBoundingClientRect();
      if (!timelineRect) return;
      
      // Calculate mouse position relative to timeline scroll container (same coord system as initialMouseX/Y)
      const currentMouseX = e.clientX - timelineRect.left;
      const currentMouseY = e.clientY - timelineRect.top;
      
      // Check if we're preparing to drag but haven't met threshold yet
      if (dragState.isPreparing && !dragState.isDragging) {
        const deltaX = Math.abs(currentMouseX - dragState.initialMouseX);
        const deltaY = Math.abs(currentMouseY - dragState.initialMouseY);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance >= DRAG_THRESHOLD) {
          console.log('✅ DRAG THRESHOLD MET - Starting drag:', {
            distance: distance.toFixed(1) + 'px',
            threshold: DRAG_THRESHOLD + 'px',
            initialMouseX: dragState.initialMouseX.toFixed(1) + 'px',
            initialMouseY: dragState.initialMouseY.toFixed(1) + 'px',
            currentMouseX: currentMouseX.toFixed(1) + 'px',
            currentMouseY: currentMouseY.toFixed(1) + 'px',
            deltaX: deltaX.toFixed(1) + 'px',
            deltaY: deltaY.toFixed(1) + 'px'
          });
          
          // Threshold met - activate dragging
          setDragState(prev => ({
            ...prev,
            isPreparing: false,
            isDragging: true
          }));
        }
        return; // Don't process drag logic until threshold met
      }
      
      if (!dragState.isDragging) return;

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const x = e.clientX - containerRect.left;
      const timelineX = x - TRACK_HEADER_WIDTH;
      const y = currentMouseY; // Use the consistent coordinate system (relative to timelineRef)
      const time = pixelsToTime(timelineX);

      // Removed excessive logging for performance

      if (dragState.dragType === 'playhead') {
        const clampedTime = Math.max(0, Math.min(time, duration));
        seek(clampedTime);
      } else if (dragState.dragType === 'pan') {
        // Handle panning
        const deltaX = x - dragState.dragStartX;
        const newScrollLeft = dragState.dragOffset - deltaX;
        const maxScroll = Math.max(0, duration * pixelsPerSecond - dimensions.width);
        setScrollLeft(Math.max(0, Math.min(maxScroll, newScrollLeft)));
      } else if (dragState.dragClipId && dragState.dragType) {
        const clip = tracks.flatMap(t => t.clips).find(c => c.id === dragState.dragClipId);
        if (!clip) return;

        if (dragState.dragType === 'clip') {
          // Calculate new time accounting for drag offset
          // The drag offset represents where the mouse grabbed the clip relative to its start
          const rawTime = (timelineX + scrollLeft) / pixelsPerSecond - dragState.dragOffset / pixelsPerSecond;
          // Clamp to 0 immediately to prevent negative times and excessive logging
          const clampedRawTime = Math.max(0, rawTime);
          const newStartTime = snapTime(clampedRawTime, clip.id);

          // Find target track based on mouse Y position with vertical offset correction
          // Use 50% threshold for track switching (must cross halfway into adjacent track)
          const currentTrack = tracks.find(t => t.clips.some(c => c.id === clip.id));
          
          // Calculate the center Y position of where the clip should be (accounting for click offset)
          const clipHeight = TRACK_HEIGHT - 8; // 52px
          const clipTopY = y - dragState.dragOffsetY; // Where the clip's top edge should be
          const clipCenterY = clipTopY + (clipHeight / 2); // Center of the clip
          
          // Find which track the clip center is closest to
          let targetTrack = currentTrack;
          let minDistance = Infinity;
          
          for (const t of tracks) {
            const trackIndex = tracks.indexOf(t);
            // IMPORTANT: Must match TimelineCanvas.tsx positioning (no ruler offset)
            const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
            const trackCenterY = trackY + TRACK_HEIGHT / 2;
            
            // Calculate distance from clip center to track center
            const distance = Math.abs(clipCenterY - trackCenterY);
            
            // Use 50% threshold: only switch if clip center passes track center
            if (distance < minDistance && distance < TRACK_HEIGHT / 2) {
              minDistance = distance;
              targetTrack = t;
            }
          }
          
          // Move clip if we have a valid target track
          if (targetTrack) {
            moveClip(clip.id, targetTrack.id, newStartTime);
          }
        } else if (dragState.dragType === 'trim-left') {
          const newTrimIn = Math.max(0, Math.min(time - clip.startTime, clip.trimOut - 0.1));
          const snappedTime = snapTime(clip.startTime + newTrimIn, clip.id);
          const finalTrimIn = snappedTime - clip.startTime;
          
          if (finalTrimIn >= 0 && finalTrimIn < clip.trimOut - 0.1) {
            trimClip(clip.id, finalTrimIn, clip.trimOut);
          }
        } else if (dragState.dragType === 'trim-right') {
          const newTrimOut = Math.max(clip.trimIn + 0.1, Math.min(time - clip.startTime, clip.metadata.duration));
          const snappedTime = snapTime(clip.startTime + newTrimOut, clip.id);
          const finalTrimOut = snappedTime - clip.startTime;
          
          if (finalTrimOut > clip.trimIn + 0.1 && finalTrimOut <= clip.metadata.duration) {
            trimClip(clip.id, clip.trimIn, finalTrimOut);
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      // If we were preparing but never dragged (click), just select
      if (dragState.isPreparing && !dragState.isDragging) {
        console.log('👆 CLICK (no drag) - Already selected via onClipClick');
      } else if (dragState.isDragging && dragState.dragType === 'clip' && dragState.dragClipId) {
        const clip = tracks.flatMap(t => t.clips).find(c => c.id === dragState.dragClipId);
        if (clip) {
          console.log('✅ DRAG END:', {
            clipId: clip.id.substring(0, 8) + '...',
            finalStartTime: clip.startTime.toFixed(3) + 's',
            finalEndTime: clip.endTime.toFixed(3) + 's',
            totalMoved: (clip.startTime - dragState.dragStartTime).toFixed(3) + 's'
          });
        }
      }
      
      // Reset drag state
      setDragState({
        isPreparing: false,
        isDragging: false,
        dragType: null,
        dragClipId: null,
        dragStartX: 0,
        dragStartTime: 0,
        dragOffset: 0,
        dragOffsetY: 0,
        dragStartTrackIndex: -1,
        initialMouseX: 0,
        initialMouseY: 0
      });
    };

    // Listen to mouse events when preparing OR dragging
    if (dragState.isPreparing || dragState.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, pixelsToTime, pixelsPerSecond, snapTime, tracks, moveClip, trimClip, seek, duration]);

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
        onSplitClip={handleSplitClip}
        canSplitClip={canSplitClip}
        onToggleGridSnap={toggleGridSnap}
        isGridSnapEnabled={isGridSnapEnabled}
      />

      {/* Main Timeline Area */}
      <div
        ref={timelineContentRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
          {/* Time Ruler */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%', // Full viewport width for container
              height: '40px',
              backgroundColor: '#2a2a2a',
              borderBottom: '1px solid #444',
              zIndex: 10,
              overflowX: 'hidden' // Hide overflow to prevent double scrollbar
            }}
          >
            <div style={{ 
              position: 'absolute',
              left: `-${scrollLeft}px`, // Offset by scroll position for sync
              width: `${(() => {
                // Calculate timeline width same as TimelineCanvas
                const maxTime = Math.max(...tracks.map(t => Math.max(...t.clips.map(c => c.endTime), 0)), 10);
                const paddingTime = Math.max(maxTime * 0.2, 5);
                const totalDuration = maxTime + paddingTime;
                return totalDuration * pixelsPerSecond;
              })()}px`
            }}>
            <TimeRuler
              duration={duration}
              zoom={zoom}
                scrollLeft={0} // Pass 0 since we're offsetting the container
              currentTime={currentTime}
                onSeek={(time) => seek(time)} // Wrap to handle offset
            />
            </div>
          </div>

          {/* Timeline Canvas */}
          <div
            ref={timelineRef}
            style={{
              flex: 1,
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'auto', // Changed from 'hidden' to 'auto' to enable horizontal scrolling
              backgroundColor: '#1a1a1a',
              marginTop: '40px'
            }}
            onScroll={handleTimelineContentScroll}
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
              isGridSnapEnabled={isGridSnapEnabled}
              dragState={{
                ...dragState,
                dragType: dragState.dragType === 'pan' ? null : dragState.dragType
              }}
              onClipClick={(clipId: string, multiSelect: boolean) => {
                selectClip(clipId, multiSelect);
              }}
              onClipDragStart={(clipId: string, mouseX: number, mouseY: number) => {
                // Find the clip to set up drag state
                // mouseX and mouseY are relative to TimelineCanvas (canvasRef)
                // We need to also track relative to timelineRef (scroll container) for consistency
                const clip = tracks.flatMap(t => t.clips).find(c => c.id === clipId);
                if (clip && timelineRef.current) {
                  const clipStartPixels = timeToPixels(clip.startTime);
                  const dragOffset = mouseX - clipStartPixels;
                  
                  // Find which track the clip is currently in
                  const currentTrack = tracks.find(t => t.clips.some(c => c.id === clipId));
                  const trackIndex = currentTrack ? tracks.indexOf(currentTrack) : -1;
                  
                  // Calculate track and clip positions in TimelineCanvas coordinate system
                  // TimelineCanvas positions tracks WITHOUT ruler offset (ruler is separate)
                  const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
                  const clipHeight = TRACK_HEIGHT - 8; // 52px (60 - 8)
                  const clipY = trackY + 4; // Top edge of clip (4px margin from track top)
                  
                  // Calculate vertical offset: where user clicked within the clip (in canvas coords)
                  const dragOffsetY = mouseY - clipY;
                  
                  console.log('🎬 DRAG PREPARE (mousedown):', {
                    clipId: clipId.substring(0, 8) + '...',
                    mouseX: mouseX.toFixed(1) + 'px',
                    mouseY: mouseY.toFixed(1) + 'px (relative to TimelineCanvas)',
                    currentTrackId: currentTrack?.id.substring(0, 8),
                    trackIndex,
                    trackY: trackY.toFixed(1) + 'px',
                    clipY: clipY.toFixed(1) + 'px',
                    clipHeight: clipHeight + 'px',
                    dragOffsetY: dragOffsetY.toFixed(1) + 'px',
                    mouseYInTrackRange: mouseY >= trackY && mouseY <= trackY + TRACK_HEIGHT,
                    clipStartTime: clip.startTime.toFixed(3) + 's',
                    clipStartPixels: clipStartPixels.toFixed(1) + 'px',
                    dragOffset: dragOffset.toFixed(1) + 'px',
                    dragOffsetTime: (dragOffset / pixelsPerSecond).toFixed(3) + 's',
                    zoom: zoom.toFixed(2) + 'x'
                  });
                  
                  // Set preparing state - will become dragging after threshold
                  // Store both TimelineCanvas coordinates and timelineRef coordinates
                  setDragState({
                    isPreparing: true,
                    isDragging: false,  // Not dragging yet!
                    dragType: 'clip',
                    dragClipId: clipId,
                    dragStartX: mouseX,
                    dragStartTime: clip.startTime,
                    dragOffset: dragOffset,
                    dragOffsetY: dragOffsetY,
                    dragStartTrackIndex: trackIndex,
                    initialMouseX: mouseX,
                    initialMouseY: mouseY  // This is relative to TimelineCanvas
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
              onSplit={(clipId: string) => {
                splitClip(clipId, currentTime);
                console.log('✂️ Split clip via context menu at', currentTime.toFixed(3), 's');
              }}
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

      {/* Drag Position Tooltip */}
      {dragState.isDragging && dragState.dragType === 'clip' && dragState.dragClipId && (() => {
        const clip = tracks.flatMap(t => t.clips).find(c => c.id === dragState.dragClipId);
        if (!clip) return null;
        
        const clipX = timeToPixels(clip.startTime);
        const formatTime = (seconds: number): string => {
          const mins = Math.floor(seconds / 60);
          const secs = (seconds % 60).toFixed(2);
          return `${mins}:${secs.padStart(5, '0')}`;
        };
        
        return (
          <div
            style={{
              position: 'absolute',
              left: Math.max(10, Math.min(clipX, dimensions.width - 100)),
              top: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: '500',
              pointerEvents: 'none',
              zIndex: 200,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.5)',
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#60a5fa' }}>📍</span>
              <span>{formatTime(clip.startTime)}</span>
              <span style={{ color: '#666' }}>→</span>
              <span>{formatTime(clip.endTime)}</span>
              <span style={{ 
                marginLeft: '8px', 
                padding: '2px 6px', 
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '3px',
                fontSize: '11px',
                color: '#93c5fd'
              }}>
                {formatTime(clip.endTime - clip.startTime)}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Debug Info (hidden in production) */}
      <div
        style={{
          display: 'none', // Hidden - enable for debugging
          position: 'absolute',
          top: '50px',
          right: '10px',
          color: '#888',
          fontSize: '11px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: '8px 12px',
          borderRadius: '6px',
          zIndex: 20,
          border: '1px solid rgba(59, 130, 246, 0.3)',
          minWidth: '280px'
        }}
      >
        <div style={{ color: '#60a5fa', marginBottom: '6px', fontWeight: 'bold' }}>Timeline Debug</div>
        <div>Zoom: {zoom.toFixed(2)}x | Scroll: {scrollLeft.toFixed(0)}px</div>
        <div>Time: {currentTime.toFixed(3)}s | PPS: {pixelsPerSecond.toFixed(1)}</div>
        {dragState.isDragging && dragState.dragType === 'clip' && (
          <>
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(59, 130, 246, 0.3)', color: '#fbbf24' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🎬 DRAGGING</div>
              <div>Offset: {dragState.dragOffset.toFixed(1)}px ({(dragState.dragOffset / pixelsPerSecond).toFixed(3)}s)</div>
              <div>Start X: {dragState.dragStartX.toFixed(1)}px</div>
              <div>Start Time: {dragState.dragStartTime.toFixed(3)}s</div>
            </div>
          </>
        )}
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
