/**
 * Format Utilities
 *
 * Helper functions for formatting time, file sizes, and other data.
 */

/**
 * Format duration in seconds to HH:MM:SS or MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (timestamp: number | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Format frame rate to readable format
 */
export const formatFrameRate = (fps: number): string => {
  if (fps % 1 === 0) {
    return `${fps} fps`;
  } else {
    return `${fps.toFixed(2)} fps`;
  }
};

/**
 * Format resolution to readable format
 */
export const formatResolution = (width: number, height: number): string => {
  return `${width}×${height}`;
};
