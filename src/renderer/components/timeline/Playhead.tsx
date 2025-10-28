/**
 * Playhead Component
 * 
 * Renders the draggable playhead line that shows current playback position.
 * Synchronizes with the preview player and timeline store.
 */

import React from 'react';

// Playhead constants
const PLAYHEAD_WIDTH = 2;
const PLAYHEAD_TRIANGLE_SIZE = 12;
const PLAYHEAD_COLOR = '#ff4757';
const PLAYHEAD_SHADOW_COLOR = 'rgba(255, 71, 87, 0.3)';

interface PlayheadProps {
  currentTime: number;
  duration: number;
  zoom: number;
  scrollLeft: number;
  height: number;
  isDragging: boolean;
  onSeek: (time: number) => void;
}

export const Playhead: React.FC<PlayheadProps> = ({
  currentTime,
  duration,
  zoom,
  scrollLeft,
  height,
  isDragging,
  onSeek
}) => {
  // Timeline constants
  const PIXELS_PER_SECOND_BASE = 100;
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  // Convert time to pixel position
  const timeToPixels = (time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  };

  // Convert pixel position to time
  const pixelsToTime = (pixels: number): number => {
    return (pixels + scrollLeft) / pixelsPerSecond;
  };

  // Calculate playhead position
  const playheadX = timeToPixels(currentTime);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Dragging is handled by parent Timeline component
  };

  // Don't render if playhead is outside visible area
  if (playheadX < -PLAYHEAD_TRIANGLE_SIZE || playheadX > height + PLAYHEAD_TRIANGLE_SIZE) {
    return null;
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: playheadX,
        top: 0,
        width: PLAYHEAD_WIDTH,
        height: height,
        pointerEvents: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 20
      }}
    >
      {/* Playhead line */}
      <div
        style={{
          position: 'absolute',
          left: PLAYHEAD_WIDTH / 2 - 1,
          top: PLAYHEAD_TRIANGLE_SIZE,
          width: PLAYHEAD_WIDTH,
          height: height - PLAYHEAD_TRIANGLE_SIZE,
          backgroundColor: PLAYHEAD_COLOR,
          boxShadow: `0 0 4px ${PLAYHEAD_SHADOW_COLOR}`
        }}
      />

      {/* Playhead triangle */}
      <div
        style={{
          position: 'absolute',
          left: PLAYHEAD_WIDTH / 2 - PLAYHEAD_TRIANGLE_SIZE / 2,
          top: 0,
          width: PLAYHEAD_TRIANGLE_SIZE,
          height: PLAYHEAD_TRIANGLE_SIZE,
          backgroundColor: PLAYHEAD_COLOR,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          boxShadow: `0 2px 4px ${PLAYHEAD_SHADOW_COLOR}`
        }}
      />

      {/* Time label */}
      <div
        style={{
          position: 'absolute',
          left: PLAYHEAD_WIDTH / 2 + 8,
          top: -2,
          backgroundColor: PLAYHEAD_COLOR,
          color: '#fff',
          fontSize: '10px',
          fontWeight: '500',
          padding: '2px 6px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: isDragging ? 1 : 0.8,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s'
        }}
      >
        {formatTime(currentTime)}
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            left: PLAYHEAD_WIDTH / 2 - 4,
            top: PLAYHEAD_TRIANGLE_SIZE,
            width: 8,
            height: height - PLAYHEAD_TRIANGLE_SIZE,
            border: `2px dashed rgba(255, 255, 255, 0.7)`,
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
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
