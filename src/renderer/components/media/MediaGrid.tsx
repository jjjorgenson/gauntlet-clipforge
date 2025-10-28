/**
 * Media Grid Component
 *
 * CSS Grid layout for displaying media items with responsive columns.
 * Handles empty state and provides drag-and-drop functionality.
 */

import React from 'react';
import { MediaLibraryComponentProps } from '../../../shared/contracts/components';
import { MediaItem } from './MediaItem';

export const MediaGrid: React.FC<MediaLibraryComponentProps.MediaGrid> = ({
  items,
  selectedIds,
  onSelectItem,
  onDragStart,
  onDoubleClick,
}) => {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="media-grid-container h-full overflow-auto p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <MediaItem
            key={item.id}
            id={item.id}
            clip={item.clip}
            thumbnail={item.thumbnail}
            isSelected={selectedIds.includes(item.id)}
            onSelect={onSelectItem}
            onDragStart={onDragStart}
            onDoubleClick={onDoubleClick}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 * 
 * Displayed when no media items are available.
 */
const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">
          No Media Files
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-6">
          Import video files to get started with your project. 
          Drag and drop files or use the import button to add media to your library.
        </p>

        {/* Features List */}
        <div className="text-left text-sm text-gray-500 space-y-2 mb-6">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-editor-accent rounded-full mr-3"></div>
            <span>Supports MP4, MOV, WebM, and more</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-editor-accent rounded-full mr-3"></div>
            <span>Automatic thumbnail generation</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-editor-accent rounded-full mr-3"></div>
            <span>Drag to timeline for editing</span>
          </div>
        </div>

        {/* Import Hint */}
        <div className="text-xs text-gray-600">
          💡 Tip: You can also drag files directly from your file explorer
        </div>
      </div>
    </div>
  );
};
