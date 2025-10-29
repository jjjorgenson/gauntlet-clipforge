/**
 * Toolbar Component - Action Toolbar
 * 
 * Icon buttons for common actions: Import, Record, Export, Play/Pause.
 * Uses Button from common components and triggers store actions.
 */

import React from 'react';
import { useStore } from '../../store';
import { useTimelineStore } from '../../store/timelineStore';
import { Button } from '../common';

export const Toolbar: React.FC = () => {
  const { recording, export: exportStore, media, app } = useStore();
  
  // Direct subscriptions to timeline store for reactive updates
  const duration = useTimelineStore((state) => state.duration);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const seek = useTimelineStore((state) => state.seek);
  const zoom = useTimelineStore((state) => state.zoom);
  const setZoom = useTimelineStore((state) => state.setZoom);

  // Handle import action
  const handleImport = async () => {
    try {
      // Use the media API to open file picker
      if (window.api?.media?.openFilePicker) {
        const result = await window.api.media.openFilePicker({
          allowMultiple: true,
          filters: [
            { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (result.filePaths && result.filePaths.length > 0) {
          // Process imported files
          console.log('Imported files:', result.filePaths);
          // In a real implementation, this would process the files and add them to media store
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  // Handle record action
  const handleRecord = async () => {
    try {
      if (!recording.isRecording) {
        // Load available sources first
        await recording.loadSources();
        // Show source picker
        recording.setShowSourcePicker(true);
      } else {
        // Stop recording
        const outputPath = await recording.stopRecording();
        console.log('Recording saved to:', outputPath);
      }
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  // Handle export action
  const handleExport = async () => {
    console.log('🎬 Export button clicked!');
    
    try {
      // Get current timeline tracks
      const tracks = useTimelineStore.getState().tracks;
      const allClips = tracks.flatMap(track => track.clips);
      
      console.log('📊 Clips to export:', allClips.length);
      
      if (allClips.length === 0) {
        alert('⚠️ Add clips to timeline first!');
        return;
      }
      
      // Show save dialog
      const result = await window.api.project.openSaveDialog({
        defaultPath: 'output.mp4'
      });
      
      console.log('💾 Save dialog result:', result);
      
      if (!result.filePath) {
        console.log('❌ Export canceled');
        return;
      }
      
      console.log('📤 Exporting to:', result.filePath);
      alert('🎬 Exporting... (This will take a moment)');
      
      // Call export via IPC with correct format
      await window.api.export.start({
        config: {
          outputPath: result.filePath,
          quality: 'medium',
          resolution: { width: 1920, height: 1080 },
          fps: 30,
          codec: 'h264'
        },
        timeline: {
          tracks: tracks
        }
      });
      
      alert('✅ Export complete!\n' + result.filePath);
      
      // Open file location
      await window.api.system.showItem({ path: result.filePath });
      
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      alert('❌ Export failed: ' + error.message);
    }
  };

  // Handle play/pause action
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Handle seek to beginning
  const handleSeekToStart = () => {
    seek(0);
  };

  // Handle seek to end
  const handleSeekToEnd = () => {
    seek(duration);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeekToStart}
            aria-label="Seek to beginning"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeekToEnd}
            aria-label="Seek to end"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6l8.5 6L6 18V6zm10-1v14h2V5h-2z"/>
            </svg>
          </Button>
        </div>

        {/* Main Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleImport}
            aria-label="Import media files"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import
          </Button>

          <Button
            variant={recording.isRecording ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleRecord}
            aria-label={recording.isRecording ? 'Stop recording' : 'Start recording'}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill={recording.isRecording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"/>
            </svg>
            {recording.isRecording ? 'Stop' : 'Record'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={exportStore.isExporting}
            aria-label="Export video"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            {exportStore.isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center space-x-2 ml-auto border-l border-gray-600 pl-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </Button>
          
          <span className="text-sm text-gray-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(5.0, zoom + 0.1))}
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Export default
export default Toolbar;
