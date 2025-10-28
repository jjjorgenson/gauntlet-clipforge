/**
 * FFmpeg Manager Service
 * 
 * Singleton class to manage FFmpeg binary paths and availability.
 * Handles bundled FFmpeg binaries in resources/bin/
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { IFFmpegManager } from '../../shared/contracts/services';

export class FFmpegManager implements IFFmpegManager {
  private static instance: FFmpegManager;
  private ffmpegPath: string | null = null;
  private ffprobePath: string | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): FFmpegManager {
    if (!FFmpegManager.instance) {
      FFmpegManager.instance = new FFmpegManager();
    }
    return FFmpegManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔧 Initializing FFmpeg Manager...');

    try {
      // Determine binary paths based on platform and environment
      const binaryPaths = this.getBinaryPaths();
      
      // Validate FFmpeg binary
      if (await this.validateBinary(binaryPaths.ffmpeg)) {
        this.ffmpegPath = binaryPaths.ffmpeg;
        console.log('✅ FFmpeg binary found:', this.ffmpegPath);
      } else {
        throw new Error(`FFmpeg binary not found at: ${binaryPaths.ffmpeg}`);
      }

      // Validate FFprobe binary
      if (await this.validateBinary(binaryPaths.ffprobe)) {
        this.ffprobePath = binaryPaths.ffprobe;
        console.log('✅ FFprobe binary found:', this.ffprobePath);
      } else {
        throw new Error(`FFprobe binary not found at: ${binaryPaths.ffprobe}`);
      }

      this.isInitialized = true;
      console.log('✅ FFmpeg Manager initialized successfully');

    } catch (error) {
      console.error('❌ FFmpeg Manager initialization failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.ffmpegPath !== null && this.ffprobePath !== null;
  }

  getFFmpegPath(): string {
    if (!this.ffmpegPath) {
      throw new Error('FFmpeg not initialized. Call initialize() first.');
    }
    return this.ffmpegPath;
  }

  getFFprobePath(): string {
    if (!this.ffprobePath) {
      throw new Error('FFprobe not initialized. Call initialize() first.');
    }
    return this.ffprobePath;
  }

  async getAvailableCodecs(): Promise<string[]> {
    if (!this.isReady()) {
      throw new Error('FFmpeg not ready');
    }

    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const command = `"${this.getFFmpegPath()}" -codecs`;
      const { stdout } = await execAsync(command);
      
      // Parse codecs from output
      const codecLines = stdout.split('\n').filter(line => 
        line.includes('D.V') || line.includes('D.A') || line.includes('D.S')
      );
      
      return codecLines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[1] || '';
      }).filter(codec => codec.length > 0);

    } catch (error) {
      console.error('Failed to get available codecs:', error);
      return [];
    }
  }

  async getAvailableFormats(): Promise<string[]> {
    if (!this.isReady()) {
      throw new Error('FFmpeg not ready');
    }

    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const command = `"${this.getFFmpegPath()}" -formats`;
      const { stdout } = await execAsync(command);
      
      // Parse formats from output
      const formatLines = stdout.split('\n').filter(line => 
        line.includes('D') && line.includes('E')
      );
      
      return formatLines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[1] || '';
      }).filter(format => format.length > 0);

    } catch (error) {
      console.error('Failed to get available formats:', error);
      return [];
    }
  }

  private getBinaryPaths(): { ffmpeg: string; ffprobe: string } {
    const isDev = process.env.NODE_ENV === 'development';
    const platform = process.platform;
    
    let basePath: string;
    
    if (isDev) {
      // Development: binaries in project resources/bin/
      basePath = path.join(__dirname, '../../../resources/bin');
    } else {
      // Production: binaries in app resources/bin/
      basePath = path.join(process.resourcesPath, 'bin');
    }

    const extension = platform === 'win32' ? '.exe' : '';
    
    return {
      ffmpeg: path.join(basePath, `ffmpeg${extension}`),
      ffprobe: path.join(basePath, `ffprobe${extension}`)
    };
  }

  private async validateBinary(binaryPath: string): Promise<boolean> {
    try {
      // Check if file exists
      if (!fs.existsSync(binaryPath)) {
        console.warn(`Binary not found: ${binaryPath}`);
        return false;
      }

      // Check if file is executable (on Unix systems)
      if (process.platform !== 'win32') {
        const stats = fs.statSync(binaryPath);
        if (!(stats.mode & parseInt('111', 8))) {
          console.warn(`Binary not executable: ${binaryPath}`);
          return false;
        }
      }

      // Try to run the binary to verify it works
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const command = `"${binaryPath}" -version`;
      await execAsync(command, { timeout: 5000 });
      
      return true;

    } catch (error) {
      console.warn(`Binary validation failed for ${binaryPath}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const ffmpegManager = FFmpegManager.getInstance();
