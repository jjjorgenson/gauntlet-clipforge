/**
 * usePlayback Hook - Video Playback State Management
 * 
 * Manages video playback state and syncs with timeline store.
 * Provides a clean API for playback operations.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/timelineStore';

export const usePlayback = () => {
  // Direct subscription to timeline store for reactive updates
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const duration = useTimelineStore((state) => state.duration);
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const seek = useTimelineStore((state) => state.seek);
  
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to beginning
  const seekToStart = useCallback(() => {
    seek(0);
  }, [seek]);

  // Seek to end
  const seekToEnd = useCallback(() => {
    seek(duration);
  }, [seek, duration]);

  // Seek forward by amount
  const seekForward = useCallback((amount: number = 5) => {
    const newTime = Math.min(duration, currentTime + amount);
    seek(newTime);
  }, [seek, currentTime, duration]);

  // Seek backward by amount
  const seekBackward = useCallback((amount: number = 5) => {
    const newTime = Math.max(0, currentTime - amount);
    seek(newTime);
  }, [seek, currentTime]);

  // Frame-by-frame forward
  const frameForward = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = Math.min(duration, currentTime + frameTime);
    seek(newTime);
  }, [seek, currentTime, duration]);

  // Frame-by-frame backward
  const frameBackward = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = Math.max(0, currentTime - frameTime);
    seek(newTime);
  }, [seek, currentTime]);

  // Playback loop effect - DISABLED
  // NOTE: This RAF loop was driving timeline time forward manually,
  // but it conflicts with the video element's natural playback.
  // The video element is now the master clock via VideoPreview.handleTimeUpdate()
  useEffect(() => {
    // Clean up any existing RAF
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    // Playback state
    isPlaying,
    currentTime,
    duration,
    
    // Playback controls
    play,
    pause,
    togglePlayPause,
    seek,
    seekToStart,
    seekToEnd,
    seekForward,
    seekBackward,
    frameForward,
    frameBackward
  };
};

// Export default
export default usePlayback;
