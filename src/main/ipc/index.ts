/**
 * IPC Handlers Registry
 * 
 * Central registration point for all IPC handlers.
 * Track 1 Implementation: All channels with mock responses
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { 
  MediaIPC, 
  RecordingIPC, 
  ExportIPC, 
  ProjectIPC, 
  SystemIPC 
} from '../../shared/contracts/ipc';
import { registerMediaHandlers } from './mediaHandlers';
import { registerRecordHandlers } from './recordHandlers';
import { registerExportHandlers } from './exportHandlers';
import { registerProjectHandlers } from './projectHandlers';

/**
 * Register all IPC handlers
 * 
 * This function registers all IPC channels with mock implementations.
 * Real implementations will be added by individual service tracks.
 */
export function registerIpcHandlers(): void {
  console.log('📡 Registering IPC handlers...');

        // Register Track 2: Media handlers (real implementation)
        registerMediaHandlers();

        // Register Track 3: Recording handlers (real implementation)
        registerRecordHandlers();

        // Register Track 4: Export handlers (real implementation)
        registerExportHandlers();

  // ============================================================================
  // PROJECT HANDLERS
  // ============================================================================
  registerProjectHandlers();

  // ============================================================================
  // SYSTEM HANDLERS
  // ============================================================================
  
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PATH, async (event, req: SystemIPC.GetPathRequest): Promise<SystemIPC.GetPathResponse> => {
    console.log('📁 System path requested:', req.name);
    
    // Mock paths - Track 1 can implement real system paths
    const mockPaths = {
      home: '/Users/user',
      desktop: '/Users/user/Desktop',
      documents: '/Users/user/Documents',
      downloads: '/Users/user/Downloads',
      videos: '/Users/user/Videos',
      temp: '/tmp',
    };
    
    return { path: mockPaths[req.name] };
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_SHOW_ITEM, async (event, req: SystemIPC.ShowItemRequest): Promise<SystemIPC.ShowItemResponse> => {
    console.log('👁️ Show item requested:', req.path);
    
    // Mock show - Track 1 can implement real file system integration
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, async (event, req: SystemIPC.OpenExternalRequest): Promise<SystemIPC.OpenExternalResponse> => {
    console.log('🌐 Open external requested:', req.url);
    
    // Mock open - Track 1 can implement real external opening
    return { success: true };
  });

  console.log('✅ All IPC handlers registered');
  console.log('📋 Registered channels:', Object.values(IPC_CHANNELS));
}

