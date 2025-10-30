/**
 * Project Store - Zustand Implementation
 * 
 * Manages project state, save/load operations, and file management.
 * Implements ProjectStoreContract interface.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  ProjectStoreContract
} from '../../shared/contracts/stores';
import { Project } from '../../shared/types';
import { useWebcamStore } from './webcamStore';

// Default project state
const defaultState: ProjectStoreContract.State = {
  project: null,
  currentFilePath: null,
  isDirty: false,
  lastSavedAt: null
};

// Helper functions
const createNewProject = (name: string): Project => ({
  id: uuidv4(),
  name,
  version: '1.0.0',
  timeline: {
    tracks: [],
    duration: 0
  },
  settings: {
    fps: 30,
    resolution: { width: 1920, height: 1080 },
    audioSampleRate: 48000
  },
  metadata: {
    created: new Date(),
    modified: new Date()
  }
});

const updateProjectMetadata = (project: Project): Project => ({
  ...project,
  metadata: {
    ...project.metadata,
    modified: new Date()
  }
});

// Project Store Implementation
export const useProjectStore = create<ProjectStoreContract.Store>((set, get) => ({
  ...defaultState,

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

  newProject: (name: string) => {
    const project = createNewProject(name);
    
    set({
      project,
      currentFilePath: null,
      isDirty: false,
      lastSavedAt: null
    });
  },

  saveProject: async (filePath?: string) => {
    const state = get();
    if (!state.project) return;

    const targetPath = filePath || state.currentFilePath;
    if (!targetPath) {
      throw new Error('No file path provided for saving');
    }

    try {
      // Get webcam settings from webcam store
      const webcamSettings = useWebcamStore.getState().getSettings();
      
      // Update project metadata and include webcam settings
      const updatedProject = {
        ...updateProjectMetadata(state.project),
        webcamSettings // Add webcam settings to project
      };
      
      // Save via IPC
      const savedPath = await window.api.project.save({
        project: updatedProject,
        filePath: targetPath
      });
      
      console.log('✅ Project saved to:', savedPath);
      
      set({
        project: updatedProject,
        currentFilePath: savedPath,
        isDirty: false,
        lastSavedAt: new Date()
      });
      
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  },

  loadProject: async (filePath: string) => {
    try {
      // Load project via IPC
      console.log('Loading project from:', filePath);
      const loadedProject = await window.api.project.load({ filePath });
      
      // Restore webcam settings to webcam store
      const webcamStore = useWebcamStore.getState();
      if (loadedProject.webcamSettings) {
        webcamStore.loadFromProject(loadedProject.webcamSettings);
        console.log('✅ Restored webcam settings from project');
      } else {
        // No webcam settings in project - use defaults
        webcamStore.loadFromProject(undefined);
        console.log('ℹ️ No webcam settings in project, using defaults');
      }
      
      set({
        project: loadedProject,
        currentFilePath: filePath,
        isDirty: false,
        lastSavedAt: new Date()
      });
      
      console.log('✅ Project loaded successfully');
      
    } catch (error) {
      console.error('Failed to load project:', error);
      set(defaultState);
      throw error;
    }
  },

  closeProject: () => {
    set({
      project: null,
      currentFilePath: null,
      isDirty: false,
      lastSavedAt: null
    });
  },

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  updateProjectSettings: (settings: Partial<Project['settings']>) => {
    set((state) => {
      if (!state.project) return state;
      
      const updatedProject = {
        ...state.project,
        settings: { ...state.project.settings, ...settings }
      };
      
      return {
        project: updatedProject,
        isDirty: true
      };
    });
  }
}));
