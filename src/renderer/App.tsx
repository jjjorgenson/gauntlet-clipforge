/**
 * Root React Component
 * Track 8 Test: Media Library UI
 */

import React, { useState, useEffect } from 'react';
import { MediaLibrary } from './components/media/MediaLibrary';
import { VideoPreview } from './components/preview/VideoPreview';
import { Timeline } from './components/timeline/Timeline';
import { RecordDialog } from './components/recording/RecordDialog';
import { Toolbar } from './components/layout/Toolbar';

export const App: React.FC = () => {
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const handleRecordingComplete = (filePath: string) => {
    console.log('Recording completed and saved:', filePath);
    alert(`Recording saved successfully!\nFile: ${filePath}`);
  };

  return (
    <div className="h-screen bg-editor-bg text-white flex flex-col">
      {/* Header with branding */}
      <div className="bg-editor-panel border-b border-editor-border px-6 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-400">🎬 ClipForge</h1>
          <p className="text-xs text-gray-400 ml-3">Desktop Video Editor</p>
        </div>
      </div>

      {/* Toolbar with actions */}
      <Toolbar />

      {/* Main Content Area with balanced grid */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Media Library Panel - 3 columns */}
        <div className="col-span-3 border-r border-editor-border flex flex-col">
          <MediaLibrary />
        </div>

        {/* Center Panel - 9 columns (Video + Timeline) - Full width without right panel */}
        <div className="col-span-9 flex flex-col">
          {/* Video Preview - takes most space, minimum to keep controls visible */}
          <div className="flex-1 min-h-[400px] border-b border-editor-border flex flex-col">
            <VideoPreview />
          </div>
          {/* Timeline - fixed compact height, tracks scroll vertically if needed */}
          <div className="h-64 bg-gray-900 flex-shrink-0">
            <Timeline className="h-full" />
          </div>
        </div>
      </div>

      {/* Recording Dialog */}
      <RecordDialog
        isOpen={isRecordDialogOpen}
        onClose={() => setIsRecordDialogOpen(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </div>
  );
};

