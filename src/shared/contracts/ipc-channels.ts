/**
 * IPC Channel Names - Single Source of Truth
 * 
 * Used by both main process handlers and renderer process callers.
 * Prevents typos and ensures consistency.
 */

export const IPC_CHANNELS = {
  // Media
  MEDIA_IMPORT: 'media:import',
  MEDIA_GET_METADATA: 'media:get-metadata',
  MEDIA_OPEN_FILE_PICKER: 'media:open-file-picker',
  MEDIA_GENERATE_THUMBNAIL: 'media:generate-thumbnail',

  // Recording
  RECORDING_GET_SOURCES: 'recording:get-sources',
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  RECORDING_SAVE: 'recording:save',
  RECORDING_PROGRESS: 'recording:progress', // event

  // Export
  EXPORT_START: 'export:start',
  EXPORT_CANCEL: 'export:cancel',
  EXPORT_PROGRESS: 'export:progress', // event
  EXPORT_COMPLETE: 'export:complete', // event

  // Project
  PROJECT_SAVE: 'project:save',
  PROJECT_LOAD: 'project:load',
  PROJECT_OPEN_SAVE_DIALOG: 'project:open-save-dialog',
  PROJECT_OPEN_PROJECT_DIALOG: 'project:open-project-dialog',

  // System
  SYSTEM_GET_PATH: 'system:get-path',
  SYSTEM_SHOW_ITEM: 'system:show-item',
  SYSTEM_OPEN_EXTERNAL: 'system:open-external',
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

