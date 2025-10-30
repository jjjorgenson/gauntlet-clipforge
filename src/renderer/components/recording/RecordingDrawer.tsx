/**
 * RecordingDrawer Component
 * 
 * Expandable drawer that slides down from toolbar to show recording controls.
 * Handles the entire recording workflow: start, countdown, record, stop, save/discard.
 */

import React, { useState, useEffect, useRef } from 'react';
import { RecordingSource } from '../../../shared/types';
import { useWebcamStore } from '../../store/webcamStore';
import { useMediaStore } from '../../store/mediaStore';
import { useTimelineStore } from '../../store/timelineStore';

export interface RecordingDrawerProps {
  isOpen: boolean;
  selectedSource: RecordingSource | null;
  displayStream: MediaStream | null;
  onClose: () => void;
  onCancel: () => void;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'stopped';

export const RecordingDrawer: React.FC<RecordingDrawerProps> = ({
  isOpen,
  selectedSource,
  displayStream,
  onClose,
  onCancel,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get webcam state from store
  const { isEnabled: isWebcamEnabled, stream: webcamStream } = useWebcamStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingActiveRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start countdown before recording
  const startCountdown = () => {
    setRecordingState('countdown');
    setCountdown(3);

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          startRecording();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = async () => {
    if (!displayStream) {
      alert('No display stream available');
      return;
    }

    try {
      console.log('🎬 Starting recording...');

      let finalStream = displayStream;
      let isRecordingActive = true;
      let canvasRef: HTMLCanvasElement | null = null;

      // Combine with webcam if enabled
      const webcamStore = useWebcamStore.getState();
      if (isWebcamEnabled && webcamStream) {
        // Create canvas to composite streams
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1080;
        canvasRef = canvas;

        // Create video elements
        const displayVideo = document.createElement('video');
        const webcamVideo = document.createElement('video');
        
        displayVideo.srcObject = displayStream;
        webcamVideo.srcObject = webcamStream;
        
        await displayVideo.play();
        await webcamVideo.play();

        // Get webcam position and size from store
        const webcamPos = webcamStore.position;
        const webcamSize = webcamStore.size;

        // Draw combined video
        const drawFrame = () => {
          if (!isRecordingActive || !ctx) return;

          // Draw display (full screen)
          ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height);
          
          // Calculate webcam overlay position and size
          const webcamX = (webcamPos.x / 100) * canvas.width;
          const webcamY = (webcamPos.y / 100) * canvas.height;
          const webcamW = (webcamSize.width / 100) * canvas.width;
          const webcamH = (webcamSize.height / 100) * canvas.height;

          // Save context state
          ctx.save();
          
          // Mirror the webcam horizontally
          ctx.translate(webcamX + webcamW, webcamY);
          ctx.scale(-1, 1);
          
          // Draw webcam as PiP overlay
          ctx.drawImage(webcamVideo, 0, 0, webcamW, webcamH);
          
          // Restore context state
          ctx.restore();

          requestAnimationFrame(drawFrame);
        };
        drawFrame();

        // Convert canvas to stream
        finalStream = canvas.captureStream(30);
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        isRecordingActive = false;
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Clean up canvas
        if (canvasRef) {
          canvasRef.remove();
        }
        
        console.log('✅ Recording stopped, blob created:', blob.size);
      };

      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;
      setRecordingState('recording');
      startTimeRef.current = Date.now();
      isRecordingActiveRef.current = true;

      // Start duration timer with safety check
      durationTimerRef.current = setInterval(() => {
        if (isRecordingActiveRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      alert('Failed to start recording. Please try again.');
      setRecordingState('idle');
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    // Stop the duration timer immediately
    isRecordingActiveRef.current = false;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    setRecordingState('stopped');
    console.log('✅ Recording stopped, blob will be available for save');
  };

  // Save recording
  const saveRecording = async () => {
    if (!recordedBlob) {
      alert('No recording available to save');
      return;
    }

    setIsSaving(true);

    try {
      console.log('💾 Saving recording...');

      // Convert blob to Uint8Array
      const arrayBuffer = await recordedBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Generate filename
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/T/, '-')
        .replace(/:/g, '-')
        .replace(/\..+/, '');
      const filename = `recording-${timestamp}.webm`;

      // Save via IPC
      const result = await window.api.recording.saveRecording({
        buffer: uint8Array as any,
        filename
      });

      console.log('✅ Recording saved:', result.outputPath);

      // Get metadata
      const metadata = await window.api.media.getMetadata({
        filePath: result.outputPath
      });

      // Create clip
      const newClip = {
        id: '',
        sourceFile: result.outputPath,
        startTime: 0,
        endTime: metadata.metadata.duration,
        trimIn: 0,
        trimOut: metadata.metadata.duration,
        trackId: '',
        metadata: metadata.metadata
      };

      // Add to media library
      const mediaStore = useMediaStore.getState();
      mediaStore.addItems([newClip]);

      // Smart track selection
      const timelineStore = useTimelineStore.getState();
      const tracks = timelineStore.tracks;

      const emptyTrack = tracks.find(track => track.clips.length === 0);

      if (emptyTrack) {
        console.log(`Adding clip to empty track: ${emptyTrack.name}`);
        timelineStore.addClip(newClip, emptyTrack.id, 0);
      } else {
        const newTrackName = `Track ${tracks.length + 1}`;
        console.log(`Creating new track: ${newTrackName}`);
        timelineStore.addTrack(newTrackName);

        const updatedTracks = useTimelineStore.getState().tracks;
        const newTrack = updatedTracks[updatedTracks.length - 1];

        if (newTrack) {
          timelineStore.addClip(newClip, newTrack.id, 0);
        }
      }

      console.log('✅ Recording added to timeline');

      // Reset and close
      handleDiscard();
      onClose();

    } catch (error) {
      console.error('❌ Failed to save recording:', error);
      alert('Failed to save recording.');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard recording
  const handleDiscard = () => {
    setRecordedBlob(null);
    setDuration(0);
    setRecordingState('idle');
  };

  // Handle cancel (X button)
  const handleCancelClick = () => {
    handleDiscard();
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed left-4 z-[100]
        bg-editor-panel border border-editor-border rounded-b-lg shadow-2xl
        transition-all duration-300 ease-out
        ${isOpen ? 'top-14 opacity-100' : 'top-0 opacity-0 pointer-events-none'}
      `}
      style={{ width: '350px' }}
    >
      <div className="p-4">
        {/* Header with X button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-3 h-3 rounded-full
              ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}
            `} />
            <span className="text-sm font-medium text-white">
              {recordingState === 'idle' && 'Ready to Record'}
              {recordingState === 'countdown' && `Starting in ${countdown}...`}
              {recordingState === 'recording' && 'Recording'}
              {recordingState === 'stopped' && 'Recording Complete'}
            </span>
          </div>
          
          <button
            onClick={handleCancelClick}
            disabled={recordingState === 'recording'}
            className={`
              p-1 rounded hover:bg-editor-hover transition-colors
              ${recordingState === 'recording' 
                ? 'opacity-30 cursor-not-allowed' 
                : 'text-gray-400 hover:text-red-400'
              }
            `}
            title="Cancel and close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Source info */}
        {selectedSource && (
          <div className="mb-4 p-3 bg-editor-bg rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Source:</span>
              <span className="text-white font-medium">{selectedSource.name}</span>
              <span className={`
                px-2 py-0.5 text-xs rounded
                ${selectedSource.type === 'screen' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400'
                }
              `}>
                {selectedSource.type === 'screen' ? 'Screen' : 'Window'}
              </span>
            </div>
          </div>
        )}

        {/* Idle state - Start recording controls */}
        {recordingState === 'idle' && (
          <button
            onClick={startCountdown}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Start Recording
          </button>
        )}

        {/* Countdown state */}
        {recordingState === 'countdown' && (
          <div className="py-8 text-center">
            <div className="text-6xl font-bold text-red-500 animate-pulse">
              {countdown}
            </div>
            <p className="text-gray-400 mt-2">Get ready...</p>
          </div>
        )}

        {/* Recording state - Stop button */}
        {recordingState === 'recording' && (
          <div className="space-y-4">
            <div className="py-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {formatDuration(duration)}
              </div>
              <p className="text-gray-400">Recording in progress...</p>
            </div>
            
            <button
              onClick={stopRecording}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              ⏹ Stop Recording
            </button>
          </div>
        )}

        {/* Stopped state - Save/Discard buttons */}
        {recordingState === 'stopped' && (
          <div className="space-y-3">
            <div className="py-4 text-center bg-editor-bg rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {formatDuration(duration)}
              </div>
              <p className="text-sm text-gray-400">Recording duration</p>
            </div>

            <button
              onClick={saveRecording}
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : '💾 Save Recording'}
            </button>

            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="w-full py-2 bg-editor-hover hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-medium rounded-lg transition-colors"
            >
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

