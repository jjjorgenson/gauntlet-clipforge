/**
 * Export UI Test Component
 * 
 * Demonstrates the export dialog functionality with real-time progress updates.
 * This component integrates with the export store and IPC channels.
 */

import React, { useState, useEffect } from 'react';
import { ExportDialog } from './ExportDialog';
import { Button } from '../common/Button';
import { useExportStore } from '../../store/exportStore';
import { ExportConfig } from '../../../shared/types';

export const ExportUITest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    isExporting,
    progress,
    config,
    currentFrame,
    totalFrames,
    fps,
    eta,
    updateConfig,
    startExport,
    cancelExport,
    showExportDialog
  } = useExportStore();

  // Listen to export progress events
  useEffect(() => {
    if (!window.api?.export) return;

    const unsubscribeProgress = window.api.export.onProgress((data) => {
      console.log('Export progress:', data);
      // The store should handle this automatically
    });

    const unsubscribeComplete = window.api.export.onComplete((data) => {
      console.log('Export complete:', data);
      // The store should handle this automatically
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
    };
  }, []);

  // Handle export start
  const handleStartExport = async () => {
    try {
      await window.api?.export?.start?.({
        config: config,
        timeline: {
          tracks: [] // This would come from the timeline store
        }
      });
    } catch (error) {
      console.error('Failed to start export:', error);
    }
  };

  // Handle export cancel
  const handleCancelExport = async () => {
    try {
      await window.api?.export?.cancel?.({});
    } catch (error) {
      console.error('Failed to cancel export:', error);
    }
  };

  // Handle config change
  const handleConfigChange = (newConfig: Partial<ExportConfig>) => {
    updateConfig(newConfig);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🎬 Export UI Test</h2>
        <p className="text-gray-400">Test the export dialog and progress tracking</p>
      </div>

      {/* Export Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Export Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 font-medium ${isExporting ? 'text-yellow-400' : 'text-green-400'}`}>
              {isExporting ? 'Exporting...' : 'Ready'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Progress:</span>
            <span className="ml-2 font-medium text-white">{progress.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-400">Frames:</span>
            <span className="ml-2 font-medium text-white">{currentFrame} / {totalFrames}</span>
          </div>
          <div>
            <span className="text-gray-400">Speed:</span>
            <span className="ml-2 font-medium text-white">{fps.toFixed(1)} FPS</span>
          </div>
        </div>
      </div>

      {/* Current Config */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Current Export Config</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Output Path:</span>
            <span className="text-white font-mono">{config.outputPath || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality:</span>
            <span className="text-white capitalize">{config.quality}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resolution:</span>
            <span className="text-white">{config.resolution.width}x{config.resolution.height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">FPS:</span>
            <span className="text-white">{config.fps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Codec:</span>
            <span className="text-white uppercase">{config.codec}</span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="primary"
          disabled={isExporting}
        >
          Open Export Dialog
        </Button>
        
        <Button
          onClick={() => startExport(config)}
          variant="secondary"
          disabled={isExporting}
        >
          Start Export via Store
        </Button>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isDialogOpen}
        isExporting={isExporting}
        progress={progress}
        config={config}
        onConfigChange={handleConfigChange}
        onStartExport={handleStartExport}
        onCancelExport={handleCancelExport}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">Test Instructions:</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Click "Open Export Dialog" to test the export UI</li>
          <li>• Try different quality presets (Low, Medium, High, Ultra)</li>
          <li>• Adjust resolution, FPS, and codec settings</li>
          <li>• Set an output path (use Browse button)</li>
          <li>• Click "Start Export" to begin (will show progress)</li>
          <li>• Test cancel functionality during export</li>
        </ul>
      </div>
    </div>
  );
};
