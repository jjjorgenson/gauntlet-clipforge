/**
 * Import Button Component
 *
 * Button for importing video files into the media library.
 * Calls window.api.media.openFilePicker() and handles the import process.
 */

import React, { useState } from 'react';
import { Button } from '../common/Button';

interface ImportButtonProps {
  onImportSuccess: (clips: any[]) => void;
  className?: string;
}

export const ImportButton: React.FC<ImportButtonProps> = ({ 
  onImportSuccess, 
  className = '' 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async () => {
    if (isImporting) return;

    setIsImporting(true);
    setImportError(null);

    try {
      // Open file picker dialog
      const result = await window.api.media.openFilePicker({
        allowMultiple: true,
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.filePaths || result.filePaths.length === 0) {
        // User cancelled
        return;
      }

      // Import the selected files
      const importResult = await window.api.media.import({
        filePaths: result.filePaths
      });

      if (importResult.clips && importResult.clips.length > 0) {
        onImportSuccess(importResult.clips);
        console.log(`✅ Successfully imported ${importResult.clips.length} clips`);
      } else {
        throw new Error('No clips were imported');
      }

    } catch (error) {
      console.error('❌ Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (isImporting) return;

    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v'].includes(extension || '');
    });

    if (videoFiles.length === 0) {
      setImportError('No valid video files found');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const filePaths = videoFiles.map(file => (file as any).path || file.name);
      
      const importResult = await window.api.media.import({
        filePaths
      });

      if (importResult.clips && importResult.clips.length > 0) {
        onImportSuccess(importResult.clips);
        console.log(`✅ Successfully imported ${importResult.clips.length} clips via drag & drop`);
      } else {
        throw new Error('No clips were imported');
      }

    } catch (error) {
      console.error('❌ Drag & drop import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`import-button-container ${className}`}>
      <div
        className="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Button
          onClick={handleImport}
          disabled={isImporting}
          variant="primary"
          size="sm"
          className="relative"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Import Video
            </>
          )}
        </Button>

        {/* Error Message */}
        {importError && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg z-10">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{importError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Drag & Drop Hint */}
      <div className="text-xs text-gray-500 mt-1 text-center">
        or drag files here
      </div>
    </div>
  );
};
