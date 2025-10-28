/**
 * Project Service
 *
 * Handles project file operations including save, load, and recent projects management.
 * Implements IProjectService from @contracts/services
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import { IProjectService } from '../../shared/contracts/services';
import { Project, ProjectSettings, ProjectMetadata } from '../../shared/types';

export class ProjectService implements IProjectService {
  private readonly recentProjectsFile: string;
  private readonly maxRecentProjects: number = 10;

  constructor() {
    // Store recent projects in userData directory
    this.recentProjectsFile = path.join(app.getPath('userData'), 'recent-projects.json');
    this.ensureUserDataDirectory();
  }

  private async ensureUserDataDirectory(): Promise<void> {
    try {
      const userDataPath = app.getPath('userData');
      await fs.mkdir(userDataPath, { recursive: true });
      console.log(`✅ User data directory ensured: ${userDataPath}`);
    } catch (error) {
      console.error(`❌ Failed to create user data directory: ${error}`);
    }
  }

  async saveProject(project: Project, filePath?: string): Promise<string> {
    console.log('💾 Saving project:', filePath || 'new project');
    
    try {
      // Validate project structure
      this.validateProjectStructure(project);
      
      // Generate file path if not provided
      const finalFilePath = filePath || this.generateProjectPath(project.name);
      
      // Ensure directory exists
      const dir = path.dirname(finalFilePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Serialize project to JSON
      const projectData = {
        ...project,
        metadata: {
          ...project.metadata,
          modified: new Date(),
        },
      };
      
      const jsonData = JSON.stringify(projectData, null, 2);
      
      // Write to file
      await fs.writeFile(finalFilePath, jsonData, 'utf8');
      
      // Add to recent projects
      await this.addToRecentProjects(finalFilePath);
      
      console.log(`✅ Project saved successfully: ${finalFilePath}`);
      return finalFilePath;
    } catch (error) {
      console.error(`❌ Failed to save project:`, error);
      throw new Error(`Failed to save project: ${error}`);
    }
  }

  async loadProject(filePath: string): Promise<Project> {
    console.log('📂 Loading project:', filePath);
    
    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Read and parse JSON
      const jsonData = await fs.readFile(filePath, 'utf8');
      const projectData = JSON.parse(jsonData);
      
      // Validate project structure
      this.validateProject(projectData);
      
      // Add to recent projects
      await this.addToRecentProjects(filePath);
      
      console.log(`✅ Project loaded successfully: ${filePath}`);
      return projectData;
    } catch (error) {
      console.error(`❌ Failed to load project from ${filePath}:`, error);
      throw new Error(`Failed to load project: ${error}`);
    }
  }

  async listRecentProjects(): Promise<Array<{
    filePath: string;
    name: string;
    modifiedAt: Date;
  }>> {
    console.log('📋 Getting recent projects');
    
    try {
      // Check if recent projects file exists
      await fs.access(this.recentProjectsFile);
      
      // Read and parse recent projects
      const jsonData = await fs.readFile(this.recentProjectsFile, 'utf8');
      const recentProjects = JSON.parse(jsonData);
      
      // Get project info for each recent project
      const projectInfos = [];
      for (const projectPath of recentProjects) {
        try {
          const info = await this.getProjectInfo(projectPath);
          projectInfos.push({
            filePath: projectPath,
            name: info.name,
            modifiedAt: new Date(info.modified),
          });
        } catch {
          console.log(`⚠️ Recent project no longer exists: ${projectPath}`);
        }
      }
      
      return projectInfos.slice(0, this.maxRecentProjects);
    } catch (error) {
      console.log('📋 No recent projects file found, returning empty array');
      return [];
    }
  }

  async addToRecentProjects(projectPath: string): Promise<void> {
    try {
      // Get current recent projects
      const recentProjects = await this.getRecentProjects();
      
      // Remove if already exists (to move to front)
      const filteredProjects = recentProjects.filter(p => p !== projectPath);
      
      // Add to front and limit size
      const updatedProjects = [projectPath, ...filteredProjects].slice(0, this.maxRecentProjects);
      
      // Save updated list
      await this.saveRecentProjects(updatedProjects);
      
      console.log(`✅ Added to recent projects: ${projectPath}`);
    } catch (error) {
      console.error(`❌ Failed to add to recent projects: ${error}`);
    }
  }

  createProject(name: string): Project {
    console.log('🆕 Creating new project:', name);
    
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
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

    console.log(`✅ New project created: ${project.id}`);
    return project;
  }

  async validateProject(filePath: string): Promise<{
    isValid: boolean;
    version?: string;
    error?: string;
  }> {
    try {
      await fs.access(filePath);
      
      const jsonData = await fs.readFile(filePath, 'utf8');
      const projectData = JSON.parse(jsonData);
      
      this.validateProjectStructure(projectData);
      
      return { 
        isValid: true, 
        version: projectData.version 
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private validateProjectStructure(project: any): void {
    if (!project || typeof project !== 'object') {
      throw new Error('Project must be an object');
    }
    
    if (!project.id || typeof project.id !== 'string') {
      throw new Error('Project must have a valid id');
    }
    
    if (!project.name || typeof project.name !== 'string') {
      throw new Error('Project must have a valid name');
    }
    
    if (!project.version || typeof project.version !== 'string') {
      throw new Error('Project must have a valid version');
    }
    
    if (!project.settings || typeof project.settings !== 'object') {
      throw new Error('Project must have valid settings');
    }
    
    if (!project.metadata || typeof project.metadata !== 'object') {
      throw new Error('Project must have valid metadata');
    }
    
    if (!project.timeline || typeof project.timeline !== 'object') {
      throw new Error('Project must have valid timeline');
    }
  }

  private async getRecentProjects(): Promise<string[]> {
    try {
      await fs.access(this.recentProjectsFile);
      const jsonData = await fs.readFile(this.recentProjectsFile, 'utf8');
      return JSON.parse(jsonData);
    } catch {
      return [];
    }
  }

  private generateProjectPath(name: string): string {
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedName}.clipforge`;
    return path.join(app.getPath('documents'), 'ClipForge', fileName);
  }

  private async saveRecentProjects(projects: string[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(projects, null, 2);
      await fs.writeFile(this.recentProjectsFile, jsonData, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to save recent projects: ${error}`);
    }
  }

  async getProjectInfo(filePath: string): Promise<{ name: string; modified: string; size: number }> {
    try {
      const stats = await fs.stat(filePath);
      const jsonData = await fs.readFile(filePath, 'utf8');
      const projectData = JSON.parse(jsonData);
      
      return {
        name: projectData.name || 'Unknown Project',
        modified: projectData.metadata?.modified || stats.mtime.toISOString(),
        size: stats.size,
      };
    } catch (error) {
      throw new Error(`Failed to get project info: ${error}`);
    }
  }
}

export const projectService = new ProjectService();
