/**
 * Recording Service
 * 
 * Implements IRecordingService interface for screen/window recording operations.
 * Uses Electron's desktopCapturer for source enumeration and file system for saving recordings.
 */

import { desktopCapturer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IRecordingService } from '../../shared/contracts/services';
import { RecordingSource, RecordingConfig } from '../../shared/types';

export class RecordingService implements IRecordingService {
  private recordingSessions: Map<string, {
    startTime: number;
    sourceId: string;
    config: RecordingConfig;
  }> = new Map();

  async getSources(types: Array<'screen' | 'window'>): Promise<RecordingSource[]> {
    try {
      console.log('🎥 Getting recording sources:', types);

      // Get sources from desktopCapturer
      const sources = await desktopCapturer.getSources({
        types: types,
        thumbnailSize: { width: 320, height: 180 }, // Generate thumbnails
        fetchWindowIcons: true,
      });

      // Convert to RecordingSource format
      const recordingSources: RecordingSource[] = sources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.id.startsWith('screen:') ? 'screen' : 'window',
        thumbnail: source.thumbnail.toDataURL(), // Convert to base64 data URL
      }));

      console.log(`✅ Found ${recordingSources.length} recording sources`);
      return recordingSources;

    } catch (error) {
      console.error('❌ Failed to get recording sources:', error);
      throw new Error(`Failed to get recording sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startRecording(sourceId: string, config: RecordingConfig): Promise<string> {
    try {
      console.log('🔴 Starting recording session:', { sourceId, config });

      // Generate unique session ID
      const sessionId = `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store session info
      this.recordingSessions.set(sessionId, {
        startTime: Date.now(),
        sourceId,
        config,
      });

      console.log(`✅ Recording session started: ${sessionId}`);
      return sessionId;

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopRecording(sessionId: string): Promise<{ outputPath: string; duration: number }> {
    try {
      console.log('⏹️ Stopping recording session:', sessionId);

      const session = this.recordingSessions.get(sessionId);
      if (!session) {
        throw new Error(`Recording session not found: ${sessionId}`);
      }

      const duration = (Date.now() - session.startTime) / 1000; // Convert to seconds
      
      // Clean up session
      this.recordingSessions.delete(sessionId);

      // Generate output path (this would typically be provided by the renderer)
      const outputPath = path.join(require('os').tmpdir(), `recording_${sessionId}.webm`);

      console.log(`✅ Recording session stopped: ${sessionId}, duration: ${duration}s`);
      return { outputPath, duration };

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw new Error(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveRecording(buffer: Buffer, filename: string): Promise<string> {
    try {
      console.log('💾 Saving recording:', filename);

      // Ensure filename has proper extension
      const ext = path.extname(filename);
      if (!ext || !['.webm', '.mp4', '.mov'].includes(ext.toLowerCase())) {
        filename += '.webm';
      }

      // Create output directory (Videos folder)
      const videosDir = path.join(require('os').homedir(), 'Videos', 'ClipForge');
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      // Generate unique filename if file exists
      let outputPath = path.join(videosDir, filename);
      let counter = 1;
      while (fs.existsSync(outputPath)) {
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        outputPath = path.join(videosDir, `${name}_${counter}${ext}`);
        counter++;
      }

      // Write buffer to file
      fs.writeFileSync(outputPath, buffer);

      console.log(`✅ Recording saved: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ Failed to save recording:', error);
      throw new Error(`Failed to save recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecordingProgress(sessionId: string): Promise<{ duration: number; fileSize: number }> {
    try {
      const session = this.recordingSessions.get(sessionId);
      if (!session) {
        throw new Error(`Recording session not found: ${sessionId}`);
      }

      const duration = (Date.now() - session.startTime) / 1000;
      
      // For now, return mock file size (in real implementation, this would track actual file size)
      const fileSize = duration * 1000000; // Mock: ~1MB per second

      return { duration, fileSize };

    } catch (error) {
      console.error('❌ Failed to get recording progress:', error);
      throw new Error(`Failed to get recording progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to get active sessions (for debugging)
  getActiveSessions(): string[] {
    return Array.from(this.recordingSessions.keys());
  }

  // Helper method to clean up all sessions (for app shutdown)
  cleanup(): void {
    console.log(`🧹 Cleaning up ${this.recordingSessions.size} recording sessions`);
    this.recordingSessions.clear();
  }
}

// Export singleton instance
export const recordingService = new RecordingService();
