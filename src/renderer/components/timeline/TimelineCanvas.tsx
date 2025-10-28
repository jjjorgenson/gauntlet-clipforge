/**
 * Timeline Canvas Component
 * 
 * Handles all canvas rendering logic for the timeline.
 * Implements TimelineComponentProps.TimelineCanvas interface.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { TimelineComponentProps } from '../../shared/contracts/components';
import { Track, Clip } from '../../shared/types';

// Timeline rendering constants
const TRACK_HEIGHT = 60;
const TRACK_MARGIN = 4;
const CLIP_HEIGHT = TRACK_HEIGHT - 8;
const CLIP_MARGIN = 2;
const PIXELS_PER_SECOND_BASE = 100; // Base pixels per second at zoom 1.0

// Colors
const COLORS = {
  trackBackground: '#2a2a2a',
  trackBorder: '#444',
  clipBackground: '#4a90e2',
  clipSelected: '#f39c12',
  clipBorder: '#666',
  playhead: '#ff4757',
  gridLine: '#333',
  text: '#ffffff'
};

export const TimelineCanvas: React.FC<TimelineComponentProps.TimelineCanvas> = ({
  tracks,
  currentTime,
  zoom,
  scrollLeft,
  selectedClipIds,
  onClipClick,
  onClipDragStart,
  onClipDragEnd,
  onTrimHandleDrag,
  onPlayheadDrag
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Calculate pixels per second based on zoom
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  // Convert time to pixel position
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  // Convert pixel position to time
  const pixelsToTime = useCallback((pixels: number): number => {
    return (pixels + scrollLeft) / pixelsPerSecond;
  }, [pixelsPerSecond, scrollLeft]);

  // Main rendering function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    drawGrid(ctx, width, height);

    // Draw tracks
    tracks.forEach((track, trackIndex) => {
      const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
      drawTrack(ctx, track, trackY, width, trackIndex);
    });

    // Draw playhead
    drawPlayhead(ctx, currentTime, height);

  }, [tracks, currentTime, pixelsPerSecond, scrollLeft]);

  // Draw grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;

    // Vertical grid lines every second
    const startTime = pixelsToTime(0);
    const endTime = pixelsToTime(width);
    const startSecond = Math.floor(startTime);
    const endSecond = Math.ceil(endTime);

    for (let second = startSecond; second <= endSecond; second++) {
      const x = timeToPixels(second);
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Horizontal track separators
    tracks.forEach((_, trackIndex) => {
      const y = (trackIndex + 1) * (TRACK_HEIGHT + TRACK_MARGIN) - TRACK_MARGIN / 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
  };

  // Draw a single track
  const drawTrack = (
    ctx: CanvasRenderingContext2D, 
    track: Track, 
    trackY: number, 
    width: number,
    trackIndex: number
  ) => {
    // Track background
    ctx.fillStyle = COLORS.trackBackground;
    ctx.fillRect(0, trackY, width, TRACK_HEIGHT);

    // Track border
    ctx.strokeStyle = COLORS.trackBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, trackY, width, TRACK_HEIGHT);

    // Track label
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(track.name, 8, trackY + TRACK_HEIGHT / 2);

    // Draw clips in this track
    track.clips.forEach(clip => {
      drawClip(ctx, clip, trackY, trackIndex);
    });
  };

  // Draw a single clip
  const drawClip = (
    ctx: CanvasRenderingContext2D, 
    clip: Clip, 
    trackY: number,
    trackIndex: number
  ) => {
    const clipX = timeToPixels(clip.startTime);
    const clipWidth = timeToPixels(clip.endTime) - clipX;
    
    // Skip clips that are not visible
    if (clipX + clipWidth < 0 || clipX > ctx.canvas.width) {
      return;
    }

    const clipY = trackY + CLIP_MARGIN;
    const isSelected = selectedClipIds.includes(clip.id);

    // Clip background
    ctx.fillStyle = isSelected ? COLORS.clipSelected : COLORS.clipBackground;
    ctx.fillRect(clipX, clipY, clipWidth, CLIP_HEIGHT);

    // Clip border
    ctx.strokeStyle = COLORS.clipBorder;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(clipX, clipY, clipWidth, CLIP_HEIGHT);

    // Clip label (if there's enough space)
    if (clipWidth > 40) {
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Truncate text if too long
      const text = clip.sourceFile.split('/').pop() || 'Unknown';
      const maxWidth = clipWidth - 8;
      const metrics = ctx.measureText(text);
      
      if (metrics.width > maxWidth) {
        const truncatedText = text.substring(0, Math.floor(text.length * maxWidth / metrics.width)) + '...';
        ctx.fillText(truncatedText, clipX + 4, clipY + CLIP_HEIGHT / 2);
      } else {
        ctx.fillText(text, clipX + 4, clipY + CLIP_HEIGHT / 2);
      }
    }

    // Duration label (if there's enough space)
    if (clipWidth > 80) {
      const duration = clip.endTime - clip.startTime;
      const durationText = formatTime(duration);
      
      ctx.fillStyle = COLORS.text;
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(durationText, clipX + clipWidth - 4, clipY + CLIP_HEIGHT / 2);
    }
  };

  // Draw playhead
  const drawPlayhead = (ctx: CanvasRenderingContext2D, time: number, height: number) => {
    const playheadX = timeToPixels(time);
    
    if (playheadX >= 0 && playheadX <= ctx.canvas.width) {
      ctx.strokeStyle = COLORS.playhead;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead triangle
      ctx.fillStyle = COLORS.playhead;
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 12);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Set CSS size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Scale context for high DPI
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Handle resize
  useEffect(() => {
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    const canvas = canvasRef.current;
    if (canvas) {
      resizeObserver.observe(canvas);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Handle mouse events (for PART 2 - interactions)
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = pixelsToTime(x);

    // Check if clicking on playhead
    const playheadX = timeToPixels(currentTime);
    if (Math.abs(x - playheadX) < 10) {
      // Start playhead drag (TODO: implement in PART 2)
      console.log('Playhead drag start');
      return;
    }

    // Check if clicking on a clip
    const clickedClip = findClipAtPosition(x, y);
    if (clickedClip) {
      const multiSelect = e.ctrlKey || e.metaKey;
      onClipClick(clickedClip.id, multiSelect);
      return;
    }

    // Clicked on empty space
    // Selection will be cleared by parent Timeline component
  };

  // Find clip at mouse position
  const findClipAtPosition = (x: number, y: number): Clip | null => {
    for (const track of tracks) {
      const trackIndex = tracks.indexOf(track);
      const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
      
      if (y >= trackY && y <= trackY + TRACK_HEIGHT) {
        for (const clip of track.clips) {
          const clipX = timeToPixels(clip.startTime);
          const clipWidth = timeToPixels(clip.endTime) - clipX;
          const clipY = trackY + CLIP_MARGIN;
          
          if (x >= clipX && x <= clipX + clipWidth && 
              y >= clipY && y <= clipY + CLIP_HEIGHT) {
            return clip;
          }
        }
      }
    }
    return null;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'default'
      }}
    />
  );
};
