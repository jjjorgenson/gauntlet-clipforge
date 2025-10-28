/**
 * Timeline Clip Component
 * 
 * Renders individual clips with trim handles and hit detection.
 * Handles visual feedback for drag states and selection.
 */

import React from 'react';
import { Clip } from '@types';

// Clip rendering constants
const CLIP_HEIGHT = 52; // TRACK_HEIGHT - 8
const TRIM_HANDLE_WIDTH = 8;
const TRIM_HANDLE_COLOR = '#666';
const TRIM_HANDLE_HOVER_COLOR = '#888';
const TRIM_HANDLE_ACTIVE_COLOR = '#4a90e2';

// Colors
const COLORS = {
  background: '#4a90e2',
  selected: '#f39c12',
  border: '#666',
  text: '#ffffff',
  trimHandle: TRIM_HANDLE_COLOR,
  trimHandleHover: TRIM_HANDLE_HOVER_COLOR,
  trimHandleActive: TRIM_HANDLE_ACTIVE_COLOR
};

interface TimelineClipProps {
  clip: Clip;
  isSelected: boolean;
  isDragging: boolean;
  dragType: 'clip' | 'trim-left' | 'trim-right' | null;
  x: number;
  y: number;
  width: number;
  zoom: number;
  onSelect: (clipId: string) => void;
  onDragStart: (clipId: string, dragType: 'clip' | 'trim-left' | 'trim-right') => void;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  isSelected,
  isDragging,
  dragType,
  x,
  y,
  width,
  zoom,
  onSelect,
  onDragStart
}) => {
  // Calculate clip dimensions
  const clipWidth = Math.max(width, 20); // Minimum width for visibility
  const showTrimHandles = clipWidth > 40 && zoom > 0.5; // Show handles when zoomed in enough

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    
    // Determine hit region
    let hitDragType: 'clip' | 'trim-left' | 'trim-right' = 'clip';
    if (showTrimHandles) {
      if (localX <= TRIM_HANDLE_WIDTH) {
        hitDragType = 'trim-left';
      } else if (localX >= clipWidth - TRIM_HANDLE_WIDTH) {
        hitDragType = 'trim-right';
      }
    }
    
    onSelect(clip.id);
    onDragStart(clip.id, hitDragType);
  };

  // Format time duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get clip filename
  const getClipName = (): string => {
    const filename = clip.sourceFile.split('/').pop() || 'Unknown';
    return filename.length > 20 ? filename.substring(0, 17) + '...' : filename;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: clipWidth,
        height: CLIP_HEIGHT,
        backgroundColor: isSelected ? COLORS.selected : COLORS.background,
        border: `2px solid ${isSelected ? COLORS.selected : COLORS.border}`,
        borderRadius: '4px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Left trim handle */}
      {showTrimHandles && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: TRIM_HANDLE_WIDTH,
            height: '100%',
            backgroundColor: dragType === 'trim-left' ? COLORS.trimHandleActive : COLORS.trimHandle,
            cursor: 'ew-resize',
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '2px',
              height: '60%',
              backgroundColor: '#fff',
              borderRadius: '1px'
            }}
          />
        </div>
      )}

      {/* Right trim handle */}
      {showTrimHandles && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: TRIM_HANDLE_WIDTH,
            height: '100%',
            backgroundColor: dragType === 'trim-right' ? COLORS.trimHandleActive : COLORS.trimHandle,
            cursor: 'ew-resize',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '2px',
              height: '60%',
              backgroundColor: '#fff',
              borderRadius: '1px'
            }}
          />
        </div>
      )}

      {/* Clip content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginLeft: showTrimHandles ? TRIM_HANDLE_WIDTH : 0,
          marginRight: showTrimHandles ? TRIM_HANDLE_WIDTH : 0,
          overflow: 'hidden'
        }}
      >
        {/* Clip name */}
        <div
          style={{
            color: COLORS.text,
            fontSize: '11px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.2'
          }}
        >
          {getClipName()}
        </div>

        {/* Duration */}
        {clipWidth > 60 && (
          <div
            style={{
              color: COLORS.text,
              fontSize: '10px',
              opacity: 0.8,
              alignSelf: 'flex-end'
            }}
          >
            {formatDuration(clip.endTime - clip.startTime)}
          </div>
        )}
      </div>

      {/* Drag indicator */}
      {isDragging && dragType === 'clip' && (
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            border: `2px dashed ${COLORS.text}`,
            borderRadius: '6px',
            pointerEvents: 'none',
            opacity: 0.7
          }}
        />
      )}

      {/* Trim handle indicators */}
      {isDragging && (dragType === 'trim-left' || dragType === 'trim-right') && (
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: dragType === 'trim-left' ? -2 : 'auto',
            right: dragType === 'trim-right' ? -2 : 'auto',
            bottom: -2,
            width: TRIM_HANDLE_WIDTH + 4,
            border: `2px dashed ${COLORS.text}`,
            borderRadius: '6px',
            pointerEvents: 'none',
            opacity: 0.7
          }}
        />
      )}
    </div>
  );
};
