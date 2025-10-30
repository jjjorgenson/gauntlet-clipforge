/**
 * Testing Contracts - Mock Interfaces
 */

import { IpcAPI } from './ipc';

export const createMockIpcAPI = (): IpcAPI => ({
  media: {
    import: async () => ({ clips: [], errors: [] }),
    getMetadata: async () => ({ 
      metadata: {
        duration: 0,
        resolution: { width: 1920, height: 1080 },
        frameRate: 30,
        codec: 'h264',
        size: 0,
      }
    }),
    openFilePicker: async () => ({ filePaths: null }),
    generateThumbnail: async () => ({ thumbnail: '' }),
    saveDroppedFile: async () => ({ filePath: '' }),
  },
  recording: {
    getSources: async () => ({ sources: [] }),
    start: async () => ({ sessionId: '' }),
    stop: async () => ({ outputPath: '', duration: 0 }),
    saveRecording: async () => ({ outputPath: '' }),
    onProgress: () => () => {},
  },
  export: {
    start: async () => ({ exportId: '' }),
    cancel: async () => ({ success: true }),
    onProgress: () => () => {},
    onComplete: () => () => {},
  },
  project: {
    save: async () => ({ filePath: '' }),
    load: async () => ({ 
      project: {
        id: '',
        name: '',
        version: '1.0.0',
        timeline: { tracks: [], duration: 0 },
        settings: {
          fps: 30,
          resolution: { width: 1920, height: 1080 },
          audioSampleRate: 48000,
        },
        metadata: {
          created: new Date(),
          modified: new Date(),
        },
      }
    }),
    openSaveDialog: async () => ({ filePath: null }),
    openProjectDialog: async () => ({ filePath: null }),
  },
  system: {
    getPath: async () => ({ path: '' }),
    showItem: async () => ({ success: true }),
    openExternal: async () => ({ success: true }),
  },
});

