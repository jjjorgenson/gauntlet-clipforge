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
      for (const track of tracks) {
        for (const clip of track.clips) {
          if (currentTime >= clip.startTime && currentTime <= clip.endTime) {
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
    if (currentClip) {
      const timelineTime = currentClip.startTime + time;
      seek(timelineTime);
    }
  };

  // Handle play/pause
  const handlePlay = () => {
    play();
  };

  const handlePause = () => {
    pause();
  };

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
    <div className={`video-preview ${className}`}>
      {/* Video Player */}
      <div className="video-player-container bg-black rounded-lg overflow-hidden mb-4">
        {currentClip ? (
          <VideoPlayer
            ref={videoRef}
            clip={currentClip}
            currentTime={currentTime - currentClip.startTime}
            isPlaying={isPlaying}
            volume={volume}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gray-800">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-lg">No video at current time</p>
              <p className="text-sm">Add clips to timeline to preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={totalDuration}
        volume={volume}
        onPlayPause={() => isPlaying ? handlePause() : handlePlay()}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onFullscreen={handleFullscreen}
      />

      {/* Current Clip Info */}
      {currentClip && (
        <div className="mt-4 p-3 bg-editor-panel rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Playing:</span>
              <span className="text-white ml-2 font-medium">
                {currentClip.sourceFile.split('/').pop()?.split('\\').pop() || 'Unknown'}
              </span>
            </div>
            <div className="text-gray-400">
              {formatDuration(currentTime - currentClip.startTime)} / {formatDuration(currentClip.metadata.duration)}
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
