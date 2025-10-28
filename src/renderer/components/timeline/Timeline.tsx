/**
 * Timeline Component - Main Container
 * 
 * Main timeline container that manages canvas dimensions and wraps all timeline sub-components.
 * Implements TimelineComponentProps.Timeline interface.
 */

import React, { useRef, useEffect, useState } from 'react';
import { TimelineComponentProps } from '../../shared/contracts/components';
import { useTimelineStore } from '../../store/timelineStore';
import { TimelineCanvas } from './TimelineCanvas';
import { TimeRuler } from './TimeRuler';

export const Timeline: React.FC<TimelineComponentProps.Timeline> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
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
    seek
  } = useTimelineStore();

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

  // Handle click on timeline background
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Clicked on timeline background, not on clips
      useTimelineStore.getState().clearSelection();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`timeline-container ${className}`}
      onWheel={handleWheel}
      onClick={handleTimelineClick}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        cursor: 'default'
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
          onClipClick={(clipId, multiSelect) => {
            useTimelineStore.getState().selectClip(clipId, multiSelect);
          }}
          onClipDragStart={(clipId) => {
            // TODO: Implement drag start in PART 2
            console.log('Clip drag start:', clipId);
          }}
          onClipDragEnd={(clipId, trackId, position) => {
            // TODO: Implement drag end in PART 2
            console.log('Clip drag end:', clipId, trackId, position);
          }}
          onTrimHandleDrag={(clipId, handle, delta) => {
            // TODO: Implement trim handle drag in PART 2
            console.log('Trim handle drag:', clipId, handle, delta);
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
