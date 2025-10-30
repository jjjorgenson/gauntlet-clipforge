/**
 * Electron Preload Script
 * 
 * Runs in isolated context with access to both Node.js and renderer.
 * Exposes safe APIs to the renderer via contextBridge.
 * 
 * Security: This is the ONLY bridge between main and renderer processes.
 * 
 * Track 1 Implementation: Complete IPC API infrastructure
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IpcAPI } from '../shared/contracts/ipc';

// Inline IPC channels to avoid module resolution issues in preload context
const IPC_CHANNELS = {
  // Media
  MEDIA_IMPORT: 'media:import',
  MEDIA_GET_METADATA: 'media:get-metadata',
  MEDIA_OPEN_FILE_PICKER: 'media:open-file-picker',
  MEDIA_GENERATE_THUMBNAIL: 'media:generate-thumbnail',
  MEDIA_SAVE_DROPPED_FILE: 'media:save-dropped-file',

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

// Debug: Check if contextBridge is available
console.log('🔍 contextBridge available:', typeof contextBridge);
console.log('🔍 ipcRenderer available:', typeof ipcRenderer);
console.log('🔍 IPC_CHANNELS:', IPC_CHANNELS);

// Complete IPC API implementation
const api: IpcAPI = {
  // Media operations
  media: {
    import: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_IMPORT, req),
    getMetadata: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_METADATA, req),
    openFilePicker: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_OPEN_FILE_PICKER, req),
    generateThumbnail: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GENERATE_THUMBNAIL, req),
    saveDroppedFile: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_SAVE_DROPPED_FILE, req),
  },

  // Recording operations
  recording: {
    getSources: (req) => ipcRenderer.invoke(IPC_CHANNELS.RECORDING_GET_SOURCES, req),
    start: (req) => ipcRenderer.invoke(IPC_CHANNELS.RECORDING_START, req),
    stop: (req) => ipcRenderer.invoke(IPC_CHANNELS.RECORDING_STOP, req),
    saveRecording: (req) => ipcRenderer.invoke(IPC_CHANNELS.RECORDING_SAVE, req),
    onProgress: (callback) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.RECORDING_PROGRESS, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_PROGRESS, listener);
    },
  },

  // Export operations
  export: {
    start: (req) => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_START, req),
    cancel: (req) => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_CANCEL, req),
    onProgress: (callback) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.EXPORT_PROGRESS, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.EXPORT_PROGRESS, listener);
    },
    onComplete: (callback) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.EXPORT_COMPLETE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.EXPORT_COMPLETE, listener);
    },
  },

  // Project operations
  project: {
    save: (req) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_SAVE, req),
    load: (req) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_LOAD, req),
    openSaveDialog: (req) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_OPEN_SAVE_DIALOG, req),
    openProjectDialog: (req) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_OPEN_PROJECT_DIALOG, req),
  },

  // System operations
  system: {
    getPath: (req) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PATH, req),
    showItem: (req) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_SHOW_ITEM, req),
    openExternal: (req) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, req),
  },
};

// Expose API to renderer
try {
  contextBridge.exposeInMainWorld('api', api);
  console.log('✅ Preload script executed successfully');
  console.log('📡 Complete IPC API exposed to renderer');
  console.log('🔗 All channels registered:', Object.values(IPC_CHANNELS));
  console.log('🔍 API object keys:', Object.keys(api));
} catch (error) {
  console.error('❌ Failed to expose API:', error);
}

