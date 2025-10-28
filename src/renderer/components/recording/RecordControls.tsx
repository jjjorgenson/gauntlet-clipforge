/**
 * RecordControls Component
 * 
 * Start/Stop/Save controls with countdown timer and duration display.
 * Handles the recording flow and provides visual feedback.
 */

import React from 'react';
import { Button } from '../common/Button';
import { RecordingSource } from '../../../shared/types';

export interface RecordControlsProps {
  selectedSource: RecordingSource | null;
  isRecording: boolean;
  isCountdown: boolean;
  countdownValue: number;
  recordingDuration: number;
  recordedBlob: Blob | null;
  isSaving: boolean;
  onStartCountdown: () => void;
  onStopRecording: () => void;
  onSaveRecording: () => void;
}

export const RecordControls: React.FC<RecordControlsProps> = ({
  selectedSource,
  isRecording,
  isCountdown,
  countdownValue,
  recordingDuration,
  recordedBlob,
  isSaving,
  onStartCountdown,
  onStopRecording,
  onSaveRecording,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canStartRecording = selectedSource && !isRecording && !isCountdown && !recordedBlob;
  const canStopRecording = isRecording;
  const canSaveRecording = recordedBlob && !isRecording && !isSaving;

  return (
    <div className="record-controls">
      <h3 className="text-lg font-medium text-white mb-4">Recording Controls</h3>

      {/* Recording Status */}
      <div className="bg-editor-panel rounded-lg p-4 mb-6">
        {isCountdown ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-400 mb-2 animate-pulse">
              {countdownValue}
            </div>
            <p className="text-gray-400">Get ready to record...</p>
          </div>
        ) : isRecording ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-2xl font-bold text-red-400">
                {formatDuration(recordingDuration)}
              </span>
            </div>
            <p className="text-gray-400">Recording in progress...</p>
          </div>
        ) : recordedBlob ? (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {formatDuration(recordingDuration)}
            </div>
            <p className="text-gray-400 mb-2">Recording completed!</p>
            <p className="text-sm text-gray-500">
              Size: {formatFileSize(recordedBlob.size)}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Ready to record</p>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        {/* Start Recording Button */}
        <Button
          onClick={onStartCountdown}
          disabled={!canStartRecording}
          className={`
            w-full py-4 text-lg font-medium transition-all
            ${canStartRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {!selectedSource ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Select a source first</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>Start Recording</span>
            </div>
          )}
        </Button>

        {/* Stop Recording Button */}
        <Button
          onClick={onStopRecording}
          disabled={!canStopRecording}
          className={`
            w-full py-3 font-medium transition-all
            ${canStopRecording
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            <span>Stop Recording</span>
          </div>
        </Button>

        {/* Save Recording Button */}
        <Button
          onClick={onSaveRecording}
          disabled={!canSaveRecording}
          className={`
            w-full py-3 font-medium transition-all
            ${canSaveRecording
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Recording</span>
              </>
            )}
          </div>
        </Button>
      </div>

      {/* Recording Info */}
      {selectedSource && (
        <div className="mt-6 p-4 bg-editor-panel rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Recording Settings</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Source:</span>
              <span className="text-white">{selectedSource.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="text-white capitalize">{selectedSource.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="text-white">WebM (VP9)</span>
            </div>
            <div className="flex justify-between">
              <span>Quality:</span>
              <span className="text-white">High (1080p)</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-editor-panel rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-400">
            <p className="font-medium text-blue-400 mb-1">Recording Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Select a source before starting recording</li>
              <li>• 3-second countdown before recording begins</li>
              <li>• Recording duration is displayed in real-time</li>
              <li>• Click Stop when finished, then Save to file</li>
              <li>• Saved recordings are added to media library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
