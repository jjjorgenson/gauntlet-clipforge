/**
 * Timeline Controls Component
 * 
 * Provides zoom controls, track management, and timeline navigation.
 * Includes zoom in/out, fit to window, add/delete track buttons.
 */

import React from 'react';
import { Button } from '../common/Button';

interface TimelineControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWindow: () => void;
  onAddTrack: () => void;
  onDeleteTrack: (trackId: string) => void;
  trackCount: number;
  canDeleteTrack: boolean;
  onSplitClip: () => void;
  canSplitClip: boolean;
  onToggleGridSnap: () => void;
  isGridSnapEnabled: boolean;
  className?: string;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onFitToWindow,
  onAddTrack,
  onDeleteTrack,
  trackCount,
  canDeleteTrack,
  onSplitClip,
  canSplitClip,
  onToggleGridSnap,
  isGridSnapEnabled,
  className = ''
}) => {
  // Format zoom percentage
  const formatZoom = (zoomValue: number): string => {
    return `${Math.round(zoomValue * 100)}%`;
  };

  return (
    <div className={`timeline-controls flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700 ${className}`}>
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 mr-2">Zoom:</span>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onZoomOut();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={zoom <= minZoom}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          −
        </Button>
        
        <span className="text-xs text-white min-w-[3rem] text-center">
          {formatZoom(zoom)}
        </span>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onZoomIn();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={zoom >= maxZoom}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          +
        </Button>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onFitToWindow();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs ml-2"
        >
          Fit
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Track Controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 mr-2">Tracks:</span>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddTrack();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          + Track
        </Button>
        
        <span className="text-xs text-white min-w-[2rem] text-center">
          {trackCount}
        </span>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            // For now, delete the last track
            // In a real implementation, you'd have track selection
            if (canDeleteTrack && trackCount > 1) {
              onDeleteTrack('track-' + (trackCount - 1));
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={!canDeleteTrack || trackCount <= 1}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          − Track
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Split Clip Control */}
      <div className="flex items-center gap-1">
        <Button
          onClick={(e) => {
            e.stopPropagation(); // CRITICAL: Prevent click from bubbling to Timeline background handler
            console.log('🔘 BUTTON: Split button clicked in TimelineControls', {
              canSplitClip,
              hasOnSplitClip: typeof onSplitClip === 'function'
            });
            onSplitClip();
            console.log('🔘 BUTTON: onSplitClip() call completed');
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // CRITICAL: Prevent mousedown from bubbling to Timeline background handler
          }}
          disabled={!canSplitClip}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
          title="Split clip at playhead (S)"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Split
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Grid Snap Toggle */}
      <div className="flex items-center gap-1">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleGridSnap();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          variant={isGridSnapEnabled ? "primary" : "ghost"}
          size="sm"
          className="px-2 py-1 text-xs"
          title="Snap to grid (1s intervals)"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4M4 10h4M4 16h4M12 4h4M12 10h4M12 16h4" />
          </svg>
          Grid {isGridSnapEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* Timeline Info */}
      <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
        <span>Timeline</span>
        <span className="text-gray-600">•</span>
        <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
