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

/**
 * Register all IPC handlers
 * 
 * This function registers all IPC channels with mock implementations.
 * Real implementations will be added by individual service tracks.
 */
export function registerIpcHandlers(): void {
  console.log('📡 Registering IPC handlers...');

  // ============================================================================
  // MEDIA HANDLERS
  // ============================================================================
  
  ipcMain.handle(IPC_CHANNELS.MEDIA_IMPORT, async (event, req: MediaIPC.ImportRequest): Promise<MediaIPC.ImportResponse> => {
    console.log('📁 Media import requested:', req.filePaths);
    
    // Mock response - Track 2 will implement real FFmpeg integration
    const mockClips = req.filePaths.map((path, index) => ({
      id: `clip-${index}`,
      sourceFile: path,
      startTime: 0,
      endTime: 30, // Mock 30 second duration
      trimIn: 0,
      trimOut: 30,
      trackId: 'track-1',
      metadata: {
        duration: 30,
        resolution: { width: 1920, height: 1080 },
        frameRate: 30,
        codec: 'h264',
        size: 50000000, // 50MB
      },
    }));
    
    return { clips: mockClips };
  });

  ipcMain.handle(IPC_CHANNELS.MEDIA_GET_METADATA, async (event, req: MediaIPC.GetMetadataRequest): Promise<MediaIPC.GetMetadataResponse> => {
    console.log('📊 Media metadata requested:', req.filePath);
    
    // Mock metadata - Track 2 will implement real FFprobe integration
    const mockMetadata = {
      duration: 45.5,
      resolution: { width: 1920, height: 1080 },
      frameRate: 29.97,
      codec: 'h264',
      size: 75000000, // 75MB
    };
    
    return { metadata: mockMetadata };
  });

  ipcMain.handle(IPC_CHANNELS.MEDIA_OPEN_FILE_PICKER, async (event, req: MediaIPC.OpenFilePickerRequest): Promise<MediaIPC.OpenFilePickerResponse> => {
    console.log('📂 File picker requested:', req);
    
    // Mock file picker - Track 2 will implement real dialog
    const mockPaths = req.allowMultiple 
      ? ['/path/to/video1.mp4', '/path/to/video2.mov']
      : ['/path/to/video.mp4'];
    
    return { filePaths: mockPaths };
  });

  ipcMain.handle(IPC_CHANNELS.MEDIA_GENERATE_THUMBNAIL, async (event, req: MediaIPC.GenerateThumbnailRequest): Promise<MediaIPC.GenerateThumbnailResponse> => {
    console.log('🖼️ Thumbnail generation requested:', req);
    
    // Mock thumbnail - Track 2 will implement real FFmpeg thumbnail generation
    const mockThumbnail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    return { thumbnail: mockThumbnail };
  });

  // ============================================================================
  // RECORDING HANDLERS
  // ============================================================================
  
  ipcMain.handle(IPC_CHANNELS.RECORDING_GET_SOURCES, async (event, req: RecordingIPC.GetSourcesRequest): Promise<RecordingIPC.GetSourcesResponse> => {
    console.log('🎥 Recording sources requested:', req.types);
    
    // Mock sources - Track 3 will implement real screen/window enumeration
    const mockSources = [
      { 
        id: 'screen-1', 
        name: 'Main Display', 
        type: 'screen' as const,
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      },
      { 
        id: 'window-1', 
        name: 'Chrome Browser', 
        type: 'window' as const,
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      },
    ];
    
    return { sources: mockSources };
  });

  ipcMain.handle(IPC_CHANNELS.RECORDING_START, async (event, req: RecordingIPC.StartRecordingRequest): Promise<RecordingIPC.StartRecordingResponse> => {
    console.log('🔴 Recording start requested:', req);
    
    // Mock session - Track 3 will implement real recording
    const sessionId = `recording-${Date.now()}`;
    
    return { sessionId };
  });

  ipcMain.handle(IPC_CHANNELS.RECORDING_STOP, async (event, req: RecordingIPC.StopRecordingRequest): Promise<RecordingIPC.StopRecordingResponse> => {
    console.log('⏹️ Recording stop requested:', req.sessionId);
    
    // Mock output - Track 3 will implement real recording stop
    return {
      outputPath: '/path/to/recording.webm',
      duration: 120.5,
    };
  });

  ipcMain.handle(IPC_CHANNELS.RECORDING_SAVE, async (event, req: RecordingIPC.SaveRecordingRequest): Promise<RecordingIPC.SaveRecordingResponse> => {
    console.log('💾 Recording save requested:', req.filename);
    
    // Mock save - Track 3 will implement real file saving
    return {
      outputPath: `/path/to/saved/${req.filename}`,
    };
  });

  // ============================================================================
  // EXPORT HANDLERS
  // ============================================================================
  
  ipcMain.handle(IPC_CHANNELS.EXPORT_START, async (event, req: ExportIPC.StartExportRequest): Promise<ExportIPC.StartExportResponse> => {
    console.log('📤 Export start requested:', req.config);
    
    // Mock export - Track 4 will implement real FFmpeg export
    const exportId = `export-${Date.now()}`;
    
    return { exportId };
  });

  ipcMain.handle(IPC_CHANNELS.EXPORT_CANCEL, async (event, req: ExportIPC.CancelExportRequest): Promise<ExportIPC.CancelExportResponse> => {
    console.log('❌ Export cancel requested:', req.exportId);
    
    // Mock cancel - Track 4 will implement real cancellation
    return { success: true };
  });

  // ============================================================================
  // PROJECT HANDLERS
  // ============================================================================
  
  ipcMain.handle(IPC_CHANNELS.PROJECT_SAVE, async (event, req: ProjectIPC.SaveProjectRequest): Promise<ProjectIPC.SaveProjectResponse> => {
    console.log('💾 Project save requested:', req.filePath || 'new project');
    
    // Mock save - Track 5 will implement real project serialization
    const filePath = req.filePath || '/path/to/project.cfp';
    
    return { filePath };
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_LOAD, async (event, req: ProjectIPC.LoadProjectRequest): Promise<ProjectIPC.LoadProjectResponse> => {
    console.log('📂 Project load requested:', req.filePath);
    
    // Mock project - Track 5 will implement real project loading
    const mockProject = {
      id: 'project-1',
      name: 'Sample Project',
      version: '1.0.0',
      settings: {
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        audioSampleRate: 48000,
      },
      metadata: {
        created: new Date(),
        modified: new Date(),
        author: 'ClipForge User',
      },
      timeline: {
        tracks: [],
        duration: 0,
      },
    };
    
    return { project: mockProject };
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN_SAVE_DIALOG, async (event, req: ProjectIPC.OpenSaveDialogRequest): Promise<ProjectIPC.OpenSaveDialogResponse> => {
    console.log('💾 Save dialog requested:', req);
    
    // Mock dialog - Track 5 will implement real dialog
    return { filePath: '/path/to/save/project.cfp' };
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN_PROJECT_DIALOG, async (event, req: ProjectIPC.OpenProjectDialogRequest): Promise<ProjectIPC.OpenProjectDialogResponse> => {
    console.log('📂 Open dialog requested');
    
    // Mock dialog - Track 5 will implement real dialog
    return { filePath: '/path/to/existing/project.cfp' };
  });

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

