/**
 * usePlayback Hook - Video Playback State Management
 * 
 * Manages video playback state and syncs with timeline store.
 * Provides a clean API for playback operations.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';

export const usePlayback = () => {
  const { timeline } = useStore();
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Playback state
  const isPlaying = timeline.isPlaying;
  const currentTime = timeline.currentTime;
  const duration = timeline.duration;

  // Play function
  const play = useCallback(() => {
    timeline.play();
  }, [timeline]);

  // Pause function
  const pause = useCallback(() => {
    timeline.pause();
  }, [timeline]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    timeline.seek(time);
  }, [timeline]);

  // Seek to beginning
  const seekToStart = useCallback(() => {
    timeline.seek(0);
  }, [timeline]);

  // Seek to end
  const seekToEnd = useCallback(() => {
    timeline.seek(duration);
  }, [timeline]);

  // Seek forward by amount
  const seekForward = useCallback((amount: number = 5) => {
    const newTime = Math.min(duration, currentTime + amount);
    timeline.seek(newTime);
  }, [timeline, currentTime, duration]);

  // Seek backward by amount
  const seekBackward = useCallback((amount: number = 5) => {
    const newTime = Math.max(0, currentTime - amount);
    timeline.seek(newTime);
  }, [timeline, currentTime]);

  // Frame-by-frame forward
  const frameForward = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = Math.min(duration, currentTime + frameTime);
    timeline.seek(newTime);
  }, [timeline, currentTime, duration]);

  // Frame-by-frame backward
  const frameBackward = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = Math.max(0, currentTime - frameTime);
    timeline.seek(newTime);
  }, [timeline, currentTime]);

  // Playback loop effect
  useEffect(() => {
    if (isPlaying) {
      const updatePlayback = (timestamp: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
        }
        
        const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
        lastTimeRef.current = timestamp;
        
        const newTime = Math.min(duration, currentTime + deltaTime);
        
        if (newTime >= duration) {
          // Reached end, pause playback
          timeline.pause();
          timeline.seek(duration);
        } else {
          timeline.seek(newTime);
        }
        
        animationFrameRef.current = requestAnimationFrame(updatePlayback);
      };
      
      animationFrameRef.current = requestAnimationFrame(updatePlayback);
    } else {
      lastTimeRef.current = 0;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, timeline]);

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
