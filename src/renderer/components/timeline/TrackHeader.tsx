/**
 * Track Header Component
 * 
 * Renders track labels and controls on the left side of the timeline.
 * Shows track name, type, and provides track-specific actions.
 */

import React from 'react';
import { Track } from '@types';

interface TrackHeaderProps {
  track: Track;
  trackIndex: number;
  height: number;
  onTrackClick: (trackId: string) => void;
  onTrackRename: (trackId: string, newName: string) => void;
  onTrackDelete: (trackId: string) => void;
  isSelected: boolean;
  className?: string;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  trackIndex,
  height,
  onTrackClick,
  onTrackRename,
  onTrackDelete,
  isSelected,
  className = ''
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(track.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle double-click to edit
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditName(track.name);
  };

  // Handle edit completion
  const handleEditComplete = () => {
    if (editName.trim() && editName !== track.name) {
      onTrackRename(track.id, editName.trim());
    }
    setIsEditing(false);
  };

  // Handle edit cancellation
  const handleEditCancel = () => {
    setEditName(track.name);
    setIsEditing(false);
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className={`track-header flex items-center justify-between px-2 py-1 border-r border-gray-600 bg-gray-800 hover:bg-gray-750 cursor-pointer select-none ${className}`}
      style={{ height, flexShrink: 0 }}
      onClick={() => onTrackClick(track.id)}
    >
      {/* Track Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Track Number */}
        <span className="text-xs text-gray-500 font-mono min-w-[1.5rem]">
          {trackIndex + 1}
        </span>

        {/* Track Name */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEditComplete}
            onKeyDown={handleKeyPress}
            className="text-xs bg-gray-700 text-white border border-gray-500 rounded px-1 py-0.5 flex-1 min-w-0"
            maxLength={20}
          />
        ) : (
          <span
            className={`text-xs truncate flex-1 min-w-0 ${
              isSelected ? 'text-blue-400 font-medium' : 'text-gray-300'
            }`}
            onDoubleClick={handleDoubleClick}
            title={track.name}
          >
            {track.name}
          </span>
        )}

        {/* Track Type Indicator */}
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full bg-blue-500"
            title="Track"
          />
        </div>
      </div>

      {/* Track Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}
          className="text-xs text-gray-400 hover:text-white px-1"
          title="Rename track"
        >
          ✏️
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTrackDelete(track.id);
          }}
          className="text-xs text-gray-400 hover:text-red-400 px-1"
          title="Delete track"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
