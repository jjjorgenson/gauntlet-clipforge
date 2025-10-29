/**
 * Root React Component
 * Track 8 Test: Media Library UI
 */

import React, { useState, useEffect } from 'react';
import { MediaLibrary } from './components/media/MediaLibrary';
import { VideoPreview } from './components/preview/VideoPreview';
import { Timeline } from './components/timeline/Timeline';
import { RecordDialog } from './components/recording/RecordDialog';

export const App: React.FC = () => {
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const handleRecordingComplete = (filePath: string) => {
    console.log('Recording completed and saved:', filePath);
    alert(`Recording saved successfully!\nFile: ${filePath}`);
  };

  return (
    <div className="h-screen bg-editor-bg text-white flex flex-col">
      {/* Header */}
      <div className="bg-editor-panel border-b border-editor-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">🎬 ClipForge</h1>
            <p className="text-sm text-gray-400">Desktop Video Editor</p>
          </div>
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordDialogOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg text-sm font-medium transition-all duration-150 ease-out shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              🔴 Record
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with balanced grid */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Media Library Panel - 3 columns */}
        <div className="col-span-3 border-r border-editor-border flex flex-col">
          <MediaLibrary />
        </div>

        {/* Center Panel - 9 columns (Video + Timeline) - Full width without right panel */}
        <div className="col-span-9 flex flex-col">
          {/* Video Preview - takes 60% of vertical space */}
          <div className="h-3/5 border-b border-editor-border">
            <VideoPreview />
          </div>
          {/* Timeline - takes 40% of vertical space */}
          <div className="h-2/5 bg-gray-900">
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

