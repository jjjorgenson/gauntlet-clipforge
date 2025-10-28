/**
 * RecordDialog Component
 * 
 * Modal dialog for screen/webcam recording interface.
 * Contains all recording sub-components and manages recording flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '../common/Dialog';
import { SourceSelector } from './SourceSelector';
import { CameraPreview } from './CameraPreview';
import { RecordControls } from './RecordControls';
import { RecordingSource } from '../../../shared/types';

export interface RecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (filePath: string) => void;
}

export const RecordDialog: React.FC<RecordDialogProps> = ({
  isOpen,
  onClose,
  onRecordingComplete,
}) => {
  // Recording state
  const [selectedSource, setSelectedSource] = useState<RecordingSource | null>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Media streams and recorder
  const [displayStream, setDisplayStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Refs for timers
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
      stopAllStreams();
    };
  }, []);

  // Stop all media streams
  const stopAllStreams = () => {
    if (displayStream) {
      displayStream.getTracks().forEach(track => track.stop());
      setDisplayStream(null);
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (isRecording) {
      // Don't allow closing while recording
      return;
    }
    
    stopAllStreams();
    setSelectedSource(null);
    setIsWebcamEnabled(false);
    setIsRecording(false);
    setIsCountdown(false);
    setCountdownValue(3);
    setRecordingDuration(0);
    setRecordedBlob(null);
    setRecordedChunks([]);
    onClose();
  };

  // Start countdown
  const startCountdown = () => {
    setIsCountdown(true);
    setCountdownValue(3);

    countdownRef.current = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          setIsCountdown(false);
          startRecording();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Get display media
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      setDisplayStream(stream);

      // Combine with webcam if enabled
      let finalStream = stream;
      if (isWebcamEnabled && webcamStream) {
        // Create canvas to combine streams
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1080;

        // Create video elements for both streams
        const displayVideo = document.createElement('video');
        const webcamVideo = document.createElement('video');
        
        displayVideo.srcObject = stream;
        webcamVideo.srcObject = webcamStream;
        
        displayVideo.play();
        webcamVideo.play();

        // Draw combined video
        const drawFrame = () => {
          if (ctx) {
            ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height);
            // Draw webcam as PiP overlay (bottom right)
            ctx.drawImage(webcamVideo, canvas.width - 320, canvas.height - 240, 320, 240);
          }
          requestAnimationFrame(drawFrame);
        };
        drawFrame();

        // Convert canvas to stream
        finalStream = canvas.captureStream(30);
        
        // Add audio from display stream
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(track => finalStream.addTrack(track));
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordedChunks(chunks);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start duration timer
      durationRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (durationRef.current) {
      clearInterval(durationRef.current);
    }
    
    setIsRecording(false);
    stopAllStreams();
  };

  // Save recording
  const saveRecording = async () => {
    if (!recordedBlob) return;

    setIsSaving(true);
    
    try {
      // Convert blob to buffer
      const arrayBuffer = await recordedBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording-${timestamp}.webm`;
      
      // Save via IPC
      const result = await window.api.recording.saveRecording({
        buffer,
        filename
      });
      
      console.log('Recording saved:', result.outputPath);
      onRecordingComplete(result.outputPath);
      handleClose();
      
    } catch (error) {
      console.error('Failed to save recording:', error);
      alert('Failed to save recording.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle webcam toggle
  const handleWebcamToggle = async (enabled: boolean) => {
    setIsWebcamEnabled(enabled);
    
    if (enabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false
        });
        setWebcamStream(stream);
      } catch (error) {
        console.error('Failed to access webcam:', error);
        alert('Failed to access webcam. Please check permissions.');
        setIsWebcamEnabled(false);
      }
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Screen"
      className="record-dialog"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isCountdown ? `Recording in ${countdownValue}...` :
             isRecording ? `Recording... ${formatDuration(recordingDuration)}` :
             'Setup Recording'}
          </h2>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Source Selection */}
          <div className="space-y-6">
            <SourceSelector
              selectedSource={selectedSource}
              onSourceSelect={setSelectedSource}
              disabled={isRecording || isCountdown}
            />
            
            <CameraPreview
              isEnabled={isWebcamEnabled}
              stream={webcamStream}
              onToggle={handleWebcamToggle}
              disabled={isRecording || isCountdown}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            <RecordControls
              selectedSource={selectedSource}
              isRecording={isRecording}
              isCountdown={isCountdown}
              countdownValue={countdownValue}
              recordingDuration={recordingDuration}
              recordedBlob={recordedBlob}
              isSaving={isSaving}
              onStartCountdown={startCountdown}
              onStopRecording={stopRecording}
              onSaveRecording={saveRecording}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-editor-border">
          <button
            onClick={handleClose}
            disabled={isRecording}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
