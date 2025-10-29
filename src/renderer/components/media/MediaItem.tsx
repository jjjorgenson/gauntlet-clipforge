/**
 * Media Item Component
 *
 * Individual clip card showing thumbnail, filename, duration, and metadata.
 * Supports drag-and-drop to timeline and click selection.
 */

import React from 'react';
import { MediaLibraryComponentProps } from '../../../shared/contracts/components';
import { formatDuration } from '../../utils/formatUtils';

export const MediaItem: React.FC<MediaLibraryComponentProps.MediaItem> = ({
  id,
  clip,
  thumbnail,
  isSelected,
  onSelect,
  onDragStart,
  onDoubleClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(id, e.ctrlKey || e.metaKey);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    
    // Set comprehensive clip data for timeline drop handler
    const clipData = {
      id,
      sourceFile: clip.sourceFile,
      duration: clip.metadata.duration,
      width: clip.metadata.resolution.width,
      height: clip.metadata.resolution.height,
      fps: clip.metadata.frameRate,
      codec: clip.metadata.codec,
      size: clip.metadata.size,
      thumbnail,
    };
    
    // Set data in the format Timeline expects
    e.dataTransfer.setData('application/clipforge-clip', JSON.stringify(clipData));
    // Also set as text for fallback
    e.dataTransfer.setData('text/plain', id);
    
    // Set drag image to the thumbnail if available
    if (thumbnail) {
      const img = new Image();
      img.src = thumbnail;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Use 16:9 aspect ratio for drag preview
        canvas.width = 160;
        canvas.height = 90;
        
        if (ctx) {
          // Fill background
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Calculate aspect-fit dimensions
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (imgAspect > canvasAspect) {
            // Image is wider - fit to width
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            // Image is taller - fit to height
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          }
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          // Add semi-transparent overlay to show it's being dragged
          ctx.fillStyle = 'rgba(64, 150, 255, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          e.dataTransfer.setDragImage(canvas, 80, 45);
        }
      };
    }
    
    onDragStart(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDoubleClick(id);
  };

  const getFileExtension = (filePath: string): string => {
    return filePath.split('.').pop()?.toUpperCase() || '';
  };

  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop()?.split('\\').pop() || filePath;
  };

  return (
    <div
      className={`
        media-item group cursor-grab active:cursor-grabbing select-none
        ${isSelected 
          ? 'ring-2 ring-blue-500 bg-editor-hover shadow-lg shadow-blue-500/20' 
          : 'hover:bg-editor-hover hover:border-gray-600 hover:shadow-md'
        }
        bg-editor-panel border border-editor-border rounded-lg overflow-hidden
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
      title={`${getFileName(clip.sourceFile)} - ${formatDuration(clip.metadata.duration)}`}
      tabIndex={0}
      role="button"
      aria-label={`Media clip: ${getFileName(clip.sourceFile)}`}
      aria-pressed={isSelected}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={getFileName(clip.sourceFile)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-1">🎬</div>
              <div className="text-xs">{getFileExtension(clip.sourceFile)}</div>
            </div>
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(clip.metadata.duration)}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-editor-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Filename */}
        <div className="text-sm font-medium text-white truncate mb-1">
          {getFileName(clip.sourceFile)}
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>{clip.metadata.resolution.width}×{clip.metadata.resolution.height}</span>
            <span>{clip.metadata.frameRate.toFixed(1)}fps</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{clip.metadata.codec.toUpperCase()}</span>
            <span>{formatFileSize(clip.metadata.size)}</span>
          </div>
        </div>

        {/* File Extension Badge */}
        <div className="mt-2">
          <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
            {getFileExtension(clip.sourceFile)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
