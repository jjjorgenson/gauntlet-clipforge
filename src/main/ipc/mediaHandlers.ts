/**
 * Media IPC Handlers
 * 
 * Handles IPC communication for media operations.
 * Bridges renderer requests to MediaService implementation.
 */

import { ipcMain, dialog } from 'electron';
import { IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { MediaIPC } from '../../shared/contracts/ipc';
import { mediaService } from '../services/MediaService';
import { ffmpegManager } from '../services/FFmpegManager';

/**
 * Register all media-related IPC handlers
 */
export function registerMediaHandlers(): void {
  console.log('📁 Registering media IPC handlers...');

  // Media Import Handler
  ipcMain.handle(IPC_CHANNELS.MEDIA_IMPORT, async (event, req: MediaIPC.ImportRequest): Promise<MediaIPC.ImportResponse> => {
    console.log('📁 Media import requested:', req.filePaths);
    
    try {
      // Ensure FFmpeg is initialized
      if (!ffmpegManager.isReady()) {
        await ffmpegManager.initialize();
      }

      const clips = [];
      const errors = [];

      for (const filePath of req.filePaths) {
        try {
          // Validate the video file
          const validation = await mediaService.validateVideoFile(filePath);
          if (!validation.isValid) {
            errors.push({ path: filePath, error: validation.error || 'Invalid video file' });
            continue;
          }

          // Get metadata
          const metadata = await mediaService.getMetadata(filePath);
          console.log('📊 Metadata received:', { 
            duration: metadata.duration, 
            resolution: metadata.resolution,
            codec: metadata.codec 
          });
          
          // Generate a thumbnail at 5 seconds or 10% of duration
          // Ensure we have a valid duration before calculating timestamp
          const validDuration = metadata.duration && !isNaN(metadata.duration) ? metadata.duration : 30;
          const thumbnailTime = Math.min(5, validDuration * 0.1);
          
          console.log('🖼️ Generating thumbnail at time:', thumbnailTime, 'seconds');
          
          const thumbnail = await mediaService.generateThumbnail(
            filePath, 
            thumbnailTime, 
            320, 
            180
          );

          // Create clip object
          const clip = {
            id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceFile: filePath,
            startTime: 0,
            endTime: metadata.duration,
            trimIn: 0,
            trimOut: metadata.duration,
            trackId: 'track-1',
            metadata: {
              ...metadata,
              thumbnail,
            },
          };

          clips.push(clip);
          console.log(`✅ Imported: ${filePath}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ path: filePath, error: errorMessage });
          console.error(`❌ Failed to import ${filePath}:`, errorMessage);
        }
      }

      return { clips, errors: errors.length > 0 ? errors : undefined };

    } catch (error) {
      console.error('❌ Media import failed:', error);
      throw new Error(`Media import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Get Metadata Handler
  ipcMain.handle(IPC_CHANNELS.MEDIA_GET_METADATA, async (event, req: MediaIPC.GetMetadataRequest): Promise<MediaIPC.GetMetadataResponse> => {
    console.log('📊 Media metadata requested:', req.filePath);
    
    try {
      // Ensure FFmpeg is initialized
      if (!ffmpegManager.isReady()) {
        await ffmpegManager.initialize();
      }

      const metadata = await mediaService.getMetadata(req.filePath);
      return { metadata };

    } catch (error) {
      console.error('❌ Get metadata failed:', error);
      throw new Error(`Get metadata failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Open File Picker Handler
  ipcMain.handle(IPC_CHANNELS.MEDIA_OPEN_FILE_PICKER, async (event, req: MediaIPC.OpenFilePickerRequest): Promise<MediaIPC.OpenFilePickerResponse> => {
    console.log('📂 File picker requested:', req);
    
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Video Files',
        properties: req.allowMultiple ? ['openFile', 'multiSelections'] : ['openFile'],
        filters: req.filters || [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'] },
          { name: 'All Files', extensions: ['*'] }
        ],
      });

      if (result.canceled) {
        return { filePaths: null };
      }

      return { filePaths: result.filePaths };

    } catch (error) {
      console.error('❌ File picker failed:', error);
      throw new Error(`File picker failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Generate Thumbnail Handler
  ipcMain.handle(IPC_CHANNELS.MEDIA_GENERATE_THUMBNAIL, async (event, req: MediaIPC.GenerateThumbnailRequest): Promise<MediaIPC.GenerateThumbnailResponse> => {
    console.log('🖼️ Thumbnail generation requested:', req);
    
    try {
      // Ensure FFmpeg is initialized
      if (!ffmpegManager.isReady()) {
        await ffmpegManager.initialize();
      }

      const thumbnail = await mediaService.generateThumbnail(
        req.filePath,
        req.timestamp,
        req.width,
        req.height
      );

      return { thumbnail };

    } catch (error) {
      console.error('❌ Thumbnail generation failed:', error);
      throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  console.log('✅ Media IPC handlers registered');
}
