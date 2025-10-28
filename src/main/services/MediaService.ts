/**
 * Media Service
 * 
 * Implements IMediaService interface for video processing operations.
 * Uses FFmpeg for metadata extraction, thumbnail generation, and video manipulation.
 */

import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { IMediaService } from '../../shared/contracts/services';
import { VideoMetadata } from '../../shared/types';
import { ffmpegManager } from './FFmpegManager';

export class MediaService implements IMediaService {
  private ffmpeg: typeof ffmpeg;

  constructor() {
    this.ffmpeg = ffmpeg;
    this.setupFFmpegPaths();
  }

  async getMetadata(filePath: string): Promise<VideoMetadata> {
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not initialized');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      this.ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to get metadata: ${err.message}`));
          return;
        }

        try {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          if (!videoStream) {
            reject(new Error('No video stream found in file'));
            return;
          }

          const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
          
          const videoMetadata: VideoMetadata = {
            duration: parseFloat(videoStream.duration || '0'),
            resolution: {
              width: videoStream.width || 0,
              height: videoStream.height || 0,
            },
            frameRate: this.parseFrameRate(videoStream.r_frame_rate || '0/1'),
            codec: videoStream.codec_name || 'unknown',
            size: fs.statSync(filePath).size,
          };

          resolve(videoMetadata);
        } catch (error) {
          reject(new Error(`Failed to parse metadata: ${error}`));
        }
      });
    });
  }

  async generateThumbnail(
    filePath: string,
    timestamp: number,
    width: number,
    height: number
  ): Promise<string> {
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not initialized');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      const tempDir = require('os').tmpdir();
      const tempFile = path.join(tempDir, `thumbnail_${Date.now()}.jpg`);

      this.ffmpeg(filePath)
        .seekInput(timestamp)
        .frames(1)
        .size(`${width}x${height}`)
        .format('image2')
        .output(tempFile)
        .on('end', () => {
          try {
            // Read the generated thumbnail and convert to base64
            const thumbnailBuffer = fs.readFileSync(tempFile);
            const base64 = thumbnailBuffer.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64}`;
            
            // Clean up temp file
            fs.unlinkSync(tempFile);
            
            resolve(dataUrl);
          } catch (error) {
            reject(new Error(`Failed to process thumbnail: ${error}`));
          }
        })
        .on('error', (err: Error) => {
          // Clean up temp file on error
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(new Error(`Thumbnail generation failed: ${err.message}`));
        })
        .run();
    });
  }

  async validateVideoFile(filePath: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!fs.existsSync(filePath)) {
        return { isValid: false, error: 'File does not exist' };
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return { isValid: false, error: 'File is empty' };
      }

      // Try to get metadata to validate it's a proper video file
      await this.getMetadata(filePath);
      return { isValid: true };

    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  async trimVideo(options: {
    inputPath: string;
    outputPath: string;
    startTime: number;
    endTime: number;
  }): Promise<void> {
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not initialized');
    }

    if (!fs.existsSync(options.inputPath)) {
      throw new Error(`Input file not found: ${options.inputPath}`);
    }

    return new Promise((resolve, reject) => {
      this.ffmpeg(options.inputPath)
        .seekInput(options.startTime)
        .duration(options.endTime - options.startTime)
        .output(options.outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (err: Error) => {
          reject(new Error(`Video trimming failed: ${err.message}`));
        })
        .run();
    });
  }

  async concatenateClips(options: {
    clips: Array<{ path: string; trimIn: number; trimOut: number }>;
    outputPath: string;
  }): Promise<void> {
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not initialized');
    }

    // Validate all input files exist
    for (const clip of options.clips) {
      if (!fs.existsSync(clip.path)) {
        throw new Error(`Clip file not found: ${clip.path}`);
      }
    }

    return new Promise((resolve, reject) => {
      let command = this.ffmpeg();

      // Add input files with trim filters
      options.clips.forEach((clip, index) => {
        command = command.input(clip.path);
      });

      // Build filter complex for concatenation
      const filterInputs = options.clips.map((_, index) => `[${index}:v]`).join('');
      const filterComplex = `${filterInputs}concat=n=${options.clips.length}:v=1:a=1[outv][outa]`;

      command
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[outv]', '-map', '[outa]'])
        .output(options.outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (err: Error) => {
          reject(new Error(`Clip concatenation failed: ${err.message}`));
        })
        .run();
    });
  }

  async createOverlay(options: {
    mainVideo: string;
    overlayVideo: string;
    outputPath: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }): Promise<void> {
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not initialized');
    }

    if (!fs.existsSync(options.mainVideo)) {
      throw new Error(`Main video file not found: ${options.mainVideo}`);
    }

    if (!fs.existsSync(options.overlayVideo)) {
      throw new Error(`Overlay video file not found: ${options.overlayVideo}`);
    }

    return new Promise((resolve, reject) => {
      this.ffmpeg()
        .input(options.mainVideo)
        .input(options.overlayVideo)
        .complexFilter([
          `[1:v]scale=${options.size.width}:${options.size.height}[overlay]`,
          `[0:v][overlay]overlay=${options.position.x}:${options.position.y}[outv]`
        ])
        .outputOptions(['-map', '[outv]', '-map', '0:a'])
        .output(options.outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (err: Error) => {
          reject(new Error(`Overlay creation failed: ${err.message}`));
        })
        .run();
    });
  }

  private setupFFmpegPaths(): void {
    if (ffmpegManager.isReady()) {
      this.ffmpeg.setFfmpegPath(ffmpegManager.getFFmpegPath());
      this.ffmpeg.setFfprobePath(ffmpegManager.getFFprobePath());
    }
  }

  private parseFrameRate(frameRate: string): number {
    try {
      const [numerator, denominator] = frameRate.split('/').map(Number);
      return denominator ? numerator / denominator : numerator;
    } catch {
      return 30; // Default fallback
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();
