/**
 * Time Ruler Component
 * 
 * Renders time markings and labels at the top of the timeline.
 * Implements TimelineComponentProps.TimeRuler interface.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { TimelineComponentProps } from '../../shared/contracts/components';

// Time ruler constants
const PIXELS_PER_SECOND_BASE = 100; // Base pixels per second at zoom 1.0
const RULER_HEIGHT = 40;
const MAJOR_TICK_HEIGHT = 20;
const MINOR_TICK_HEIGHT = 10;
const TEXT_MARGIN = 4;

// Colors
const COLORS = {
  background: '#2a2a2a',
  border: '#444',
  tick: '#888',
  text: '#ffffff',
  playhead: '#ff4757'
};

export const TimeRuler: React.FC<TimelineComponentProps.TimeRuler> = ({
  duration,
  zoom,
  scrollLeft,
  currentTime,
  onSeek
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

    // Draw background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Draw time ticks and labels
    drawTimeTicks(ctx, width);

    // Draw playhead
    drawPlayhead(ctx, currentTime, height);

  }, [duration, pixelsPerSecond, scrollLeft, currentTime]);

  // Draw time ticks and labels
  const drawTimeTicks = (ctx: CanvasRenderingContext2D, width: number) => {
    const startTime = pixelsToTime(0);
    const endTime = pixelsToTime(width);
    
    // Determine tick interval based on zoom level
    const tickInterval = getTickInterval(zoom);
    const startTick = Math.floor(startTime / tickInterval) * tickInterval;
    const endTick = Math.ceil(endTime / tickInterval) * tickInterval;

    ctx.strokeStyle = COLORS.tick;
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let time = startTick; time <= endTick; time += tickInterval) {
      const x = timeToPixels(time);
      
      if (x >= -50 && x <= width + 50) { // Draw slightly outside bounds for smooth scrolling
        const isMajorTick = isMajorTickTime(time, tickInterval);
        const tickHeight = isMajorTick ? MAJOR_TICK_HEIGHT : MINOR_TICK_HEIGHT;
        
        // Draw tick line
        ctx.beginPath();
        ctx.moveTo(x, RULER_HEIGHT);
        ctx.lineTo(x, RULER_HEIGHT - tickHeight);
        ctx.stroke();

        // Draw time label for major ticks
        if (isMajorTick) {
          const timeText = formatTime(time);
          ctx.fillText(timeText, x + TEXT_MARGIN, TEXT_MARGIN);
        }
      }
    }
  };

  // Draw playhead
  const drawPlayhead = (ctx: CanvasRenderingContext2D, time: number, height: number) => {
    const playheadX = timeToPixels(time);
    
    if (playheadX >= -10 && playheadX <= ctx.canvas.width + 10) {
      // Playhead line
      ctx.strokeStyle = COLORS.playhead;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead triangle
      ctx.fillStyle = COLORS.playhead;
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, height);
      ctx.lineTo(playheadX + 6, height);
      ctx.lineTo(playheadX, height - 12);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Determine appropriate tick interval based on zoom
  const getTickInterval = (zoom: number): number => {
    if (zoom >= 4) return 0.1;      // 100ms ticks
    if (zoom >= 2) return 0.25;       // 250ms ticks
    if (zoom >= 1) return 0.5;        // 500ms ticks
    if (zoom >= 0.5) return 1;        // 1 second ticks
    if (zoom >= 0.25) return 2;       // 2 second ticks
    if (zoom >= 0.1) return 5;        // 5 second ticks
    return 10;                        // 10 second ticks
  };

  // Check if this time should be a major tick (with label)
  const isMajorTickTime = (time: number, interval: number): boolean => {
    if (interval <= 0.5) {
      // For sub-second intervals, major ticks every second
      return Math.abs(time - Math.round(time)) < 0.001;
    } else if (interval <= 2) {
      // For 1-2 second intervals, major ticks every 5 seconds
      return Math.abs(time % 5) < 0.001;
    } else if (interval <= 5) {
      // For 5 second intervals, major ticks every 10 seconds
      return Math.abs(time % 10) < 0.001;
    } else {
      // For larger intervals, major ticks every 30 seconds
      return Math.abs(time % 30) < 0.001;
    }
  };

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
    canvas.height = RULER_HEIGHT * dpr;

    // Set CSS size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${RULER_HEIGHT}px`;

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

  // Handle mouse events for seeking
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelsToTime(x);
    
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, duration));
    onSeek(clampedTime);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        height: `${RULER_HEIGHT}px`,
        display: 'block',
        cursor: 'pointer'
      }}
    />
  );
};
