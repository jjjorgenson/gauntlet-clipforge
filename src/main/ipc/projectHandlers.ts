/**
 * Project IPC Handlers
 *
 * Handles IPC communication for project operations including save, load, and file dialogs.
 * Implements ProjectIPC namespace from @contracts/ipc
 */

import { ipcMain, dialog } from 'electron';
import { IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { ProjectIPC } from '../../shared/contracts/ipc';
import { projectService } from '../services/ProjectService';

export function registerProjectHandlers(): void {
  console.log('📁 Registering project IPC handlers...');

  // Save project to file
  ipcMain.handle(IPC_CHANNELS.PROJECT_SAVE, async (event, req: ProjectIPC.SaveProjectRequest): Promise<ProjectIPC.SaveProjectResponse> => {
    console.log('💾 IPC: Save project requested:', req.filePath || 'new project');
    
    try {
      if (!req.project) {
        throw new Error('Project data is required');
      }
      
      if (!req.filePath) {
        throw new Error('File path is required');
      }
      
      await projectService.saveProject(req.project, req.filePath);
      
      return { filePath: req.filePath };
    } catch (error: any) {
      console.error('❌ IPC: Failed to save project:', error);
      throw new Error(`Failed to save project: ${error.message}`);
    }
  });

  // Load project from file
  ipcMain.handle(IPC_CHANNELS.PROJECT_LOAD, async (event, req: ProjectIPC.LoadProjectRequest): Promise<ProjectIPC.LoadProjectResponse> => {
    console.log('📂 IPC: Load project requested:', req.filePath);
    
    try {
      if (!req.filePath) {
        throw new Error('File path is required');
      }
      
      const project = await projectService.loadProject(req.filePath);
      
      return { project };
    } catch (error: any) {
      console.error('❌ IPC: Failed to load project:', error);
      throw new Error(`Failed to load project: ${error.message}`);
    }
  });

  // Open save dialog
  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN_SAVE_DIALOG, async (event, req: ProjectIPC.OpenSaveDialogRequest): Promise<ProjectIPC.OpenSaveDialogResponse> => {
    console.log('💾 IPC: Save dialog requested');
    
    try {
      // If defaultPath ends with .mp4, this is an EXPORT dialog (not project save)
      const isExportDialog = req.defaultPath?.endsWith('.mp4');
      
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: isExportDialog ? 'Export Video' : 'Save ClipForge Project',
        defaultPath: req.defaultPath || 'Untitled Project.clipforge',
        filters: isExportDialog 
          ? [
              { name: 'Video Files', extensions: ['mp4'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          : [
              { name: 'ClipForge Projects', extensions: ['clipforge'] },
              { name: 'All Files', extensions: ['*'] }
            ],
        properties: ['createDirectory'],
      });

      if (canceled || !filePath) {
        return { filePath: null };
      }

      // Ensure correct extension
      let finalPath = filePath;
      if (isExportDialog && !filePath.endsWith('.mp4')) {
        finalPath = `${filePath}.mp4`;
      } else if (!isExportDialog && !filePath.endsWith('.clipforge')) {
        finalPath = `${filePath}.clipforge`;
      }
      
      return { filePath: finalPath };
    } catch (error: any) {
      console.error('❌ IPC: Failed to open save dialog:', error);
      throw new Error(`Failed to open save dialog: ${error.message}`);
    }
  });

  // Open project dialog
  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN_PROJECT_DIALOG, async (event, req: ProjectIPC.OpenProjectDialogRequest): Promise<ProjectIPC.OpenProjectDialogResponse> => {
    console.log('📂 IPC: Open project dialog requested');
    
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Open ClipForge Project',
        filters: [
          { name: 'ClipForge Projects', extensions: ['clipforge'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile'],
      });

      if (canceled || !filePaths || filePaths.length === 0) {
        return { filePath: null };
      }

      return { filePath: filePaths[0] };
    } catch (error: any) {
      console.error('❌ IPC: Failed to open project dialog:', error);
      throw new Error(`Failed to open project dialog: ${error.message}`);
    }
  });

  // Additional handlers for project management
  ipcMain.handle('project:get-recent', async (): Promise<{ projects: Array<{ filePath: string; name: string; modifiedAt: Date }> }> => {
    console.log('📋 IPC: Get recent projects requested');
    
    try {
      const projects = await projectService.listRecentProjects();
      return { projects };
    } catch (error: any) {
      console.error('❌ IPC: Failed to get recent projects:', error);
      throw new Error(`Failed to get recent projects: ${error.message}`);
    }
  });

  ipcMain.handle('project:create-new', async (event, req: { name: string }): Promise<{ project: any }> => {
    console.log('🆕 IPC: Create new project requested:', req.name);
    
    try {
      const project = projectService.createProject(req.name);
      return { project };
    } catch (error: any) {
      console.error('❌ IPC: Failed to create new project:', error);
      throw new Error(`Failed to create new project: ${error.message}`);
    }
  });

  ipcMain.handle('project:validate', async (event, req: { filePath: string }): Promise<{ isValid: boolean; version?: string; error?: string }> => {
    console.log('✅ IPC: Validate project requested:', req.filePath);
    
    try {
      return await projectService.validateProject(req.filePath);
    } catch (error: any) {
      console.error('❌ IPC: Failed to validate project:', error);
      return { isValid: false, error: error.message };
    }
  });

  ipcMain.handle('project:get-info', async (event, req: { filePath: string }): Promise<{ name: string; modified: string; size: number }> => {
    console.log('ℹ️ IPC: Get project info requested:', req.filePath);
    
    try {
      return await projectService.getProjectInfo(req.filePath);
    } catch (error: any) {
      console.error('❌ IPC: Failed to get project info:', error);
      throw new Error(`Failed to get project info: ${error.message}`);
    }
  });

  console.log('✅ Project IPC handlers registered');
}
