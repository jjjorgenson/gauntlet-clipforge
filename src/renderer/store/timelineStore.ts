/**
 * Timeline Store - Zustand Implementation
 * 
 * Manages timeline state, playback, clip operations, and history.
 * Implements TimelineStoreContract interface.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  TimelineStoreContract
} from '../../shared/contracts/stores';
import { Clip, Track } from '../../shared/types';

// Default timeline state
const defaultState: TimelineStoreContract.State = {
  tracks: [],
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  zoom: 1.0,
  scrollLeft: 0,
  selectedClipIds: [],
  selectedTrackId: null,
  clipboardClips: [],
  history: {
    past: [],
    future: []
  }
};

// Helper functions
const createTrack = (name: string): Track => ({
  id: uuidv4(),
  name,
  clips: [],
  muted: false,
  locked: false,
  visible: true
});

const createTimelineSnapshot = (tracks: Track[]): TimelineStoreContract.TimelineSnapshot => ({
  tracks: JSON.parse(JSON.stringify(tracks)), // Deep clone
  timestamp: Date.now()
});

const calculateTimelineDuration = (tracks: Track[]): number => {
  let maxDuration = 0;
  tracks.forEach(track => {
    track.clips.forEach(clip => {
      maxDuration = Math.max(maxDuration, clip.endTime);
    });
  });
  return maxDuration;
};

// Timeline Store Implementation
export const useTimelineStore = create<TimelineStoreContract.Store>((set, get) => ({
  ...defaultState,

  // ============================================================================
  // CLIP OPERATIONS
  // ============================================================================

  addClip: (clip: Clip, trackId: string, position: number) => {
    set((state) => {
      const newTracks = state.tracks.map(track => {
        if (track.id === trackId) {
          const newClip = {
            ...clip,
            id: uuidv4(),
            startTime: position,
            endTime: position + (clip.trimOut - clip.trimIn),
            trackId
          };
          return {
            ...track,
            clips: [...track.clips, newClip].sort((a, b) => a.startTime - b.startTime)
          };
        }
        return track;
      });

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks)
      };
    });
  },

  removeClip: (clipId: string) => {
    set((state) => {
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.id !== clipId)
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        selectedClipIds: state.selectedClipIds.filter(id => id !== clipId)
      };
    });
  },

  updateClip: (clipId: string, updates: Partial<Clip>) => {
    set((state) => {
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => 
          clip.id === clipId ? { ...clip, ...updates } : clip
        )
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks)
      };
    });
  },

  moveClip: (clipId: string, newTrackId: string, newPosition: number) => {
    set((state) => {
      let clipToMove: Clip | null = null;
      
      // Find and remove clip from current track
      const tracksWithoutClip = state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => {
          if (clip.id === clipId) {
            clipToMove = clip;
            return false;
          }
          return true;
        })
      }));

      if (!clipToMove) return state;

      // Add clip to new track at new position
      const newTracks = tracksWithoutClip.map(track => {
        if (track.id === newTrackId) {
          const movedClip = {
            ...clipToMove!,
            trackId: newTrackId,
            startTime: newPosition,
            endTime: newPosition + (clipToMove!.trimOut - clipToMove!.trimIn)
          };
          return {
            ...track,
            clips: [...track.clips, movedClip].sort((a, b) => a.startTime - b.startTime)
          };
        }
        return track;
      });

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks)
      };
    });
  },

  splitClip: (clipId: string, splitTime: number) => {
    set((state) => {
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.flatMap(clip => {
          if (clip.id !== clipId) return [clip];
          
          const splitPosition = splitTime - clip.startTime;
          if (splitPosition <= 0 || splitPosition >= (clip.trimOut - clip.trimIn)) {
            return [clip]; // No split needed
          }

          const leftClip: Clip = {
            ...clip,
            id: uuidv4(),
            endTime: splitTime,
            trimOut: clip.trimIn + splitPosition
          };

          const rightClip: Clip = {
            ...clip,
            id: uuidv4(),
            startTime: splitTime,
            trimIn: clip.trimIn + splitPosition
          };

          return [leftClip, rightClip];
        })
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks)
      };
    });
  },

  trimClip: (clipId: string, trimIn: number, trimOut: number) => {
    set((state) => {
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => {
          if (clip.id !== clipId) return clip;
          
          const duration = trimOut - trimIn;
          return {
            ...clip,
            trimIn,
            trimOut,
            endTime: clip.startTime + duration
          };
        })
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks)
      };
    });
  },

  // ============================================================================
  // TRACK OPERATIONS
  // ============================================================================

  addTrack: (name: string) => {
    set((state) => ({
      tracks: [...state.tracks, createTrack(name)]
    }));
  },

  removeTrack: (trackId: string) => {
    set((state) => {
      const track = state.tracks.find(t => t.id === trackId);
      if (!track) return state;

      const newTracks = state.tracks.filter(t => t.id !== trackId);
      const clipIdsToRemove = track.clips.map(c => c.id);
      
      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        selectedClipIds: state.selectedClipIds.filter(id => !clipIdsToRemove.includes(id)),
        selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId
      };
    });
  },

  updateTrack: (trackId: string, updates: Partial<Track>) => {
    set((state) => ({
      tracks: state.tracks.map(track => 
        track.id === trackId ? { ...track, ...updates } : track
      )
    }));
  },

  reorderTracks: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newTracks = [...state.tracks];
      const [movedTrack] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, movedTrack);
      
      return { tracks: newTracks };
    });
  },

  // ============================================================================
  // PLAYBACK OPERATIONS
  // ============================================================================

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  seek: (time: number) => {
    set({ 
      currentTime: Math.max(0, Math.min(time, get().duration)),
      isPlaying: false 
    });
  },

  // ============================================================================
  // UI OPERATIONS
  // ============================================================================

  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.1, Math.min(5.0, zoom)) });
  },

  setScrollLeft: (scrollLeft: number) => {
    set({ scrollLeft: Math.max(0, scrollLeft) });
  },

  // ============================================================================
  // SELECTION OPERATIONS
  // ============================================================================

  selectClip: (clipId: string, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedClipIds.includes(clipId);
        return {
          selectedClipIds: isSelected 
            ? state.selectedClipIds.filter(id => id !== clipId)
            : [...state.selectedClipIds, clipId]
        };
      } else {
        return {
          selectedClipIds: [clipId],
          selectedTrackId: null
        };
      }
    });
  },

  deselectClip: (clipId: string) => {
    set((state) => ({
      selectedClipIds: state.selectedClipIds.filter(id => id !== clipId)
    }));
  },

  clearSelection: () => {
    set({ 
      selectedClipIds: [], 
      selectedTrackId: null 
    });
  },

  selectTrack: (trackId: string | null) => {
    set({ 
      selectedTrackId: trackId,
      selectedClipIds: []
    });
  },

  // ============================================================================
  // CLIPBOARD OPERATIONS
  // ============================================================================

  copySelectedClips: () => {
    set((state) => {
      const selectedClips = state.tracks
        .flatMap(track => track.clips)
        .filter(clip => state.selectedClipIds.includes(clip.id));
      
      return { clipboardClips: selectedClips };
    });
  },

  cutSelectedClips: () => {
    set((state) => {
      const selectedClips = state.tracks
        .flatMap(track => track.clips)
        .filter(clip => state.selectedClipIds.includes(clip.id));
      
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => !state.selectedClipIds.includes(clip.id))
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        clipboardClips: selectedClips,
        selectedClipIds: []
      };
    });
  },

  pasteClips: (targetTrackId: string, position: number) => {
    set((state) => {
      if (state.clipboardClips.length === 0) return state;

      const newTracks = state.tracks.map(track => {
        if (track.id !== targetTrackId) return track;

        const pastedClips = state.clipboardClips.map(clip => ({
          ...clip,
          id: uuidv4(),
          trackId: targetTrackId,
          startTime: position + (clip.startTime - state.clipboardClips[0].startTime),
          endTime: position + (clip.endTime - state.clipboardClips[0].startTime)
        }));

        return {
          ...track,
          clips: [...track.clips, ...pastedClips].sort((a, b) => a.startTime - b.startTime)
        };
      });

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        selectedClipIds: state.clipboardClips.map(clip => clip.id)
      };
    });
  },

  // ============================================================================
  // HISTORY OPERATIONS
  // ============================================================================

  pushHistory: () => {
    set((state) => {
      const snapshot = createTimelineSnapshot(state.tracks);
      return {
        history: {
          past: [...state.history.past, snapshot],
          future: [] // Clear future when new action is performed
        }
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;

      const currentSnapshot = createTimelineSnapshot(state.tracks);
      const previousSnapshot = state.history.past[state.history.past.length - 1];

      return {
        tracks: previousSnapshot.tracks,
        duration: calculateTimelineDuration(previousSnapshot.tracks),
        history: {
          past: state.history.past.slice(0, -1),
          future: [currentSnapshot, ...state.history.future]
        },
        selectedClipIds: [],
        selectedTrackId: null
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;

      const currentSnapshot = createTimelineSnapshot(state.tracks);
      const nextSnapshot = state.history.future[0];

      return {
        tracks: nextSnapshot.tracks,
        duration: calculateTimelineDuration(nextSnapshot.tracks),
        history: {
          past: [...state.history.past, currentSnapshot],
          future: state.history.future.slice(1)
        },
        selectedClipIds: [],
        selectedTrackId: null
      };
    });
  },

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  deleteSelectedClips: () => {
    set((state) => {
      const newTracks = state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => !state.selectedClipIds.includes(clip.id))
      }));

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        selectedClipIds: []
      };
    });
  },

  duplicateSelectedClips: () => {
    set((state) => {
      if (state.selectedClipIds.length === 0) return state;

      const selectedClips = state.tracks
        .flatMap(track => track.clips)
        .filter(clip => state.selectedClipIds.includes(clip.id));

      const duplicatedClips = selectedClips.map(clip => ({
        ...clip,
        id: uuidv4(),
        startTime: clip.endTime + 0.1, // Place after original
        endTime: clip.endTime + (clip.trimOut - clip.trimIn) + 0.1
      }));

      const newTracks = state.tracks.map(track => {
        const clipsToAdd = duplicatedClips.filter(clip => clip.trackId === track.id);
        return {
          ...track,
          clips: [...track.clips, ...clipsToAdd].sort((a, b) => a.startTime - b.startTime)
        };
      });

      return {
        tracks: newTracks,
        duration: calculateTimelineDuration(newTracks),
        selectedClipIds: duplicatedClips.map(clip => clip.id)
      };
    });
  }
}));
