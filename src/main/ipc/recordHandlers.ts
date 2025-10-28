/**
 * Recording IPC Handlers
 * 
 * Handles IPC communication for recording operations.
 * Bridges renderer requests to RecordingService implementation.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { RecordingIPC } from '../../shared/contracts/ipc';
import { recordingService } from '../services/RecordingService';

/**
 * Register all recording-related IPC handlers
 */
export function registerRecordHandlers(): void {
  console.log('🎥 Registering recording IPC handlers...');

  // Get Recording Sources Handler
  ipcMain.handle(IPC_CHANNELS.RECORDING_GET_SOURCES, async (event, req: RecordingIPC.GetSourcesRequest): Promise<RecordingIPC.GetSourcesResponse> => {
    console.log('🎥 Recording sources requested:', req.types);
    
    try {
      const sources = await recordingService.getSources(req.types);
      return { sources };

    } catch (error) {
      console.error('❌ Get recording sources failed:', error);
      throw new Error(`Get recording sources failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Start Recording Handler
  ipcMain.handle(IPC_CHANNELS.RECORDING_START, async (event, req: RecordingIPC.StartRecordingRequest): Promise<RecordingIPC.StartRecordingResponse> => {
    console.log('🔴 Recording start requested:', req);
    
    try {
      const sessionId = await recordingService.startRecording(req.sourceId, req.config);
      return { sessionId };

    } catch (error) {
      console.error('❌ Start recording failed:', error);
      throw new Error(`Start recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Stop Recording Handler
  ipcMain.handle(IPC_CHANNELS.RECORDING_STOP, async (event, req: RecordingIPC.StopRecordingRequest): Promise<RecordingIPC.StopRecordingResponse> => {
    console.log('⏹️ Recording stop requested:', req.sessionId);
    
    try {
      const result = await recordingService.stopRecording(req.sessionId);
      return result;

    } catch (error) {
      console.error('❌ Stop recording failed:', error);
      throw new Error(`Stop recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Save Recording Handler
  ipcMain.handle(IPC_CHANNELS.RECORDING_SAVE, async (event, req: RecordingIPC.SaveRecordingRequest): Promise<RecordingIPC.SaveRecordingResponse> => {
    console.log('💾 Recording save requested:', req.filename);
    
    try {
      const outputPath = await recordingService.saveRecording(req.buffer, req.filename);
      return { outputPath };

    } catch (error) {
      console.error('❌ Save recording failed:', error);
      throw new Error(`Save recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  console.log('✅ Recording IPC handlers registered');
}
