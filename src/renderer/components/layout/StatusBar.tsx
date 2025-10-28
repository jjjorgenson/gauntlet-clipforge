/**
 * StatusBar Component - Application Status Bar
 * 
 * Displays project information, playback status, and performance metrics.
 * Uses useStore() to display current state.
 */

import React from 'react';
import { useStore } from '../../store';

export const StatusBar: React.FC = () => {
  const { timeline, project, app, recording, export: exportStore } = useStore();

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get project name
  const projectName = project.project?.name || 'Untitled Project';
  
  // Get saved status
  const savedStatus = project.isDirty ? 'Unsaved' : 'Saved';
  
  // Get last saved time
  const lastSaved = project.lastSavedAt 
    ? project.lastSavedAt.toLocaleTimeString()
    : 'Never';

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between text-sm text-gray-400">
        {/* Left Section - Time Information */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Time:</span>
            <span className="text-white font-mono">
              {formatTime(timeline.currentTime)}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-white font-mono">
              {formatTime(timeline.duration)}
            </span>
          </div>
          
          {timeline.isPlaying && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400">Recording</span>
            </div>
          )}
        </div>

        {/* Center Section - Performance Metrics */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">FPS:</span>
            <span className="text-white font-mono">{app.fps}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Memory:</span>
            <span className="text-white font-mono">
              {formatFileSize(app.memoryUsage * 1024 * 1024)}
            </span>
          </div>
          
          {recording.isRecording && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Recording:</span>
              <span className="text-red-400 font-mono">
                {formatTime(recording.duration)}
              </span>
            </div>
          )}
          
          {exportStore.isExporting && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Export:</span>
              <span className="text-blue-400 font-mono">
                {Math.round(exportStore.progress)}%
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Project Information */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Project:</span>
            <span className="text-white">{projectName}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              project.isDirty ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className={project.isDirty ? 'text-yellow-400' : 'text-green-400'}>
              {savedStatus}
            </span>
          </div>
          
          {project.lastSavedAt && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Last saved:</span>
              <span className="text-white">{lastSaved}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export default
export default StatusBar;
