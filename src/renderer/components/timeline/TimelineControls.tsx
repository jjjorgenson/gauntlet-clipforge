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
          onClick={onZoomOut}
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
          onClick={onZoomIn}
          disabled={zoom >= maxZoom}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          +
        </Button>
        
        <Button
          onClick={onFitToWindow}
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
          onClick={onAddTrack}
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
          onClick={() => {
            // For now, delete the last track
            // In a real implementation, you'd have track selection
            if (canDeleteTrack && trackCount > 1) {
              onDeleteTrack('track-' + (trackCount - 1));
            }
          }}
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

      {/* Timeline Info */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Timeline</span>
        <span className="text-gray-600">•</span>
        <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
