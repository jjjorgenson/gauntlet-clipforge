/**
 * Trim Dialog Component
 * 
 * Simple dialog for trimming clips with start/end time inputs.
 */

import React, { useState } from 'react';
import { Clip } from '@types';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';

interface TrimDialogProps {
  clip: Clip | null;
  onConfirm: (clipId: string, startTime: number, endTime: number) => void;
  onCancel: () => void;
}

export const TrimDialog: React.FC<TrimDialogProps> = ({ clip, onConfirm, onCancel }) => {
  const [startTime, setStartTime] = useState(clip?.trimIn.toFixed(2) || '0.00');
  const [endTime, setEndTime] = useState(clip?.trimOut.toFixed(2) || '0.00');
  const [error, setError] = useState('');

  if (!clip) return null;

  const clipName = clip.sourceFile.split(/[/\\]/).pop() || 'Unknown';
  const currentDuration = clip.trimOut - clip.trimIn;
  const newDuration = parseFloat(endTime) - parseFloat(startTime);

  const handleConfirm = () => {
    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    // Validation
    if (isNaN(start) || start < 0) {
      setError('Invalid start time');
      return;
    }

    if (isNaN(end) || end <= start) {
      setError('End time must be greater than start time');
      return;
    }

    if (end > clip.metadata.duration) {
      setError(`End time cannot exceed video duration (${clip.metadata.duration.toFixed(2)}s)`);
      return;
    }

    onConfirm(clip.id, start, end);
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onCancel}
      title="✂️ Trim Clip"
      className="w-96"
    >
      <div className="space-y-4">
        {/* Clip info */}
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-300 font-medium truncate">{clipName}</p>
          <p className="text-xs text-gray-500 mt-1">
            Current: {clip.trimIn.toFixed(2)}s → {clip.trimOut.toFixed(2)}s ({currentDuration.toFixed(2)}s)
          </p>
        </div>

        {/* Start time input */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">
            Start Time (seconds)
          </label>
          <input
            id="startTime"
            type="number"
            step="0.01"
            min="0"
            max={clip.metadata.duration}
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setError('');
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* End time input */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">
            End Time (seconds)
          </label>
          <input
            id="endTime"
            type="number"
            step="0.01"
            min="0"
            max={clip.metadata.duration}
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setError('');
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration preview */}
        {!isNaN(newDuration) && newDuration > 0 && (
          <div className="bg-blue-900/30 border border-blue-700 rounded p-2">
            <p className="text-sm text-blue-300">
              New duration: <span className="font-semibold">{newDuration.toFixed(2)}s</span>
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded p-2">
            <p className="text-sm text-red-300">❌ {error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Trim Clip
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

