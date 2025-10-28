/**
 * IPC Handlers Registry
 * 
 * Central registration point for all IPC handlers.
 * Handlers will be implemented in Track 1.
 */

import { ipcMain } from 'electron';

/**
 * Register all IPC handlers
 * 
 * This function is called once during app initialization.
 * Individual track implementations will add their handlers here.
 */
export function registerIpcHandlers(): void {
  console.log('📡 Registering IPC handlers...');

  // Track 1 will implement:
  // - registerMediaHandlers(ipcMain)
  // - registerRecordingHandlers(ipcMain)
  // - registerExportHandlers(ipcMain)
  // - registerProjectHandlers(ipcMain)
  // - registerSystemHandlers(ipcMain)

  // For now, just a test handler
  ipcMain.handle('ping', async () => {
    console.log('🏓 Ping received from renderer');
    return 'pong';
  });

  console.log('✅ IPC handlers registered');
}

/**
 * Example of how Track 1 will add handlers:
 * 
 * export function registerMediaHandlers(ipc: typeof ipcMain): void {
 *   ipc.handle('media:import', async (event, { filePaths }) => {
 *     // Implementation
 *   });
 * }
 */

