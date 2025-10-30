/**
 * Export Service
 * 
 * Implements IExportService contract for video export operations.
 * Uses fluent-ffmpeg for all FFmpeg operations with progress tracking.
 * 
 * Features:
 * - Single clip export with trimming
 * - Multi-clip concatenation
 * - Picture-in-picture overlay composition
 * - Quality presets (low, medium, high, ultra)
 * - Real-time progress events
 * - Export cancellation support
 */

import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { IExportService } from '../../shared/contracts/services';
import { ExportConfig, ExportProgress, ExportQuality } from '../../shared/types';
import { ffmpegManager } from './FFmpegManager';

interface ActiveExport {
  id: string;
  process: ChildProcess;
  config: ExportConfig;
  startTime: number;
  cancelled: boolean;
}

export class ExportService implements IExportService {
  private static instance: ExportService;
  private activeExports = new Map<string, ActiveExport>();
  private eventEmitter = new EventEmitter();

  private constructor() {}

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Start export process
   * Returns export ID for tracking
   */
  async startExport(
    config: ExportConfig,
    timeline: { tracks: any[] }
  ): Promise<string> {
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎬 Starting export ${exportId}:`, {
      outputPath: config.outputPath,
      quality: config.quality,
      resolution: config.resolution,
      codec: config.codec
    });

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(config.outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Determine export strategy based on timeline complexity
      const clips = this.extractClipsFromTimeline(timeline);
      
      if (clips.length === 1) {
        // Single clip - use fast path
        await this.exportSingleClip(clips[0], config, (progress) => {
          this.emitProgress(exportId, progress);
        });
      } else if (clips.length > 1) {
        // Multi-clip - use concatenation
        await this.exportTimeline(clips, config, (progress) => {
          this.emitProgress(exportId, progress);
        });
      } else {
        throw new Error('No clips found in timeline');
      }

      // Emit completion event
      this.eventEmitter.emit('exportComplete', {
        exportId,
        success: true,
        outputPath: config.outputPath
      });

      console.log(`✅ Export ${exportId} completed successfully`);
      return exportId;

    } catch (error) {
      console.error(`❌ Export ${exportId} failed:`, error);
      
      // Emit error event
      this.eventEmitter.emit('exportComplete', {
        exportId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  /**
   * Cancel ongoing export
   */
  async cancelExport(exportId: string): Promise<void> {
    const activeExport = this.activeExports.get(exportId);
    
    if (!activeExport) {
      console.warn(`⚠️ Export ${exportId} not found or already completed`);
      return;
    }

    console.log(`🛑 Cancelling export ${exportId}...`);
    
    try {
      // Kill the FFmpeg process
      if (activeExport.process && !activeExport.process.killed) {
        activeExport.process.kill('SIGTERM');
        
        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!activeExport.process.killed) {
            activeExport.process.kill('SIGKILL');
          }
        }, 5000);
      }

      // Mark as cancelled
      activeExport.cancelled = true;
      
      // Clean up output file if it exists
      if (fs.existsSync(activeExport.config.outputPath)) {
        fs.unlinkSync(activeExport.config.outputPath);
      }

      // Remove from active exports
      this.activeExports.delete(exportId);

      console.log(`✅ Export ${exportId} cancelled successfully`);

    } catch (error) {
      console.error(`❌ Failed to cancel export ${exportId}:`, error);
      throw error;
    }
  }

  /**
   * Get export progress
   */
  async getExportProgress(exportId: string): Promise<ExportProgress> {
    const activeExport = this.activeExports.get(exportId);
    
    if (!activeExport) {
      throw new Error(`Export ${exportId} not found`);
    }

    // Return mock progress for now - real progress comes from FFmpeg stderr parsing
    return {
      percent: 0,
      currentFrame: 0,
      totalFrames: 0,
      fps: 0,
      eta: 0
    };
  }

  /**
   * Export single clip (fast path)
   */
  async exportSingleClip(
    clip: { sourceFile: string; trimIn: number; trimOut: number },
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    console.log(`🎬 Exporting single clip: ${clip.sourceFile}`);
    console.log(`✂️ Trim values:`, {
      trimIn: clip.trimIn,
      trimOut: clip.trimOut,
      duration: clip.trimOut - clip.trimIn
    });
    
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not ready');
    }

    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const exportId = `single-${Date.now()}`;
    
    // Build FFmpeg command for single clip export
    const args = this.buildSingleClipArgs(clip, config);
    
    console.log(`🔧 FFmpeg command: ${ffmpegPath} ${args.join(' ')}`);
    
    return new Promise((resolve, reject) => {
      const process = spawn(ffmpegPath, args);
      
      // Track this export
      this.activeExports.set(exportId, {
        id: exportId,
        process,
        config,
        startTime: Date.now(),
        cancelled: false
      });

      let stderr = '';
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
        
        // Parse progress from FFmpeg stderr
        const progress = this.parseFFmpegProgress(stderr, config);
        if (progress) {
          onProgress(progress);
        }
      });

      process.on('close', (code) => {
        this.activeExports.delete(exportId);
        
        if (code === 0) {
          console.log(`✅ Single clip export completed: ${config.outputPath}`);
          resolve(config.outputPath);
        } else {
          const error = new Error(`FFmpeg process exited with code ${code}`);
          console.error(`❌ Single clip export failed:`, error);
          reject(error);
        }
      });

      process.on('error', (error) => {
        this.activeExports.delete(exportId);
        console.error(`❌ FFmpeg process error:`, error);
        reject(error);
      });
    });
  }

  /**
   * Export timeline (complex path)
   */
  async exportTimeline(
    clips: Array<{ 
      sourceFile: string; 
      trimIn: number; 
      trimOut: number;
      startTime: number;
      endTime: number;
      trackId: string;
      trackNumber: number;
    }>,
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    console.log(`🎬 Exporting timeline with ${clips.length} clips`);
    
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not ready');
    }

    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const os = require('os');
    
    // Step 1: Build timeline events (resolve overlaps and gaps)
    const events = this.buildTimelineEvents(clips);
    
    if (events.length === 0) {
      throw new Error('No timeline events to export');
    }
    
    // Step 2: Create temp directory for segments
    const tempDir = path.join(os.tmpdir(), `clipforge-export-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    console.log(`📁 Temp directory: ${tempDir}`);
    
    try {
      // Step 3: Export each segment (clips and gaps)
      const segmentFiles: string[] = [];
      let totalProgress = 0;
      const progressPerSegment = 80 / events.length; // Reserve 20% for final concatenation
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const segmentFile = path.join(tempDir, `segment-${i.toString().padStart(3, '0')}.mp4`);
        
        if (event.type === 'clip') {
          // Export clip segment with trim
          console.log(`🎬 Exporting segment ${i + 1}/${events.length}: Clip (${event.duration.toFixed(2)}s)`);
          await this.exportClipSegment(event, segmentFile, config);
        } else if (event.type === 'gap') {
          // Create black frame for gap
          console.log(`⬛ Creating segment ${i + 1}/${events.length}: Gap (${event.duration.toFixed(2)}s)`);
          await this.createBlackFrameSegment(event.duration, segmentFile, config);
        }
        
        segmentFiles.push(segmentFile);
        
        // Update progress
        totalProgress += progressPerSegment;
        onProgress({
          percent: Math.min(totalProgress, 80),
          currentFrame: Math.floor(event.endTime * config.fps),
          totalFrames: Math.floor(events[events.length - 1].endTime * config.fps),
          fps: config.fps,
          eta: Math.floor((100 - totalProgress) / progressPerSegment * 2) // Rough estimate
        });
      }
      
      // Step 4: Create concat file
      const concatFile = path.join(tempDir, 'concat.txt');
      const concatContent = segmentFiles.map(f => `file '${f}'`).join('\n');
      fs.writeFileSync(concatFile, concatContent);
      console.log(`📝 Concat file created with ${segmentFiles.length} segments`);
      
      // Step 5: Concatenate all segments
      console.log(`🔗 Concatenating ${segmentFiles.length} segments...`);
      await this.concatenateSegments(concatFile, config.outputPath, config);
      
      // Final progress
      const finalEvent = events[events.length - 1];
      onProgress({
        percent: 100,
        currentFrame: Math.floor(finalEvent.endTime * config.fps),
        totalFrames: Math.floor(finalEvent.endTime * config.fps),
        fps: config.fps,
        eta: 0
      });
      
      console.log(`✅ Timeline export completed: ${config.outputPath}`);
      return config.outputPath;
      
    } finally {
      // Step 6: Cleanup temp files
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log(`🧹 Cleaned up temp directory: ${tempDir}`);
        }
      } catch (cleanupError) {
        console.warn(`⚠️  Failed to cleanup temp directory: ${cleanupError}`);
      }
    }
  }

  /**
   * Export a single clip segment (part of timeline export)
   */
  private async exportClipSegment(
    event: { 
      sourceFile?: string; 
      trimIn?: number; 
      trimOut?: number; 
      duration: number 
    },
    outputPath: string,
    config: ExportConfig
  ): Promise<void> {
    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const preset = this.getQualityPreset(config.quality);
    
    const trimDuration = (event.trimOut || 0) - (event.trimIn || 0);
    
    const args = [
      '-i', event.sourceFile!,
      '-ss', (event.trimIn || 0).toString(),
      '-t', trimDuration.toString(),
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-s', `${config.resolution.width}x${config.resolution.height}`,
      '-r', config.fps.toString(),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y',
      outputPath
    ];
    
    return new Promise((resolve, reject) => {
      const process = spawn(ffmpegPath, args);
      let stderr = '';
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Segment export failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  /**
   * Create a black frame video segment for gaps
   */
  private async createBlackFrameSegment(
    duration: number,
    outputPath: string,
    config: ExportConfig
  ): Promise<void> {
    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const preset = this.getQualityPreset(config.quality);
    
    const args = [
      '-f', 'lavfi',
      '-i', `color=c=black:s=${config.resolution.width}x${config.resolution.height}:d=${duration}:r=${config.fps}`,
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-t', duration.toString(),
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      '-y',
      outputPath
    ];
    
    return new Promise((resolve, reject) => {
      const process = spawn(ffmpegPath, args);
      let stderr = '';
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Black frame creation failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  /**
   * Concatenate multiple segment files into final output
   */
  private async concatenateSegments(
    concatFile: string,
    outputPath: string,
    config: ExportConfig
  ): Promise<void> {
    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const preset = this.getQualityPreset(config.quality);
    
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath
    ];
    
    return new Promise((resolve, reject) => {
      const process = spawn(ffmpegPath, args);
      let stderr = '';
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Concatenation failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  /**
   * Create picture-in-picture overlay
   */
  async exportWithOverlay(
    mainClip: string,
    overlayClip: string,
    config: ExportConfig,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    console.log(`🎬 Creating PiP overlay: ${mainClip} + ${overlayClip}`);
    
    if (!ffmpegManager.isReady()) {
      throw new Error('FFmpeg not ready');
    }

    const ffmpegPath = ffmpegManager.getFFmpegPath();
    const exportId = `pip-${Date.now()}`;
    
    // Build FFmpeg command for PiP overlay
    const args = this.buildPiPArgs(mainClip, overlayClip, config);
    
    console.log(`🔧 FFmpeg command: ${ffmpegPath} ${args.join(' ')}`);
    
    return new Promise((resolve, reject) => {
      const process = spawn(ffmpegPath, args);
      
      // Track this export
      this.activeExports.set(exportId, {
        id: exportId,
        process,
        config,
        startTime: Date.now(),
        cancelled: false
      });

      let stderr = '';
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
        
        // Parse progress from FFmpeg stderr
        const progress = this.parseFFmpegProgress(stderr, config);
        if (progress) {
          onProgress(progress);
        }
      });

      process.on('close', (code) => {
        this.activeExports.delete(exportId);
        
        if (code === 0) {
          console.log(`✅ PiP export completed: ${config.outputPath}`);
          resolve(config.outputPath);
        } else {
          const error = new Error(`FFmpeg process exited with code ${code}`);
          console.error(`❌ PiP export failed:`, error);
          reject(error);
        }
      });

      process.on('error', (error) => {
        this.activeExports.delete(exportId);
        console.error(`❌ FFmpeg process error:`, error);
        reject(error);
      });
    });
  }

  /**
   * Get quality preset configuration
   */
  private getQualityPreset(quality: ExportQuality): {
    resolution: { width: number; height: number };
    bitrate: string;
    fps: number;
  } {
    const presets = {
      low: {
        resolution: { width: 1280, height: 720 },
        bitrate: '2000k',
        fps: 30
      },
      medium: {
        resolution: { width: 1920, height: 1080 },
        bitrate: '5000k',
        fps: 30
      },
      high: {
        resolution: { width: 1920, height: 1080 },
        bitrate: '8000k',
        fps: 30
      },
      ultra: {
        resolution: { width: 3840, height: 2160 },
        bitrate: '15000k',
        fps: 30
      }
    };

    return presets[quality];
  }

  /**
   * Build FFmpeg arguments for single clip export
   */
  private buildSingleClipArgs(
    clip: { sourceFile: string; trimIn: number; trimOut: number },
    config: ExportConfig
  ): string[] {
    const preset = this.getQualityPreset(config.quality);
    const trimDuration = clip.trimOut - clip.trimIn;
    
    const args = [
      '-i', clip.sourceFile,
      // CRITICAL: -ss and -t MUST come AFTER -i but BEFORE encoding options
      '-ss', clip.trimIn.toString(),      // Start at trim point
      '-t', trimDuration.toString(),      // Duration of trim
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-s', `${config.resolution.width}x${config.resolution.height}`,
      '-r', config.fps.toString(),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y', // Overwrite output file
      config.outputPath
    ];

    return args;
  }

  /**
   * Build FFmpeg arguments for timeline export (concatenation)
   */
  /**
   * Build timeline events with gap and overlap resolution
   */
  private buildTimelineEvents(clips: Array<{
    sourceFile: string;
    trimIn: number;
    trimOut: number;
    startTime: number;
    endTime: number;
    trackId: string;
    trackNumber: number;
  }>): Array<{
    type: 'clip' | 'gap';
    startTime: number;
    endTime: number;
    duration: number;
    sourceFile?: string;
    trimIn?: number;
    trimOut?: number;
    trackId?: string;
  }> {
    if (clips.length === 0) return [];
    
    // Sort clips by startTime, then by trackNumber (higher track wins overlaps)
    const sortedClips = [...clips].sort((a, b) => {
      if (a.startTime !== b.startTime) {
        return a.startTime - b.startTime;
      }
      // If same startTime, higher track number comes first (to handle overlaps)
      return b.trackNumber - a.trackNumber;
    });
    
    const events: Array<{
      type: 'clip' | 'gap';
      startTime: number;
      endTime: number;
      duration: number;
      sourceFile?: string;
      trimIn?: number;
      trimOut?: number;
      trackId?: string;
    }> = [];
    
    let currentTime = 0;
    const resolvedClips: typeof sortedClips = [];
    
    // First pass: Resolve overlaps (higher track wins)
    for (const clip of sortedClips) {
      let clipStart = clip.startTime;
      let clipEnd = clip.endTime;
      let shouldAdd = true;
      
      // Check if this clip overlaps with any already resolved clips
      for (const resolved of resolvedClips) {
        // Check for overlap
        if (clipStart < resolved.endTime && clipEnd > resolved.startTime) {
          // Overlap detected
          if (clip.trackNumber > resolved.trackNumber) {
            // Current clip wins - it will be added
            console.log(`⚠️  Overlap: Track ${clip.trackNumber} (${clip.trackId}) wins over Track ${resolved.trackNumber} (${resolved.trackId})`);
          } else {
            // Resolved clip wins - skip or truncate current clip
            if (clipStart >= resolved.startTime && clipEnd <= resolved.endTime) {
              // Current clip is completely covered
              shouldAdd = false;
              console.log(`⚠️  Overlap: Track ${resolved.trackNumber} completely covers Track ${clip.trackNumber} - skipping`);
              break;
            } else if (clipStart < resolved.startTime && clipEnd > resolved.startTime) {
              // Truncate current clip end
              clipEnd = resolved.startTime;
              console.log(`⚠️  Overlap: Truncating Track ${clip.trackNumber} at ${clipEnd}s`);
            } else if (clipStart < resolved.endTime && clipEnd > resolved.endTime) {
              // Truncate current clip start
              clipStart = resolved.endTime;
              console.log(`⚠️  Overlap: Truncating Track ${clip.trackNumber} start to ${clipStart}s`);
            }
          }
        }
      }
      
      if (shouldAdd && clipEnd > clipStart) {
        const adjustedClip = {
          ...clip,
          startTime: clipStart,
          endTime: clipEnd
        };
        resolvedClips.push(adjustedClip);
      }
    }
    
    // Sort resolved clips by startTime
    resolvedClips.sort((a, b) => a.startTime - b.startTime);
    
    // Second pass: Build events with gaps
    for (const clip of resolvedClips) {
      // Check for gap before this clip
      if (clip.startTime > currentTime) {
        const gapDuration = clip.startTime - currentTime;
        events.push({
          type: 'gap',
          startTime: currentTime,
          endTime: clip.startTime,
          duration: gapDuration
        });
        console.log(`⬛ Gap: ${gapDuration.toFixed(2)}s from ${currentTime.toFixed(2)}s to ${clip.startTime.toFixed(2)}s`);
      }
      
      // Add clip event
      const clipDuration = clip.endTime - clip.startTime;
      events.push({
        type: 'clip',
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: clipDuration,
        sourceFile: clip.sourceFile,
        trimIn: clip.trimIn,
        trimOut: clip.trimOut,
        trackId: clip.trackId
      });
      console.log(`🎬 Clip: ${clipDuration.toFixed(2)}s from ${clip.startTime.toFixed(2)}s to ${clip.endTime.toFixed(2)}s (Track: ${clip.trackId})`);
      
      currentTime = clip.endTime;
    }
    
    console.log(`📊 Timeline events: ${events.length} (${events.filter(e => e.type === 'clip').length} clips, ${events.filter(e => e.type === 'gap').length} gaps)`);
    return events;
  }

  private buildTimelineArgs(
    clips: Array<{ sourceFile: string; trimIn: number; trimOut: number }>,
    config: ExportConfig
  ): string[] {
    const preset = this.getQualityPreset(config.quality);
    
    // Create concat file list
    const concatFile = path.join(path.dirname(config.outputPath), `concat-${Date.now()}.txt`);
    const concatContent = clips.map(clip => 
      `file '${clip.sourceFile}'\n` +
      `inpoint ${clip.trimIn}\n` +
      `outpoint ${clip.trimOut}`
    ).join('\n');
    
    fs.writeFileSync(concatFile, concatContent);
    
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-s', `${config.resolution.width}x${config.resolution.height}`,
      '-r', config.fps.toString(),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y', // Overwrite output file
      config.outputPath
    ];

    // Clean up concat file after export
    setTimeout(() => {
      if (fs.existsSync(concatFile)) {
        fs.unlinkSync(concatFile);
      }
    }, 10000);

    return args;
  }

  /**
   * Build FFmpeg arguments for picture-in-picture overlay
   */
  private buildPiPArgs(
    mainClip: string,
    overlayClip: string,
    config: ExportConfig
  ): string[] {
    const preset = this.getQualityPreset(config.quality);
    
    // Calculate overlay position (bottom-right corner with 10px margin)
    const overlayWidth = Math.floor(config.resolution.width * 0.3); // 30% of main video width
    const overlayHeight = Math.floor(config.resolution.height * 0.3); // 30% of main video height
    const overlayX = config.resolution.width - overlayWidth - 10;
    const overlayY = config.resolution.height - overlayHeight - 10;
    
    const args = [
      '-i', mainClip,
      '-i', overlayClip,
      '-filter_complex', 
      `[0:v][1:v]overlay=${overlayX}:${overlayY}:enable='between(t,0,999999)'[v]`,
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', this.getCodecName(config.codec),
      '-b:v', config.bitrate || preset.bitrate,
      '-s', `${config.resolution.width}x${config.resolution.height}`,
      '-r', config.fps.toString(),
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y', // Overwrite output file
      config.outputPath
    ];

    return args;
  }

  /**
   * Get codec name for FFmpeg
   */
  private getCodecName(codec: string): string {
    const codecMap = {
      'h264': 'libx264',
      'h265': 'libx265',
      'vp9': 'libvpx-vp9'
    };
    
    return codecMap[codec as keyof typeof codecMap] || 'libx264';
  }

  /**
   * Parse FFmpeg progress from stderr output
   */
  private parseFFmpegProgress(stderr: string, config: ExportConfig): ExportProgress | null {
    // Look for progress line like: frame=  123 fps= 25.0 q=28.0 size=    1024kB time=00:00:05.00 bitrate=1677.7kbits/s
    const progressMatch = stderr.match(/frame=\s*(\d+)\s+fps=\s*([\d.]+)\s+q=([\d.]+)\s+size=\s*(\d+)kB\s+time=([\d:.]+)/);
    
    if (!progressMatch) {
      return null;
    }

    const currentFrame = parseInt(progressMatch[1]);
    const fps = parseFloat(progressMatch[2]);
    const timeStr = progressMatch[5];
    
    // Parse time string (HH:MM:SS.ms)
    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const seconds = parseFloat(timeParts[2]) || 0;
    const currentTime = hours * 3600 + minutes * 60 + seconds;
    
    // Estimate total frames based on duration and fps
    const totalFrames = Math.floor(config.fps * 60); // Assume 1 minute for now
    const percent = Math.min((currentFrame / totalFrames) * 100, 100);
    
    // Calculate ETA
    const elapsedTime = (Date.now() - Date.now()) / 1000; // This would be actual elapsed time
    const eta = fps > 0 ? (totalFrames - currentFrame) / fps : 0;

    return {
      percent,
      currentFrame,
      totalFrames,
      fps,
      eta
    };
  }

  /**
   * Extract clips from timeline data
   */
  private extractClipsFromTimeline(timeline: { tracks: any[] }): Array<{
    sourceFile: string;
    trimIn: number;
    trimOut: number;
    startTime: number;
    endTime: number;
    trackId: string;
    trackNumber: number;
  }> {
    const clips: Array<{
      sourceFile: string;
      trimIn: number;
      trimOut: number;
      startTime: number;
      endTime: number;
      trackId: string;
      trackNumber: number;
    }> = [];
    
    for (const track of timeline.tracks) {
      if (track.clips && Array.isArray(track.clips)) {
        // Extract track number from trackId (e.g., "track-1" -> 1)
        const trackNumber = parseInt(track.id.replace(/\D/g, '')) || 0;
        
        for (const clip of track.clips) {
          const duration = (clip.trimOut - clip.trimIn) || clip.metadata?.duration || 0;
          
          clips.push({
            sourceFile: clip.sourceFile,
            trimIn: clip.trimIn || 0,
            trimOut: clip.trimOut || clip.metadata?.duration || 0,
            startTime: clip.startTime || 0,
            endTime: (clip.startTime || 0) + duration,
            trackId: track.id,
            trackNumber: trackNumber
          });
        }
      }
    }
    
    console.log(`📊 Extracted ${clips.length} clips from ${timeline.tracks.length} tracks`);
    return clips;
  }

  /**
   * Emit progress event
   */
  private emitProgress(exportId: string, progress: ExportProgress): void {
    this.eventEmitter.emit('exportProgress', {
      exportId,
      progress
    });
  }

  /**
   * Get event emitter for progress events
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();
