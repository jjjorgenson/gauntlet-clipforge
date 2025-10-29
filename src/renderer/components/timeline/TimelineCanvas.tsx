/**
 * Timeline Canvas Component
 * 
 * Renders timeline tracks, clips, and playhead using React components.
 * Handles drag state and interactions.
 */

import React, { useCallback } from 'react';
import { Track, Clip } from '@types';
import { TimelineClip } from './TimelineClip';
import { Playhead } from './Playhead';

// Timeline rendering constants
const TRACK_HEIGHT = 60;
const TRACK_MARGIN = 4;
const CLIP_MARGIN = 2;
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
  dragState: {
    isDragging: boolean;
    dragType: 'clip' | 'trim-left' | 'trim-right' | 'playhead' | null;
    dragClipId: string | null;
    dragStartX: number;
    dragStartTime: number;
    dragOffset: number;
  };
  onClipClick: (clipId: string, multiSelect: boolean) => void;
  onClipDragStart: (clipId: string) => void;
  onClipDragEnd: (clipId: string, trackId: string, position: number) => void;
  onTrimHandleDrag: (clipId: string, handle: 'start' | 'end', delta: number) => void;
  onPlayheadDrag: (time: number) => void;
  onTrim?: (clipId: string) => void;
}> = ({
  tracks,
  currentTime,
  zoom,
  scrollLeft,
  selectedClipIds,
  dragState,
  onClipClick,
  onClipDragStart,
  onClipDragEnd,
  onTrimHandleDrag,
  onPlayheadDrag,
  onTrim
}) => {
  // Calculate pixels per second based on zoom
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  // Convert time to pixels
  const timeToPixels = useCallback((time: number): number => {
    return time * pixelsPerSecond - scrollLeft;
  }, [pixelsPerSecond, scrollLeft]);

  // Calculate duration for grid lines
  const duration = Math.max(...tracks.map(t => Math.max(...t.clips.map(c => c.endTime), 0)), 10);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: COLORS.trackBackground
      }}
    >
      {/* Render tracks */}
      {tracks.map((track, trackIndex) => {
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
                height: TRACK_HEIGHT,
                backgroundColor: COLORS.trackBackground,
                borderBottom: `1px solid ${COLORS.trackBorder}`
              }}
            />
            
            {/* Render clips in this track */}
            {track.clips.map((clip) => {
              const clipX = timeToPixels(clip.startTime);
              const clipWidth = timeToPixels(clip.endTime) - clipX;
              const clipY = trackY + CLIP_MARGIN;
              
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
                  onSelect={(clipId) => onClipClick(clipId, false)}
                  onDragStart={(clipId, dragType) => {
                    if (dragType === 'clip') {
                      onClipDragStart(clipId);
                    } else if (dragType === 'trim-left') {
                      onTrimHandleDrag(clipId, 'start', 0);
                    } else if (dragType === 'trim-right') {
                      onTrimHandleDrag(clipId, 'end', 0);
                    }
                  }}
                  onTrim={onTrim}
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
              top: 0,
              width: 1,
              height: tracks.length * (TRACK_HEIGHT + TRACK_MARGIN),
              backgroundColor: COLORS.gridLine,
              opacity: 0.3
            }}
          />
        );
      })}
    </div>
  );
};