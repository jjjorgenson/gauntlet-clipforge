/**
 * Media Library Component
 *
 * Container component for the media library panel showing imported videos.
 * Uses mediaStore for state management and provides import functionality.
 */

import React, { useEffect } from 'react';
import { useMediaStore } from '../../store/mediaStore';
import { MediaLibraryComponentProps } from '../../../shared/contracts/components';
import { MediaGrid } from './MediaGrid';

export const MediaLibrary: React.FC<MediaLibraryComponentProps.MediaLibrary> = ({ 
  className = '' 
}) => {
  const {
    items,
    selectedItemIds,
    isLoading,
    filterText,
    sortBy,
    sortOrder,
    addItems,
    selectItem,
    setFilterText,
    setSortBy,
    setSortOrder,
  } = useMediaStore();

  // Load thumbnails for items that don't have them
  useEffect(() => {
    const loadThumbnails = async () => {
      for (const item of items) {
        if (!item.thumbnail) {
          try {
            console.log(`🖼️ Generating thumbnail for: ${item.clip.sourceFile}`);
            // Generate thumbnail at 5 seconds or 10% of duration
            const timestamp = Math.min(5, item.clip.metadata.duration * 0.1);
            const thumbnail = await window.api.media.generateThumbnail({
              filePath: item.clip.sourceFile,
              timestamp,
              width: 200,
              height: 112, // 16:9 aspect ratio
            });
            
            console.log(`✅ Thumbnail generated successfully for: ${item.clip.sourceFile}`);
            // Update the item with thumbnail
            useMediaStore.getState().updateThumbnail(item.id, thumbnail.thumbnail);
          } catch (error) {
            console.error(`❌ Failed to load thumbnail for ${item.clip.sourceFile}:`, error);
            console.error('Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        }
      }
    };

    if (items.length > 0) {
      loadThumbnails();
    }
  }, [items]);

  const handleSelectItem = (id: string, multiSelect: boolean = false) => {
    selectItem(id, multiSelect);
  };

  const handleDragStart = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      // Set drag data for timeline drop
      const dragData = {
        type: 'media-clip',
        clipId: item.clip.id,
        sourceFile: item.clip.sourceFile,
        metadata: item.clip.metadata,
      };
      
      // Store in a way that timeline can access
      (window as any).dragData = dragData;
    }
  };

  const handleDoubleClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      // TODO: Open preview/editor for this clip
      console.log('Double-clicked media item:', item.clip.sourceFile);
    }
  };

  return (
    <div className={`media-library ${className}`}>
      {/* Header */}
      <div className="media-library-header bg-editor-panel border-b border-editor-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Media Library</h2>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search media..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-white placeholder-gray-400 focus:outline-none focus:border-editor-accent"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-editor-bg border border-editor-border rounded text-white focus:outline-none focus:border-editor-accent"
            >
              <option value="date">Date Added</option>
              <option value="name">Name</option>
              <option value="duration">Duration</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-editor-bg border border-editor-border rounded text-white hover:bg-editor-hover focus:outline-none focus:border-editor-accent"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="media-library-content flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-editor-accent mx-auto mb-2"></div>
              <p className="text-gray-400">Loading media...</p>
            </div>
          </div>
        ) : (
          <MediaGrid
            items={items.map(item => ({
              id: item.id,
              clip: item.clip,
              thumbnail: item.thumbnail,
            }))}
            selectedIds={selectedItemIds}
            onSelectItem={handleSelectItem}
            onDragStart={handleDragStart}
            onDoubleClick={handleDoubleClick}
          />
        )}
      </div>

      {/* Footer Stats */}
      <div className="media-library-footer bg-editor-panel border-t border-editor-border p-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{items.length} media items</span>
          {selectedItemIds.length > 0 && (
            <span>{selectedItemIds.length} selected</span>
          )}
        </div>
      </div>
    </div>
  );
};
