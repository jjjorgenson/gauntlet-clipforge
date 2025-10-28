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
import { IPC_CHANNELS } from '../shared/contracts/ipc-channels';

// Complete IPC API implementation
const api: IpcAPI = {
  // Media operations
  media: {
    import: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_IMPORT, req),
    getMetadata: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_METADATA, req),
    openFilePicker: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_OPEN_FILE_PICKER, req),
    generateThumbnail: (req) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GENERATE_THUMBNAIL, req),
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
contextBridge.exposeInMainWorld('api', api);

// Log successful preload
console.log('✅ Preload script executed successfully');
console.log('📡 Complete IPC API exposed to renderer');
console.log('🔗 All channels registered:', Object.values(IPC_CHANNELS));

