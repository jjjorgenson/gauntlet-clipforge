/**
 * Video Player Component
 *
 * HTML5 video element synced with timeline currentTime.
 * Seeks when timeline changes, no native controls (custom controls provided).
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { VideoPreviewComponentProps } from '../../../shared/contracts/components';

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPreviewComponentProps.VideoPlayer>(
  ({ clip, currentTime, isPlaying, volume, onTimeUpdate, onPlay, onPause, onEnded }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastTimeRef = useRef<number>(0);

    // Expose video methods to parent
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
    }));

    // Sync video currentTime with timeline
    useEffect(() => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
        videoRef.current.currentTime = currentTime;
      }
    }, [currentTime]);

    // Handle play/pause state
    useEffect(() => {
      if (!videoRef.current) return;

      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }, [isPlaying]);

    // Handle volume changes
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
      }
    }, [volume]);

    // Handle video events
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        // Only call onTimeUpdate if time actually changed (avoid duplicate calls)
        if (Math.abs(currentTime - lastTimeRef.current) > 0.1) {
          lastTimeRef.current = currentTime;
          onTimeUpdate(currentTime);
        }
      }
    };

    const handlePlay = () => {
      onPlay();
    };

    const handlePause = () => {
      onPause();
    };

    const handleEnded = () => {
      onEnded();
    };

    const handleLoadedMetadata = () => {
      // Ensure video is synced when metadata loads
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
      }
    };

    const handleSeeked = () => {
      // Update lastTimeRef when seeking to avoid duplicate time updates
      if (videoRef.current) {
        lastTimeRef.current = videoRef.current.currentTime;
      }
    };

    if (!clip) {
      return (
        <div className="aspect-video flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-lg">No video selected</p>
            <p className="text-sm">Add clips to timeline to preview</p>
          </div>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={clip.sourceFile}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        style={{
          backgroundColor: '#000',
        }}
      >
        <source src={clip.sourceFile} type="video/mp4" />
        <source src={clip.sourceFile} type="video/webm" />
        <source src={clip.sourceFile} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
