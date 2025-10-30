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

    // Reset video when clip changes
    useEffect(() => {
      if (videoRef.current && clip?.sourceFile) {
        const video = videoRef.current;
        
        // Normalize Windows backslashes to forward slashes
        // Remove the colon from drive letter (C: → C)
        const normalized = clip.sourceFile.replace(/\\/g, '/').replace(':', '');
        const mediaUrl = `media://${normalized}`;
        
        // Only reload if the source actually changed
        if (video.src !== mediaUrl) {
          video.src = mediaUrl;
          video.load();
          
          // Set initial time only when loading new source
          video.currentTime = currentTime;
          lastTimeRef.current = currentTime;
        }
      }
    }, [clip?.sourceFile]); // Remove currentTime from dependencies!

    // Sync video currentTime with timeline
    // During normal playback, the video drives the timeline via onTimeUpdate
    // But we still need to seek when timeline jumps (user seeking or clip transitions)
    useEffect(() => {
      if (videoRef.current) {
        const timeDiff = Math.abs(videoRef.current.currentTime - currentTime);
        // Seek if difference is significant (> 0.1s)
        // This handles both user seeks and automatic clip transitions
        if (timeDiff > 0.1) {
          videoRef.current.currentTime = currentTime;
          lastTimeRef.current = currentTime;
        }
      }
    }, [currentTime]);

    // Handle play/pause state - store is the single source of truth
    useEffect(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;

      if (isPlaying) {
        // Only play if not already playing and if video is ready
        if (video.paused && video.readyState >= 2) {
          video.play().catch((err) => {
            // Ignore AbortError - it's benign and happens during rapid state changes
            if (err.name !== 'AbortError') {
              console.error('Video play error:', err);
            }
          });
        }
      } else {
        // Only pause if not already paused
        if (!video.paused) {
          video.pause();
        }
      }
    }, [isPlaying, clip?.sourceFile]);

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
        // Reduced threshold to 0.016s (~1 frame at 60fps) for smoother updates
        if (Math.abs(currentTime - lastTimeRef.current) > 0.016) {
          lastTimeRef.current = currentTime;
          onTimeUpdate(currentTime);
        }
      }
    };

    const handleEnded = () => {
      // Only respond to the video naturally ending
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

    const handleCanPlay = () => {
      // Video is ready to play
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const video = e.currentTarget;
      console.error('❌ Video error:', {
        error: video.error,
        errorCode: video.error?.code,
        errorMessage: video.error?.message,
        networkState: video.networkState,
        readyState: video.readyState,
        currentSrc: video.currentSrc
      });
    };

    const handleLoadStart = () => {
      // Video load started
    };

    const handleLoadedData = () => {
      // Video data loaded (first frame)
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
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        style={{
          backgroundColor: '#000',
        }}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
