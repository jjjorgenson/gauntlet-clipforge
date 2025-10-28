/**
 * Export Progress Component
 * 
 * Real-time progress tracking with percentage, frames, FPS,
 * ETA, and cancel functionality.
 */

import React from 'react';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { ExportComponentProps } from '../../../shared/contracts/components';

export const ExportProgress: React.FC<ExportComponentProps.ExportProgress> = ({
  progress,
  currentFrame,
  totalFrames,
  fps,
  eta,
  onCancel
}) => {
  // Format time duration
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">Export Progress</span>
          <span className="text-sm text-gray-400">{progress.toFixed(1)}%</span>
        </div>
        
        <ProgressBar
          value={progress}
          showPercent={false}
        />
      </div>

      {/* Progress Details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Frames */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Frames</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(currentFrame)} / {formatNumber(totalFrames)}
          </div>
          <div className="text-xs text-gray-500">
            {totalFrames > 0 ? ((currentFrame / totalFrames) * 100).toFixed(1) : 0}% complete
          </div>
        </div>

        {/* Encoding Speed */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Encoding Speed</div>
          <div className="text-lg font-semibold text-white">
            {fps.toFixed(1)} FPS
          </div>
          <div className="text-xs text-gray-500">
            {fps > 0 ? 'Real-time' : 'Processing...'}
          </div>
        </div>

        {/* ETA */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
          <div className="text-lg font-semibold text-white">
            {formatTime(eta)}
          </div>
          <div className="text-xs text-gray-500">
            {eta > 0 ? 'Estimated' : 'Calculating...'}
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Status</div>
          <div className="text-lg font-semibold text-white">
            {progress === 100 ? 'Complete' : 'Exporting'}
          </div>
          <div className="text-xs text-gray-500">
            {progress === 100 ? 'Ready!' : 'In progress...'}
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-3">Export Timeline</div>
        <div className="relative">
          {/* Timeline bar */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress indicator */}
          <div 
            className="absolute -top-1 w-4 h-4 bg-white rounded-full border-2 border-blue-500 transform -translate-x-2 transition-all duration-300"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center pt-4 border-t border-gray-700">
        <Button
          onClick={onCancel}
          variant="danger"
          disabled={progress === 100}
        >
          Cancel Export
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500">
        <p>
          Exporting video with FFmpeg. You can safely minimize this window.
        </p>
        <p className="mt-1">
          Cancel will stop the export process and remove any partial files.
        </p>
      </div>
    </div>
  );
};
