/**
 * Video Preview Component
 *
 * Container for video preview player synced with timeline.
 * Displays VideoPlayer and PlaybackControls, listens to timeline.currentTime.
 */

import React, { useState, useEffect, useRef } from 'react';
import { VideoPreviewComponentProps } from '../../../shared/contracts/components';
import { useTimelineStore } from '../../store/timelineStore';
import { usePlayback } from '../../hooks/usePlayback';
import { VideoPlayer } from './VideoPlayer';
import { PlaybackControls } from './PlaybackControls';

export const VideoPreview: React.FC<VideoPreviewComponentProps.VideoPreview> = ({ 
  className = '' 
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
    
    if (Math.abs(timelineTime - currentTime) > 0.1) {
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

  // Calculate total duration
  const totalDuration = duration;

  return (
    <div className={`video-preview flex flex-col h-full ${className}`}>
      {/* Video Player Container with proper centering */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-full" style={{ aspectRatio: '16/9' }}>
          <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden shadow-2xl">
            {currentClip ? (
              <>
                {(() => {
                  // Calculate video time relative to clip start, clamped to valid range
                  const videoTime = Math.max(0, currentTime - currentClip.startTime);
                  const clipDuration = currentClip.endTime - currentClip.startTime;
                  const clampedVideoTime = Math.min(videoTime, clipDuration);
                  
                  return (
                    <VideoPlayer
                      ref={videoRef}
                      clip={currentClip}
                      currentTime={clampedVideoTime}
                      isPlaying={isPlaying}
                      volume={volume}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                    />
                  );
                })()}
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

      {/* Playback Controls */}
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

      {/* Current Clip Info */}
      {currentClip && (
        <div className="px-4 pb-4">
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
