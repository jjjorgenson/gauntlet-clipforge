/**
 * Electron Main Process
 * 
 * Entry point for the Electron application.
 * Handles window creation, lifecycle, and IPC setup.
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc';

class ClipForgeApp {
  private mainWindow: BrowserWindow | null = null;
  private readonly isDev = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
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

    // Register IPC handlers
    registerIpcHandlers();

    // Create main window
    this.createWindow();
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
        sandbox: true,                 // Security: Enable sandbox
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

