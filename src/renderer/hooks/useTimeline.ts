/**
 * useTimeline Hook - Timeline Manipulation Wrapper
 * 
 * Wraps timeline store actions to simplify timeline manipulation.
 * Provides a clean API for common timeline operations.
 */

import { useCallback } from 'react';
import { useStore } from '../store';
import { Clip } from '../../shared/types';

export const useTimeline = () => {
  const { timeline } = useStore();

  // Add clip to timeline
  const addClip = useCallback((clip: Clip, trackId: string, position: number) => {
    timeline.addClip(clip, trackId, position);
  }, [timeline]);

  // Remove clip from timeline
  const removeClip = useCallback((clipId: string) => {
    timeline.removeClip(clipId);
  }, [timeline]);

  // Update clip properties
  const updateClip = useCallback((clipId: string, updates: Partial<Clip>) => {
    timeline.updateClip(clipId, updates);
  }, [timeline]);

  // Move clip to different track/position
  const moveClip = useCallback((clipId: string, newTrackId: string, newPosition: number) => {
    timeline.moveClip(clipId, newTrackId, newPosition);
  }, [timeline]);

  // Split clip at specific time
  const splitClip = useCallback((clipId: string, splitTime: number) => {
    timeline.splitClip(clipId, splitTime);
  }, [timeline]);

  // Trim clip in/out points
  const trimClip = useCallback((clipId: string, trimIn: number, trimOut: number) => {
    timeline.trimClip(clipId, trimIn, trimOut);
  }, [timeline]);

  // Add new track
  const addTrack = useCallback((name: string) => {
    timeline.addTrack(name);
  }, [timeline]);

  // Remove track
  const removeTrack = useCallback((trackId: string) => {
    timeline.removeTrack(trackId);
  }, [timeline]);

  // Set current time
  const setCurrentTime = useCallback((time: number) => {
    timeline.seek(time);
  }, [timeline]);

  // Get current time
  const currentTime = timeline.currentTime;

  // Get timeline duration
  const duration = timeline.duration;

  // Get tracks
  const tracks = timeline.tracks;

  // Get selected clips
  const selectedClipIds = timeline.selectedClipIds;

  // Get zoom level
  const zoom = timeline.zoom;

  // Get scroll position
  const scrollLeft = timeline.scrollLeft;

  // Selection helpers
  const selectClip = useCallback((clipId: string, multiSelect = false) => {
    timeline.selectClip(clipId, multiSelect);
  }, [timeline]);

  const clearSelection = useCallback(() => {
    timeline.clearSelection();
  }, [timeline]);

  const deleteSelectedClips = useCallback(() => {
    timeline.deleteSelectedClips();
  }, [timeline]);

  const duplicateSelectedClips = useCallback(() => {
    timeline.duplicateSelectedClips();
  }, [timeline]);

  // Clipboard operations
  const copySelectedClips = useCallback(() => {
    timeline.copySelectedClips();
  }, [timeline]);

  const cutSelectedClips = useCallback(() => {
    timeline.cutSelectedClips();
  }, [timeline]);

  const pasteClips = useCallback((targetTrackId: string, position: number) => {
    timeline.pasteClips(targetTrackId, position);
  }, [timeline]);

  // History operations
  const undo = useCallback(() => {
    timeline.undo();
  }, [timeline]);

  const redo = useCallback(() => {
    timeline.redo();
  }, [timeline]);

  // UI operations
  const setZoom = useCallback((zoom: number) => {
    timeline.setZoom(zoom);
  }, [timeline]);

  const setScrollLeft = useCallback((scrollLeft: number) => {
    timeline.setScrollLeft(scrollLeft);
  }, [timeline]);

  return {
    // Core timeline data
    currentTime,
    duration,
    tracks,
    selectedClipIds,
    zoom,
    scrollLeft,
    
    // Clip operations
    addClip,
    removeClip,
    updateClip,
    moveClip,
    splitClip,
    trimClip,
    
    // Track operations
    addTrack,
    removeTrack,
    
    // Time operations
    setCurrentTime,
    
    // Selection operations
    selectClip,
    clearSelection,
    deleteSelectedClips,
    duplicateSelectedClips,
    
    // Clipboard operations
    copySelectedClips,
    cutSelectedClips,
    pasteClips,
    
    // History operations
    undo,
    redo,
    
    // UI operations
    setZoom,
    setScrollLeft
  };
};

// Export default
export default useTimeline;
