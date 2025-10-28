/**
 * useIPC Hook - IPC Calls with React Patterns
 * 
 * Wraps window.api calls with React patterns for loading states and errors.
 * Provides a clean API for IPC operations with proper error handling.
 */

import { useState, useCallback } from 'react';
import { useStore } from '../store';
import '../../shared/contracts/ipc'; // Import for global window.api declaration

// IPC operation state
interface IPCOperationState {
  loading: boolean;
  error: string | null;
}

export const useIPC = () => {
  const { media, export: exportStore, project } = useStore();
  
  // State for different operations
  const [importState, setImportState] = useState<IPCOperationState>({ loading: false, error: null });
  const [exportState, setExportState] = useState<IPCOperationState>({ loading: false, error: null });
  const [saveState, setSaveState] = useState<IPCOperationState>({ loading: false, error: null });
  const [loadState, setLoadState] = useState<IPCOperationState>({ loading: false, error: null });

  // Import media files
  const importMedia = useCallback(async (filePaths: string[]) => {
    if (!window.api?.media?.import) {
      setImportState({ loading: false, error: 'Media API not available' });
      return;
    }

    setImportState({ loading: true, error: null });
    
    try {
      const result = await window.api.media.import({ filePaths });
      
      if (result.clips && result.clips.length > 0) {
        // Add imported clips to media store
        // This would typically process the imported files and add them to the media store
        console.log('Media imported successfully:', result);
        setImportState({ loading: false, error: null });
      } else {
        setImportState({ loading: false, error: 'No clips were imported' });
      }
    } catch (error) {
      setImportState({ loading: false, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }, []);

  // Open file picker and import
  const importMediaFromPicker = useCallback(async () => {
    if (!window.api?.media?.openFilePicker) {
      setImportState({ loading: false, error: 'File picker API not available' });
      return;
    }

    setImportState({ loading: true, error: null });
    
    try {
      const result = await window.api.media.openFilePicker({
        allowMultiple: true,
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.filePaths && result.filePaths.length > 0) {
        await importMedia(result.filePaths);
      } else {
        setImportState({ loading: false, error: null });
      }
    } catch (error) {
      setImportState({ loading: false, error: error instanceof Error ? error.message : 'File picker failed' });
    }
  }, [importMedia]);

  // Export video
  const exportVideo = useCallback(async (config: any) => {
    if (!window.api?.export?.start) {
      setExportState({ loading: false, error: 'Export API not available' });
      return;
    }

    setExportState({ loading: true, error: null });
    
    try {
      const result = await window.api.export.start(config);
      
      if (result.exportId) {
        setExportState({ loading: false, error: null });
      } else {
        setExportState({ loading: false, error: 'Export failed to start' });
      }
    } catch (error) {
      setExportState({ loading: false, error: error instanceof Error ? error.message : 'Export failed' });
    }
  }, []);

  // Save project
  const saveProject = useCallback(async (filePath?: string) => {
    if (!window.api?.project?.save) {
      setSaveState({ loading: false, error: 'Project API not available' });
      return;
    }

    setSaveState({ loading: true, error: null });
    
    try {
      // Get current project from store
      if (!project.project) {
        setSaveState({ loading: false, error: 'No project to save' });
        return;
      }

      const result = await window.api.project.save({ 
        project: project.project,
        filePath 
      });
      
      if (result.filePath) {
        setSaveState({ loading: false, error: null });
      } else {
        setSaveState({ loading: false, error: 'Save failed' });
      }
    } catch (error) {
      setSaveState({ loading: false, error: error instanceof Error ? error.message : 'Save failed' });
    }
  }, []);

  // Load project
  const loadProject = useCallback(async (filePath: string) => {
    if (!window.api?.project?.load) {
      setLoadState({ loading: false, error: 'Project API not available' });
      return;
    }

    setLoadState({ loading: true, error: null });
    
    try {
      const result = await window.api.project.load({ filePath });
      
      if (result.project) {
        setLoadState({ loading: false, error: null });
      } else {
        setLoadState({ loading: false, error: 'Load failed' });
      }
    } catch (error) {
      setLoadState({ loading: false, error: error instanceof Error ? error.message : 'Load failed' });
    }
  }, []);

  // Open save dialog
  const openSaveDialog = useCallback(async () => {
    if (!window.api?.project?.openSaveDialog) {
      return null;
    }

    try {
      const result = await window.api.project.openSaveDialog({
        defaultPath: 'untitled-project.json',
        defaultName: 'untitled-project.json'
      });
      
      return result.filePath;
    } catch (error) {
      console.error('Save dialog failed:', error);
      return null;
    }
  }, []);

  // Open load dialog
  const openLoadDialog = useCallback(async () => {
    if (!window.api?.project?.openProjectDialog) {
      return null;
    }

    try {
      const result = await window.api.project.openProjectDialog({
        filters: [
          { name: 'ClipForge Project', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      return result.filePath;
    } catch (error) {
      console.error('Load dialog failed:', error);
      return null;
    }
  }, []);

  // Get system path
  const getSystemPath = useCallback(async (name: 'home' | 'desktop' | 'documents' | 'downloads' | 'videos' | 'temp') => {
    if (!window.api?.system?.getPath) {
      return null;
    }

    try {
      const result = await window.api.system.getPath({ name });
      return result.path;
    } catch (error) {
      console.error('Get system path failed:', error);
      return null;
    }
  }, []);

  // Show item in file manager
  const showItemInFileManager = useCallback(async (path: string) => {
    if (!window.api?.system?.showItem) {
      return false;
    }

    try {
      const result = await window.api.system.showItem({ path });
      return result.success;
    } catch (error) {
      console.error('Show item failed:', error);
      return false;
    }
  }, []);

  // Open external URL
  const openExternal = useCallback(async (url: string) => {
    if (!window.api?.system?.openExternal) {
      return false;
    }

    try {
      const result = await window.api.system.openExternal({ url });
      return result.success;
    } catch (error) {
      console.error('Open external failed:', error);
      return false;
    }
  }, []);

  return {
    // Import operations
    importMedia,
    importMediaFromPicker,
    importLoading: importState.loading,
    importError: importState.error,
    
    // Export operations
    exportVideo,
    exportLoading: exportState.loading,
    exportError: exportState.error,
    
    // Project operations
    saveProject,
    loadProject,
    openSaveDialog,
    openLoadDialog,
    saveLoading: saveState.loading,
    saveError: saveState.error,
    loadLoading: loadState.loading,
    loadError: loadState.error,
    
    // System operations
    getSystemPath,
    showItemInFileManager,
    openExternal
  };
};

// Export default
export default useIPC;
