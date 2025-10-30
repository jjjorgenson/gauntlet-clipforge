/**
 * RecordDialog Component
 * 
 * Simple modal dialog for selecting a recording source (screen/window).
 * Once a source is selected, it passes the selection back to parent and closes.
 */

import React, { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { SourceSelector } from './SourceSelector';
import { RecordingSource } from '../../../shared/types';

export interface RecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceSelected: (source: RecordingSource) => void;
}

export const RecordDialog: React.FC<RecordDialogProps> = ({
  isOpen,
  onClose,
  onSourceSelected,
}) => {
  const [selectedSource, setSelectedSource] = useState<RecordingSource | null>(null);

  const handleSourceSelect = (source: RecordingSource) => {
    setSelectedSource(source);
  };

  const handleConfirm = () => {
    if (selectedSource) {
      onSourceSelected(selectedSource);
      setSelectedSource(null); // Reset for next time
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSource(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Recording Source"
      maxWidth="4xl"
      className="record-dialog"
    >
      <div className="flex flex-col gap-6">
        {/* Source Selection */}
        <SourceSelector
          selectedSource={selectedSource}
          onSourceSelect={handleSourceSelect}
          disabled={false}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-editor-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSource}
            className={`
              px-6 py-2 text-sm font-medium rounded-lg transition-all
              ${selectedSource
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Select Source
          </button>
        </div>
      </div>
    </Dialog>
  );
};
