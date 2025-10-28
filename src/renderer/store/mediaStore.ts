/**
 * Media Library Store - Zustand Implementation
 * 
 * Manages media library state, thumbnails, and import operations.
 * Implements MediaLibraryStoreContract interface.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  MediaLibraryStoreContract
} from '../../shared/contracts/stores';
import { Clip } from '../../shared/types';

// Default media library state
const defaultState: MediaLibraryStoreContract.State = {
  items: [],
  selectedItemIds: [],
  sortBy: 'date',
  sortOrder: 'desc',
  filterText: '',
  isLoading: false
};

// Helper functions
const createMediaItem = (clip: Clip): MediaLibraryStoreContract.MediaItem => ({
  id: uuidv4(),
  clip,
  thumbnail: undefined,
  addedAt: new Date()
});

const sortItems = (
  items: MediaLibraryStoreContract.MediaItem[],
  sortBy: MediaLibraryStoreContract.State['sortBy'],
  sortOrder: MediaLibraryStoreContract.State['sortOrder']
): MediaLibraryStoreContract.MediaItem[] => {
  return [...items].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.clip.sourceFile.localeCompare(b.clip.sourceFile);
        break;
      case 'date':
        comparison = a.addedAt.getTime() - b.addedAt.getTime();
        break;
      case 'duration':
        comparison = a.clip.metadata.duration - b.clip.metadata.duration;
        break;
      case 'size':
        comparison = a.clip.metadata.size - b.clip.metadata.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

const filterItems = (
  items: MediaLibraryStoreContract.MediaItem[],
  filterText: string
): MediaLibraryStoreContract.MediaItem[] => {
  if (!filterText.trim()) return items;
  
  const searchTerm = filterText.toLowerCase();
  return items.filter(item => 
    item.clip.sourceFile.toLowerCase().includes(searchTerm)
  );
};

// Media Library Store Implementation
export const useMediaStore = create<MediaLibraryStoreContract.Store>((set, get) => ({
  ...defaultState,

  // ============================================================================
  // MEDIA ITEM OPERATIONS
  // ============================================================================

  addItems: (clips: Clip[]) => {
    set((state) => {
      const newItems = clips.map(createMediaItem);
      const allItems = [...state.items, ...newItems];
      const sortedItems = sortItems(allItems, state.sortBy, state.sortOrder);
      
      return { items: sortedItems };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId),
      selectedItemIds: state.selectedItemIds.filter(id => id !== itemId)
    }));
  },

  // ============================================================================
  // SELECTION OPERATIONS
  // ============================================================================

  selectItem: (itemId: string, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedItemIds.includes(itemId);
        return {
          selectedItemIds: isSelected 
            ? state.selectedItemIds.filter(id => id !== itemId)
            : [...state.selectedItemIds, itemId]
        };
      } else {
        return { selectedItemIds: [itemId] };
      }
    });
  },

  deselectItem: (itemId: string) => {
    set((state) => ({
      selectedItemIds: state.selectedItemIds.filter(id => id !== itemId)
    }));
  },

  clearSelection: () => {
    set({ selectedItemIds: [] });
  },

  // ============================================================================
  // SORTING & FILTERING
  // ============================================================================

  setSortBy: (sortBy: MediaLibraryStoreContract.State['sortBy']) => {
    set((state) => {
      const sortedItems = sortItems(state.items, sortBy, state.sortOrder);
      return { 
        items: sortedItems,
        sortBy 
      };
    });
  },

  setSortOrder: (sortOrder: MediaLibraryStoreContract.State['sortOrder']) => {
    set((state) => {
      const sortedItems = sortItems(state.items, state.sortBy, sortOrder);
      return { 
        items: sortedItems,
        sortOrder 
      };
    });
  },

  setFilterText: (text: string) => {
    set({ filterText: text });
  },

  // ============================================================================
  // LOADING & THUMBNAILS
  // ============================================================================

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  updateThumbnail: (itemId: string, thumbnail: string) => {
    set((state) => ({
      items: state.items.map(item => 
        item.id === itemId ? { ...item, thumbnail } : item
      )
    }));
  }
}));
