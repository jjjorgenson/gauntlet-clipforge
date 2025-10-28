/**
 * Export IPC Handlers
 * 
 * Handles all export-related IPC communication between main and renderer processes.
 * Implements the ExportIPC contract from shared contracts.
 */

import { ipcMain, WebContents } from 'electron';
import { IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { ExportIPC } from '../../shared/contracts/ipc';
import { exportService } from '../services/ExportService';

/**
 * Register all export IPC handlers
 */
export function registerExportHandlers(): void {
  console.log('📤 Registering export IPC handlers...');

  // ============================================================================
  // EXPORT START HANDLER
  // ============================================================================
  
  ipcMain.handle(
    IPC_CHANNELS.EXPORT_START,
    async (event, req: ExportIPC.StartExportRequest): Promise<ExportIPC.StartExportResponse> => {
      console.log('🎬 Export start requested:', {
        outputPath: req.config.outputPath,
        quality: req.config.quality,
        resolution: req.config.resolution,
        codec: req.config.codec,
        timelineClips: req.timeline.tracks.length
      });

      try {
        // Start the export process
        const exportId = await exportService.startExport(req.config, req.timeline);
        
        // Set up progress event listeners for this specific export
        setupProgressListeners(exportId, event.sender);
        
        console.log(`✅ Export started with ID: ${exportId}`);
        return { exportId };

      } catch (error) {
        console.error('❌ Export start failed:', error);
        throw error;
      }
    }
  );

  // ============================================================================
  // EXPORT CANCEL HANDLER
  // ============================================================================
  
  ipcMain.handle(
    IPC_CHANNELS.EXPORT_CANCEL,
    async (event, req: ExportIPC.CancelExportRequest): Promise<ExportIPC.CancelExportResponse> => {
      console.log('🛑 Export cancel requested:', req.exportId);

      try {
        await exportService.cancelExport(req.exportId);
        
        console.log(`✅ Export ${req.exportId} cancelled successfully`);
        return { success: true };

      } catch (error) {
        console.error(`❌ Export cancel failed for ${req.exportId}:`, error);
        return { success: false };
      }
    }
  );

  console.log('✅ Export IPC handlers registered');
}

/**
 * Set up progress event listeners for a specific export
 */
function setupProgressListeners(exportId: string, webContents: WebContents): void {
  const eventEmitter = exportService.getEventEmitter();
  
  // Progress event listener
  const progressListener = (data: { exportId: string; progress: any }) => {
    if (data.exportId === exportId) {
      const progressEvent: ExportIPC.ExportProgressEvent = {
        exportId: data.exportId,
        progress: data.progress
      };
      
      webContents.send(IPC_CHANNELS.EXPORT_PROGRESS, progressEvent);
      
      console.log(`📊 Export ${exportId} progress:`, {
        percent: data.progress.percent.toFixed(1) + '%',
        fps: data.progress.fps.toFixed(1),
        eta: formatTime(data.progress.eta)
      });
    }
  };

  // Completion event listener
  const completeListener = (data: { exportId: string; success: boolean; outputPath?: string; error?: string }) => {
    if (data.exportId === exportId) {
      const completeEvent: ExportIPC.ExportCompleteEvent = {
        exportId: data.exportId,
        success: data.success,
        outputPath: data.outputPath,
        error: data.error
      };
      
      webContents.send(IPC_CHANNELS.EXPORT_COMPLETE, completeEvent);
      
      // Clean up listeners
      eventEmitter.removeListener('exportProgress', progressListener);
      eventEmitter.removeListener('exportComplete', completeListener);
      
      if (data.success) {
        console.log(`🎉 Export ${exportId} completed successfully: ${data.outputPath}`);
      } else {
        console.error(`💥 Export ${exportId} failed: ${data.error}`);
      }
    }
  };

  // Register listeners
  eventEmitter.on('exportProgress', progressListener);
  eventEmitter.on('exportComplete', completeListener);
}

/**
 * Format time in seconds to HH:MM:SS format
 */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '--:--:--';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
