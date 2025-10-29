/**
 * Electron Main Process
 * 
 * Entry point for the Electron application.
 * Handles window creation, lifecycle, and IPC setup.
 */

import { app, BrowserWindow, protocol } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc';

class ClipForgeApp {
  private mainWindow: BrowserWindow | null = null;
  private readonly isDev = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Register custom protocol BEFORE app ready
    // This must be done in the main process before any windows are created
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'media',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
          corsEnabled: true,
          stream: true,
          bypassCSP: true
        }
      }
    ]);

    // Single instance lock - only allow one instance of the app
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    // Handle second instance attempt
    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
      }
    });

    // App lifecycle events
    app.whenReady().then(() => this.onReady());
    
    app.on('window-all-closed', () => {
      // On macOS, apps typically stay active until user explicitly quits
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On macOS, re-create window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private async onReady(): Promise<void> {
    console.log('🚀 ClipForge is starting...');
    console.log(`📦 Electron: ${process.versions.electron}`);
    console.log(`🔧 Node: ${process.versions.node}`);
    console.log(`⚛️ Chrome: ${process.versions.chrome}`);
    console.log(`🌍 Environment: ${this.isDev ? 'development' : 'production'}`);

    // Register custom protocol for loading local media files
    this.registerMediaProtocol();

    // Register IPC handlers
    registerIpcHandlers();

    // Create main window
    this.createWindow();
  }

  private registerMediaProtocol(): void {
    const fs = require('fs');
    const pathModule = require('path');

    // Register stream protocol - this was WORKING before!
    protocol.registerStreamProtocol('media', (request, callback) => {
      try {
        // The browser sends: media://c/Users/... (lowercases drive, removes colon)
        // We need to reconstruct: C:\Users\...
        const url = request.url.replace('media://', '');
        const decodedPath = decodeURIComponent(url);
        
        console.log('🎬 Media protocol request:', {
          originalUrl: request.url,
          decodedPath
        });

        // Fix Windows path: c/Users/... → C:\Users\...
        let filePath = decodedPath;
        if (process.platform === 'win32') {
          // Convert: c/Users/... → C:/Users/...
          if (filePath.match(/^[a-z]\//)) {
            filePath = filePath.charAt(0).toUpperCase() + ':' + filePath.slice(1);
          }
        }
        
        filePath = pathModule.normalize(filePath);
        
        if (!fs.existsSync(filePath)) {
          console.error('❌ File not found:', filePath);
          callback({ statusCode: 404 });
          return;
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const ext = pathModule.extname(filePath).toLowerCase();
        
        const mimeTypes: Record<string, string> = {
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.mkv': 'video/x-matroska',
          '.avi': 'video/x-msvideo',
          '.mov': 'video/quicktime',
          '.m4v': 'video/mp4',
        };
        
        const mimeType = mimeTypes[ext] || 'video/mp4';
        const rangeHeader = request.headers['Range'] || request.headers['range'];
        
        if (rangeHeader) {
          const parts = rangeHeader.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = (end - start) + 1;

          console.log('🎬 Range request:', { start, end, chunkSize, fileSize });

          const stream = fs.createReadStream(filePath, { start, end });

          callback({
            statusCode: 206,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': chunkSize.toString(),
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
            },
            data: stream
          });
        } else {
          const stream = fs.createReadStream(filePath);
          callback({
            statusCode: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': fileSize.toString(),
              'Accept-Ranges': 'bytes',
            },
            data: stream
          });
        }
        
        console.log('✅ Streaming:', pathModule.basename(filePath));
      } catch (error) {
        console.error('❌ Protocol handler error:', error);
        callback({ statusCode: 500 });
      }
    });

    console.log('✅ Custom "media://" protocol registered');
  }

  private createWindow(): void {
    // Create browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1000,
      minHeight: 600,
      backgroundColor: '#1e1e1e',
      title: 'ClipForge',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,       // Security: Isolate context
        nodeIntegration: false,        // Security: Disable node integration
        sandbox: true,                 // ✅ ENABLED - secure sandbox
        webSecurity: true,             // ✅ ENABLED - custom protocol bypasses safely
      },
      // Modern window style
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      trafficLightPosition: { x: 15, y: 15 },
      show: false, // Don't show until ready
    });

    // Load the app
    if (this.isDev) {
      // Development: Load from Vite dev server
      const devServerUrl = 'http://localhost:5173';
      this.mainWindow.loadURL(devServerUrl);
      
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools();
      
      console.log(`🔗 Loading from dev server: ${devServerUrl}`);
    } else {
      // Production: Load from built files
      const indexPath = path.join(__dirname, '../dist/index.html');
      this.mainWindow.loadFile(indexPath);
      
      console.log(`📂 Loading from: ${indexPath}`);
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      console.log('✅ ClipForge window ready');
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      console.log('🔒 Main window closed');
    });

    // Log navigation for debugging
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Failed to load:', errorCode, errorDescription);
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Page loaded successfully');
    });
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Start the application
const clipForge = new ClipForgeApp();

// Export for potential use by IPC handlers
export { clipForge };

