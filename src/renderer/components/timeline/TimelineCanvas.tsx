/**
 * Timeline Canvas Component
 * 
 * Renders timeline tracks, clips, and playhead using React components.
 * Handles drag state and interactions.
 */

import React, { useCallback, useRef } from 'react';
import { Track, Clip } from '@types';
import { TimelineClip } from './TimelineClip';
import { Playhead } from './Playhead';

// Timeline rendering constants
const TRACK_HEIGHT = 60;
const TRACK_MARGIN = 4;
const CLIP_MARGIN = 2;
const CLIP_HEIGHT = 52; // TRACK_HEIGHT - 8
const RULER_HEIGHT = 40; // Height of time ruler at top
const PIXELS_PER_SECOND_BASE = 100; // Base pixels per second at zoom 1.0

// Colors
const COLORS = {
  trackBackground: '#2a2a2a',
  trackBorder: '#444',
  gridLine: '#333'
};

export const TimelineCanvas: React.FC<{
  tracks: Track[];
  currentTime: number;
  zoom: number;
  scrollLeft: number;
  selectedClipIds: string[];
  isGridSnapEnabled: boolean;
  dragState: {
    isDragging: boolean;
    dragType: 'clip' | 'trim-left' | 'trim-right' | 'playhead' | null;
    dragClipId: string | null;
    dragStartX: number;
    dragStartTime: number;
    dragOffset: number;
  };
  onClipClick: (clipId: string, multiSelect: boolean) => void;
  onClipDragStart: (clipId: string, mouseX: number, mouseY: number) => void;
  onClipDragEnd: (clipId: string, trackId: string, position: number) => void;
  onTrimHandleDrag: (clipId: string, handle: 'start' | 'end', delta: number) => void;
  onPlayheadDrag: (time: number) => void;
  onTrim?: (clipId: string) => void;
  onSplit?: (clipId: string) => void;
}> = ({
  tracks,
  currentTime,
  zoom,
  scrollLeft,
  selectedClipIds,
  isGridSnapEnabled,
  dragState,
  onClipClick,
  onClipDragStart,
  onClipDragEnd,
  onTrimHandleDrag,
  onPlayheadDrag,
  onTrim,
  onSplit
}) => {
  // Calculate pixels per second based on zoom
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  // Convert time to pixels
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  // Calculate duration for grid lines
  const duration = Math.max(...tracks.map(t => Math.max(...t.clips.map(c => c.endTime), 0)), 10);

  // Calculate the total width of the timeline based on duration and zoom
  // Add extra padding at the end (20% of duration or minimum 5 seconds)
  const paddingTime = Math.max(duration * 0.2, 5);
  const totalDuration = duration + paddingTime;
  const timelineWidth = totalDuration * pixelsPerSecond;

  // Ref to the timeline canvas container for coordinate calculations
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'relative',
        width: `${timelineWidth}px`, // Set explicit width based on duration
        minHeight: '100%',
        backgroundColor: COLORS.trackBackground
      }}
    >
      {/* Render tracks */}
      {tracks.map((track, trackIndex) => {
        // Track Y calculation - container already has marginTop for ruler, so tracks start at 0
        const trackY = trackIndex * (TRACK_HEIGHT + TRACK_MARGIN);
        
        return (
          <div key={track.id}>
            {/* Track background */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: trackY,
                width: '100%',
                height: TRACK_HEIGHT, // Track background height (60px), margin is spacing between tracks
                backgroundColor: COLORS.trackBackground,
                borderBottom: `1px solid ${COLORS.trackBorder}`
              }}
            >
              {/* Track label - centered on left side */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 500,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '11px', minWidth: '1.5rem' }}>
                  {trackIndex + 1}
                </span>
                <span style={{ color: '#e5e5e5' }}>{track.name}</span>
              </div>
            </div>
            
            {/* Render clips in this track */}
            {track.clips.map((clip) => {
              const clipX = timeToPixels(clip.startTime);
              const clipWidth = timeToPixels(clip.endTime) - clipX;
              // Center clip vertically within track row (60px height): (TRACK_HEIGHT - CLIP_HEIGHT) / 2 = (60 - 52) / 2 = 4px
              const clipY = trackY + (TRACK_HEIGHT - CLIP_HEIGHT) / 2;
              
              return (
                <TimelineClip
                  key={clip.id}
                  clip={clip}
                  isSelected={selectedClipIds.includes(clip.id)}
                  isDragging={dragState.isDragging && dragState.dragClipId === clip.id}
                  dragType={dragState.dragClipId === clip.id && dragState.dragType !== 'playhead' ? dragState.dragType : null}
                  x={clipX}
                  y={clipY}
                  width={clipWidth}
                  zoom={zoom}
                  currentTime={currentTime}
                  canvasRef={canvasRef}
                  onSelect={(clipId) => onClipClick(clipId, false)}
                  onDragStart={(clipId, dragType, mouseX, mouseY) => {
                    if (dragType === 'clip') {
                      onClipDragStart(clipId, mouseX, mouseY);
                    } else if (dragType === 'trim-left') {
                      onTrimHandleDrag(clipId, 'start', 0);
                    } else if (dragType === 'trim-right') {
                      onTrimHandleDrag(clipId, 'end', 0);
                    }
                  }}
                  onTrim={onTrim}
                  onSplit={onSplit}
                />
              );
            })}
          </div>
        );
      })}
      
      {/* Render playhead */}
      <Playhead
        currentTime={currentTime}
        duration={duration}
        zoom={zoom}
        scrollLeft={scrollLeft}
        height={tracks.length * (TRACK_HEIGHT + TRACK_MARGIN)}
        isDragging={dragState.isDragging && dragState.dragType === 'playhead'}
        onSeek={onPlayheadDrag}
      />
      
      {/* Grid lines */}
      {Array.from({ length: Math.ceil(duration / 1) + 1 }, (_, i) => {
        const time = i * 1; // Every second
        const x = timeToPixels(time);
        
        if (x < -100 || x > 2000) return null; // Only render visible lines
        
        return (
          <div
            key={time}
            style={{
              position: 'absolute',
              left: x,
              top: 0, // Start at 0 since container already accounts for ruler with marginTop
              width: isGridSnapEnabled ? 2 : 1, // Thicker when snap enabled
              height: tracks.length * (TRACK_HEIGHT + TRACK_MARGIN),
              backgroundColor: isGridSnapEnabled ? '#4a90e2' : COLORS.gridLine,
              opacity: isGridSnapEnabled ? 0.5 : 0.3,
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}
    </div>
  );
};