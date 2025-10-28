/**
 * useRecording Hook - MediaRecorder API Management
 * 
 * Manages MediaRecorder API for screen recording.
 * Interfaces with recording store and handles recording state.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store';

// Recording state
interface RecordingState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  error: string | null;
  duration: number;
}

export const useRecording = () => {
  const { recording } = useStore();
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    recordedBlob: null,
    error: null,
    duration: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = useCallback(async (sourceId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Get screen capture stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: recording.includeAudio
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setState(prev => ({
          ...prev,
          isRecording: false,
          recordedBlob: blob
        }));
        
        // Update recording store
        recording.setSessionId(null);
        recording.updateDuration(0);
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        setState(prev => ({
          ...prev,
          isRecording: false,
          error: `Recording error: ${event.error?.message || 'Unknown error'}`
        }));
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      
      setState(prev => ({ ...prev, isRecording: true }));

      // Update recording store
      recording.setSessionId(`recording_${Date.now()}`);
      recording.setShowSourcePicker(false);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({ ...prev, duration }));
        recording.updateDuration(duration);
      }, 100);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
    }
  }, [recording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !state.isRecording) {
      return null;
    }

    try {
      // Stop MediaRecorder
      mediaRecorderRef.current.stop();
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Update recording store
      recording.setSessionId(null);
      recording.updateDuration(0);

      // Return the recorded blob
      return state.recordedBlob;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop recording'
      }));
      return null;
    }
  }, [state.isRecording, state.recordedBlob, recording]);

  // Save recorded blob to file
  const saveRecording = useCallback(async (blob: Blob, filename?: string) => {
    try {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `recording_${Date.now()}.webm`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save recording'
      }));
      return false;
    }
  }, []);

  // Get available recording sources
  const getRecordingSources = useCallback(async () => {
    try {
      await recording.loadSources();
      return recording.availableSources;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get recording sources'
      }));
      return [];
    }
  }, [recording]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear recorded blob
  const clearRecording = useCallback(() => {
    setState(prev => ({ ...prev, recordedBlob: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [state.isRecording]);

  return {
    // Recording state
    isRecording: state.isRecording,
    recordedBlob: state.recordedBlob,
    error: state.error,
    duration: state.duration,
    
    // Recording controls
    startRecording,
    stopRecording,
    saveRecording,
    
    // Utility functions
    getRecordingSources,
    clearError,
    clearRecording,
    
    // Store integration
    availableSources: recording.availableSources,
    selectedSourceId: recording.selectedSourceId,
    includeAudio: recording.includeAudio,
    includeWebcam: recording.includeWebcam,
    resolution: recording.resolution,
    frameRate: recording.frameRate
  };
};

// Export default
export default useRecording;
