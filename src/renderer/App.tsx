/**
 * Root React Component
 * Track 8 Test: Media Library UI
 */

import React, { useState, useCallback } from 'react';
import { MediaLibrary } from './components/media/MediaLibrary';
import { VideoPreview } from './components/preview/VideoPreview';
import { Timeline } from './components/timeline/Timeline';
import { RecordDialog } from './components/recording/RecordDialog';
import { RecordingDrawer } from './components/recording/RecordingDrawer';
import { Toolbar } from './components/layout/Toolbar';
import { ResizableSplitter } from './components/layout/ResizableSplitter';
import { useMediaStore } from './store/mediaStore';
import { RecordingSource } from '../shared/types';

export const App: React.FC = () => {
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isRecordingDrawerOpen, setIsRecordingDrawerOpen] = useState(false);
  const [selectedRecordingSource, setSelectedRecordingSource] = useState<RecordingSource | null>(null);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const addItems = useMediaStore((state) => state.addItems);
  
  // Panel size state (percentages)
  // Media Library width (horizontal split)
  const [mediaLibraryWidth, setMediaLibraryWidth] = useState(25);
  // Video Preview height (vertical split within main content)
  const [videoPreviewHeight, setVideoPreviewHeight] = useState(60);

  // Handle Record button click - open source selector dialog
  const handleRecordClick = () => {
    console.log('🔴 Opening source selector dialog');
    setIsRecordDialogOpen(true);
  };

  // Handle source selection - start preview and open drawer
  const handleSourceSelected = async (source: RecordingSource) => {
    console.log('🎥 Source selected:', source.name);
    setSelectedRecordingSource(source);
    
    // Start preview stream acquisition
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080,
            minFrameRate: 24,
            maxFrameRate: 60
          }
        } as any
      });
      
      console.log('✅ Preview stream acquired');
      setRecordingStream(stream);
      setIsRecordingDrawerOpen(true);
    } catch (error) {
      console.error('❌ Failed to acquire preview stream:', error);
      alert('Failed to access the selected source. Please try again.');
      setSelectedRecordingSource(null);
    }
  };

  // Handle drawer close after successful save
  const handleDrawerClose = () => {
    console.log('✅ Recording complete, cleaning up');
    handleCancelRecording();
  };

  // Handle cancel/dismiss - stop preview and close drawer
  const handleCancelRecording = () => {
    console.log('🛑 Canceling recording preview');
    
    // Stop recording stream
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop());
      setRecordingStream(null);
    }
    
    // Reset state
    setIsRecordingDrawerOpen(false);
    setSelectedRecordingSource(null);
  };

  // App-wide drag & drop handler for importing files
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    // Only handle file drops (not internal drags like timeline clips)
    if (e.dataTransfer.types.includes('application/clipforge-clip')) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v'].includes(extension || '');
    });

    if (videoFiles.length === 0) {
      return;
    }

    try {
      console.log(`📤 Processing ${videoFiles.length} dropped files...`);
      
      const filePaths: string[] = [];
      
      // Try direct path access first (works if sandbox: false)
      for (const file of videoFiles) {
        const electronFile = file as File & { path?: string };
        
        if (electronFile.path) {
          // Path available directly (sandbox disabled)
          filePaths.push(electronFile.path);
          console.log(`✅ Got path directly: ${electronFile.path}`);
        } else {
          // Path not available (sandbox enabled) - use IPC
          console.log(`📦 Reading file as buffer: ${file.name}`);
          
          // Read file as ArrayBuffer (browser-safe)
          const arrayBuffer = await file.arrayBuffer();
          // Convert to Uint8Array (browser-safe, IPC will handle conversion)
          const uint8Array = new Uint8Array(arrayBuffer);
          
          console.log(`📤 Sending buffer to main process (${uint8Array.length} bytes)...`);
          
          // Send to main process to save to temp and get path
          const result = await window.api.media.saveDroppedFile({
            filename: file.name,
            buffer: uint8Array as any, // IPC will convert to Buffer in main process
            mimeType: file.type,
          });
          
          filePaths.push(result.filePath);
          console.log(`✅ Saved to temp: ${result.filePath}`);
        }
      }

      if (filePaths.length === 0) {
        console.warn('⚠️ No valid file paths extracted');
        return;
      }

      console.log(`📤 Importing ${filePaths.length} files via IPC:`, filePaths);
      
      // Import files using existing media.import IPC
      const importResult = await window.api.media.import({
        filePaths
      });

      if (importResult.clips && importResult.clips.length > 0) {
        addItems(importResult.clips);
        console.log(`✅ Successfully imported ${importResult.clips.length} clips`);
      } else {
        console.error('❌ No clips were imported');
      }

    } catch (error) {
      console.error('❌ Drop import failed:', error);
      alert(`Failed to import files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addItems]);

  return (
    <div 
      className="h-screen bg-editor-bg text-white flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header with branding */}
      <div className="bg-editor-panel border-b border-editor-border px-6 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-400">🎬 ClipForge</h1>
          <p className="text-xs text-gray-400 ml-3">Desktop Video Editor</p>
        </div>
      </div>

      {/* Toolbar with actions */}
      <Toolbar 
        onRecordClick={handleRecordClick}
        isRecordingDrawerOpen={isRecordingDrawerOpen}
      />

      {/* Recording Drawer */}
      <RecordingDrawer
        isOpen={isRecordingDrawerOpen}
        selectedSource={selectedRecordingSource}
        displayStream={recordingStream}
        onClose={handleDrawerClose}
        onCancel={handleCancelRecording}
      />

      {/* Main Content Area with resizable panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Media Library Panel */}
        <div 
          className="border-r border-editor-border flex flex-col flex-shrink-0"
          style={{ width: `${mediaLibraryWidth}%`, minWidth: '150px' }}
        >
          <MediaLibrary />
        </div>

        {/* Horizontal Splitter - Media Library / Main Content */}
        <ResizableSplitter
          orientation="horizontal"
          position={mediaLibraryWidth}
          onResize={setMediaLibraryWidth}
          minPosition={15}
          maxPosition={40}
        />

        {/* Main Content Panel (Video Preview + Timeline) */}
        <div 
          className="flex flex-col flex-1 min-w-0"
          style={{ width: `${100 - mediaLibraryWidth}%` }}
        >
          {/* Video Preview */}
          <div 
            className="border-b border-editor-border flex flex-col flex-shrink-0 overflow-hidden"
            style={{ 
              height: `${videoPreviewHeight}%`,
              minHeight: '300px'
            }}
          >
            <VideoPreview recordingStream={recordingStream} />
          </div>

          {/* Vertical Splitter - Video Preview / Timeline */}
          <ResizableSplitter
            orientation="vertical"
            position={videoPreviewHeight}
            onResize={setVideoPreviewHeight}
            minPosition={30}
            maxPosition={85}
          />

          {/* Timeline */}
          <div 
            className="bg-gray-900 flex-shrink-0 min-h-0"
            style={{ 
              height: `${100 - videoPreviewHeight}%`,
              minHeight: '200px'
            }}
          >
            <Timeline className="h-full" />
          </div>
        </div>
      </div>

      {/* Recording Source Selector Dialog */}
      <RecordDialog
        isOpen={isRecordDialogOpen}
        onClose={() => setIsRecordDialogOpen(false)}
        onSourceSelected={handleSourceSelected}
      />
    </div>
  );
};

