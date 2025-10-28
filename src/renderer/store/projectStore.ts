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
      // Update project metadata
      const updatedProject = updateProjectMetadata(state.project);
      
      // Mock save operation - in real implementation, this would use IPC
      console.log('Saving project to:', targetPath);
      console.log('Project data:', JSON.stringify(updatedProject, null, 2));
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        project: updatedProject,
        currentFilePath: targetPath,
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
      set({});
      
      // Mock load operation - in real implementation, this would use IPC
      console.log('Loading project from:', filePath);
      
      // Simulate load delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock project data - in real implementation, this would come from file
      const mockProject: Project = {
        id: uuidv4(),
        name: 'Loaded Project',
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
          created: new Date(Date.now() - 86400000), // 1 day ago
          modified: new Date()
        }
      };
      
      set({
        project: mockProject,
        currentFilePath: filePath,
        isDirty: false,
        lastSavedAt: new Date(),
        
      });
      
    } catch (error) {
      console.error('Failed to load project:', error);
      set({});
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
