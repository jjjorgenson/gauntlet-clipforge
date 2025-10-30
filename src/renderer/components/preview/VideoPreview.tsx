/**
 * Video Preview Component
 *
 * Container for video preview player synced with timeline.
 * Displays VideoPlayer and PlaybackControls, listens to timeline.currentTime.
 */

import React, { useState, useEffect, useRef } from 'react';
import { VideoPreviewComponentProps } from '../../../shared/contracts/components';
import { useTimelineStore } from '../../store/timelineStore';
import { useWebcamStore } from '../../store/webcamStore';
import { usePlayback } from '../../hooks/usePlayback';
import { VideoPlayer } from './VideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import { WebcamOverlay } from './WebcamOverlay';

export interface VideoPreviewProps extends VideoPreviewComponentProps.VideoPreview {
  recordingStream?: MediaStream | null;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  className = '',
  recordingStream = null
}) => {
  const {
    tracks,
    selectedClipIds,
  } = useTimelineStore();
  
  const {
    currentTime,
    isPlaying,
    duration,
    play,
    pause,
    seek,
  } = usePlayback();

  const [volume, setVolume] = useState(1.0);
  const [currentClip, setCurrentClip] = useState<any>(null);
  const videoRef = useRef<any>(null);
  const recordingVideoRef = useRef<HTMLVideoElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // Webcam controls
  const { isEnabled: webcamEnabled, enableWebcam, disableWebcam } = useWebcamStore();

  // Set recording stream as video source when available
  useEffect(() => {
    if (recordingVideoRef.current && recordingStream) {
      recordingVideoRef.current.srcObject = recordingStream;
    }
  }, [recordingStream]);

  // Find the current clip based on timeline position
  useEffect(() => {
    const findCurrentClip = () => {
      // Small tolerance for floating point comparisons (50ms)
      const EPSILON = 0.05;
      
      for (const track of tracks) {
        for (const clip of track.clips) {
          // Use epsilon tolerance: if currentTime is within 50ms of the clip range, consider it a match
          if (currentTime >= clip.startTime - EPSILON && currentTime <= clip.endTime + EPSILON) {
            return clip;
          }
        }
      }
      return null;
    };

    const clip = findCurrentClip();
    setCurrentClip(clip);
  }, [currentTime, tracks]);

  // Sync video with timeline when timeline changes
  useEffect(() => {
    if (videoRef.current && currentClip) {
      const video = videoRef.current;
      const clipTime = currentTime - currentClip.startTime;
      
      // Only seek if the difference is significant (avoid micro-seeks)
      if (Math.abs(video.currentTime - clipTime) > 0.1) {
        video.currentTime = clipTime;
      }
    }
  }, [currentTime, currentClip]);

  // Handle video time updates
  const handleTimeUpdate = (time: number) => {
    if (!currentClip) return;
    
    const timelineTime = currentClip.startTime + time;
    
    // Update timeline time more frequently for smooth playback (reduced threshold)
    if (Math.abs(timelineTime - currentTime) > 0.016) {
      useTimelineStore.setState({ currentTime: timelineTime });
    }
  };

  // NOTE: handlePlay and handlePause removed - VideoPlayer no longer uses these callbacks
  // Play/pause is controlled via PlaybackControls → store → VideoPlayer.isPlaying prop

  // Handle video ended
  const handleEnded = () => {
    pause();
    // Move to next clip or end of timeline
    const nextClip = findNextClip();
    if (nextClip) {
      seek(nextClip.startTime);
    }
  };

  // Find next clip in timeline
  const findNextClip = () => {
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.startTime > currentTime) {
          return clip;
        }
      }
    }
    return null;
  };

  // Handle seeking
  const handleSeek = (time: number) => {
    seek(time);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Handle webcam toggle
  const handleWebcamToggle = async () => {
    if (webcamEnabled) {
      disableWebcam();
    } else {
      try {
        await enableWebcam();
      } catch (error) {
        console.error('Failed to enable webcam:', error);
        alert('Failed to enable webcam. Please check permissions.');
      }
    }
  };

  // Helper function to calculate z-index based on track index
  const getTrackZIndex = (trackIndex: number): number => {
    return 100 - (trackIndex * 10);
    // Track 0 (Track 1) = z-index 100 (top)
    // Track 1 (Track 2) = z-index 90
    // Track 2 (Track 3) = z-index 80
    // etc.
  };

  // Calculate total duration
  const totalDuration = duration;

  return (
    <div className={`video-preview flex flex-col h-full ${className}`}>
      {/* Video Player Container with proper centering - min-h-0 allows it to shrink */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden">
        <div 
          className="max-w-full" 
          style={{ 
            aspectRatio: '16/9',
            width: '100%',
            maxHeight: '100%',
            height: 'auto'
          }}
        >
          <div 
            ref={previewContainerRef}
            className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden shadow-2xl"
          >
            {/* Show recording stream preview if available */}
            {recordingStream ? (
              <>
                {/* LIVE PREVIEW Banner */}
                <div className="absolute top-4 left-4 z-[200] bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold text-sm">LIVE PREVIEW - Recording Source Selected</span>
                </div>

                {/* Recording Stream Video */}
                <video
                  ref={recordingVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />

                {/* Webcam Overlay */}
                <WebcamOverlay containerRef={previewContainerRef} />
              </>
            ) : tracks.length > 0 ? (
              /* Timeline clips preview */
              <>
                {tracks.map((track, trackIndex) => {
                  // Find clip at current time for this track
                  const clipAtTime = track.clips.find(clip => 
                    currentTime >= clip.startTime - 0.05 && currentTime <= clip.endTime + 0.05
                  );

                  if (!clipAtTime) return null;

                  const videoTime = Math.max(0, currentTime - clipAtTime.startTime);
                  const clipDuration = clipAtTime.endTime - clipAtTime.startTime;
                  const clampedVideoTime = Math.min(videoTime, clipDuration);

                  return (
                    <div 
                      key={`${track.id}-${clipAtTime.id}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: getTrackZIndex(trackIndex)
                      }}
                    >
                      <VideoPlayer
                        ref={trackIndex === 0 ? videoRef : undefined}
                        clip={clipAtTime}
                        currentTime={clampedVideoTime}
                        isPlaying={isPlaying}
                        volume={track.muted ? 0 : volume}
                        onTimeUpdate={trackIndex === 0 ? handleTimeUpdate : () => {}}
                        onEnded={trackIndex === 0 ? handleEnded : () => {}}
                      />
                    </div>
                  );
                })}

                {/* Webcam Overlay */}
                <WebcamOverlay containerRef={previewContainerRef} />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-3 opacity-40">🎬</div>
                  <p className="text-lg font-medium text-gray-300 mb-1">No video at current time</p>
                  <p className="text-sm text-gray-500">Add clips to timeline to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playback Controls - always visible at bottom */}
      <div className="flex-shrink-0">
        {/* Webcam Toggle Button (above playback controls) */}
        <div className="px-4 pb-2 flex justify-end">
          <button
            onClick={handleWebcamToggle}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              webcamEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={webcamEnabled ? 'Disable webcam overlay' : 'Enable webcam overlay'}
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span>{webcamEnabled ? 'Webcam On' : 'Webcam Off'}</span>
            </div>
          </button>
        </div>
        
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={totalDuration}
          volume={volume}
          onPlayPause={() => isPlaying ? pause() : play()}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onFullscreen={handleFullscreen}
        />
      </div>

      {/* Current Clip Info */}
      {currentClip && (
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="p-3 bg-editor-panel border border-editor-border rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Playing:</span>
                <span className="text-white font-medium truncate max-w-xs">
                  {currentClip.sourceFile.split('/').pop()?.split('\\').pop() || 'Unknown'}
                </span>
              </div>
              <div className="text-gray-400 font-mono text-xs">
                {formatDuration(currentTime - currentClip.startTime)} / {formatDuration(currentClip.metadata.duration)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};
