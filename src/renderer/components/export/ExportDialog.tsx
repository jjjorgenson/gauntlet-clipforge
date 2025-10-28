/**
 * Export Dialog Component
 * 
 * Main modal dialog for video export functionality.
 * Contains export settings, progress tracking, and controls.
 */

import React, { useEffect, useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { ExportSettings } from './ExportSettings';
import { ExportProgress } from './ExportProgress';
import { ExportComponentProps } from '../../../shared/contracts/components';
import { ExportConfig } from '../../../shared/types';

export const ExportDialog: React.FC<ExportComponentProps.ExportDialog> = ({
  isOpen,
  isExporting,
  progress,
  config,
  onConfigChange,
  onStartExport,
  onCancelExport,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'settings' | 'progress' | 'complete'>('settings');

  // Reset to settings step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('settings');
    }
  }, [isOpen]);

  // Switch to progress step when export starts
  useEffect(() => {
    if (isExporting) {
      setCurrentStep('progress');
    }
  }, [isExporting]);

  // Switch to complete step when export finishes
  useEffect(() => {
    if (!isExporting && progress === 100 && currentStep === 'progress') {
      setCurrentStep('complete');
    }
  }, [isExporting, progress, currentStep]);

  const handleStartExport = () => {
    if (!config.outputPath) {
      alert('Please select an output path');
      return;
    }
    onStartExport();
  };

  const handleClose = () => {
    if (isExporting) {
      onCancelExport();
    }
    onClose();
  };

  const handleOpenFile = () => {
    if (config.outputPath) {
      // Open the exported file in the default application
      window.api?.system?.openExternal?.({ url: config.outputPath });
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Export Video</h2>
              <p className="text-gray-400 text-sm">
                Configure your export settings and choose an output location
              </p>
            </div>
            
            <ExportSettings
              config={config}
              onChange={onConfigChange}
            />
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={onClose}
                variant="ghost"
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartExport}
                variant="primary"
                disabled={isExporting || !config.outputPath}
              >
                Start Export
              </Button>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Exporting Video</h2>
              <p className="text-gray-400 text-sm">
                Please wait while your video is being exported...
              </p>
            </div>
            
            <ExportProgress
              progress={progress}
              currentFrame={0} // Will be updated by parent
              totalFrames={0} // Will be updated by parent
              fps={0} // Will be updated by parent
              eta={0} // Will be updated by parent
              onCancel={onCancelExport}
            />
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Export Complete!</h2>
              <p className="text-gray-400 text-sm">
                Your video has been successfully exported
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Output file:</p>
                  <p className="text-white font-mono text-sm truncate">
                    {config.outputPath.split('/').pop() || config.outputPath}
                  </p>
                </div>
                <Button
                  onClick={handleOpenFile}
                  variant="ghost"
                  size="sm"
                >
                  Open File
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={onClose}
                variant="primary"
              >
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title=""
      onClose={handleClose}
      maxWidth="lg"
    >
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </Dialog>
  );
};
