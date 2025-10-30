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
  currentTime: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (clipId: string) => void;
  onDragStart: (clipId: string, dragType: 'clip' | 'trim-left' | 'trim-right', mouseX: number, mouseY: number) => void;
  onTrim?: (clipId: string) => void;
  onSplit?: (clipId: string) => void;
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
  currentTime,
  canvasRef,
  onSelect,
  onDragStart,
  onTrim,
  onSplit
}) => {
  // Calculate clip dimensions
  const clipWidth = Math.max(width, 20); // Minimum width for visibility
  const showTrimHandles = clipWidth > 40 && zoom > 0.5; // Show handles when zoomed in enough

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Timeline's handler, use callback instead
    
    // Get mouse position relative to the clip element (for hit detection)
    const clipRect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - clipRect.left;
    const localY = e.clientY - clipRect.top;
    
    // Get mouse position relative to the timeline canvas container using the ref
    if (!canvasRef.current) {
      console.error('❌ TimelineClip: canvasRef is not available');
      return;
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseXInCanvas = e.clientX - canvasRect.left;
    const mouseYInCanvas = e.clientY - canvasRect.top;
    
    // Determine hit region
    let hitDragType: 'clip' | 'trim-left' | 'trim-right' = 'clip';
    if (showTrimHandles) {
      if (localX <= TRIM_HANDLE_WIDTH) {
        hitDragType = 'trim-left';
      } else if (localX >= clipWidth - TRIM_HANDLE_WIDTH) {
        hitDragType = 'trim-right';
      }
    }
    
    console.log('🎬 TimelineClip mouseDown:', {
      localX: localX.toFixed(1) + 'px',
      localY: localY.toFixed(1) + 'px',
      clipX: x.toFixed(1) + 'px',
      clipY: y.toFixed(1) + 'px',
      mouseXInCanvas: mouseXInCanvas.toFixed(1) + 'px',
      mouseYInCanvas: mouseYInCanvas.toFixed(1) + 'px',
      clientY: e.clientY.toFixed(1) + 'px',
      canvasTop: canvasRect.top.toFixed(1) + 'px',
      clipTop: clipRect.top.toFixed(1) + 'px',
      hitRegion: hitDragType
    });
    
    onSelect(clip.id);
    onDragStart(clip.id, hitDragType, mouseXInCanvas, mouseYInCanvas); // Pass mouse position in timeline canvas coordinates
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For now, we'll use a simple approach:
    // - If playhead is within clip, show option to split
    // - Always show option to trim
    const isPlayheadInClip = currentTime > clip.startTime + 0.1 && currentTime < clip.endTime - 0.1;
    
    // Create simple context menu (could be enhanced with a proper menu component)
    const menuItems = [];
    
    if (isPlayheadInClip && onSplit) {
      menuItems.push('Split at Playhead (S)');
    }
    
    if (onTrim) {
      menuItems.push('Trim Clip...');
    }
    
    menuItems.push('Delete Clip');
    
    // For now, just trigger the first action
    // In a real implementation, you'd show a proper context menu
    if (isPlayheadInClip && onSplit) {
      // Show alert asking which action
      const choice = window.confirm('Split clip at playhead? (Cancel to open Trim dialog)');
      if (choice) {
        onSplit(clip.id);
      } else if (onTrim) {
        onTrim(clip.id);
      }
    } else if (onTrim) {
      onTrim(clip.id);
    }
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

  // Get aspect ratio display
  const getAspectRatioDisplay = (): string => {
    const { width, height } = clip.metadata.resolution;
    const aspectRatio = width / height;
    
    // Common aspect ratios
    if (Math.abs(aspectRatio - 16/9) < 0.01) return '16:9';
    if (Math.abs(aspectRatio - 4/3) < 0.01) return '4:3';
    if (Math.abs(aspectRatio - 21/9) < 0.01) return '21:9';
    if (Math.abs(aspectRatio - 1) < 0.01) return '1:1';
    if (Math.abs(aspectRatio - 9/16) < 0.01) return '9:16'; // Vertical
    
    return `${width}×${height}`;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
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
        overflow: 'hidden',
        // Enhanced drag feedback
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isDragging 
          ? '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.5)' 
          : 'none',
        transition: isDragging ? 'none' : 'all 0.15s ease',
        zIndex: isDragging ? 100 : 1
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
          flexDirection: 'row',
          gap: '4px',
          marginLeft: showTrimHandles ? TRIM_HANDLE_WIDTH : 0,
          marginRight: showTrimHandles ? TRIM_HANDLE_WIDTH : 0,
          overflow: 'hidden',
          alignItems: 'center'
        }}
      >
        {/* Thumbnail preview (if clip is wide enough) */}
        {clipWidth > 80 && (
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#1a1a1a',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                color: '#666',
                fontSize: '20px'
              }}
            >
              🎬
            </div>
          </div>
        )}
        
        {/* Text content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            height: '100%',
            paddingTop: '2px',
            paddingBottom: '2px'
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

          {/* Aspect ratio badge */}
          {clipWidth > 100 && (
            <div
              style={{
                fontSize: '9px',
                opacity: 0.7,
                color: COLORS.text,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '1px 4px',
                borderRadius: '3px',
                alignSelf: 'flex-start',
                whiteSpace: 'nowrap'
              }}
            >
              {getAspectRatioDisplay()}
            </div>
          )}

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
