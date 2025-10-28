/**
 * Electron Preload Script
 * 
 * Runs in isolated context with access to both Node.js and renderer.
 * Exposes safe APIs to the renderer via contextBridge.
 * 
 * Security: This is the ONLY bridge between main and renderer processes.
 * 
 * NOTE: Full IPC API will be implemented in Track 1.
 * For now, we just expose version info to verify the preload script works.
 */

import { contextBridge } from 'electron';

// Temporary minimal API for initial setup
// Track 1 will implement the full IpcAPI from @contracts/ipc
const api = {
  // Version information (for testing preload works)
  _versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
  
  // Platform information
  _platform: process.platform,
};

// Expose API to renderer
contextBridge.exposeInMainWorld('api', api);

// Log successful preload
console.log('✅ Preload script executed successfully');
console.log('📦 Temporary API exposed (Track 1 will add full IPC API)');

// Note: The full Window.api type is declared in @contracts/ipc
// Track 1 will implement the complete IpcAPI interface

