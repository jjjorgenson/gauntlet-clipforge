/**
 * AppShell Component - Main Application Layout
 * 
 * 3-panel layout with resizable panels:
 * - Media Library (left)
 * - Timeline (center) 
 * - Preview (right)
 * 
 * Includes MenuBar, Toolbar, and StatusBar integration.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { MenuBar } from './MenuBar';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';

// Panel width state
interface PanelWidths {
  mediaLibrary: number;
  timeline: number;
  preview: number;
}

// Default panel widths (percentages)
const defaultWidths: PanelWidths = {
  mediaLibrary: 25,
  timeline: 50,
  preview: 25
};

export const AppShell: React.FC = () => {
  const { app } = useStore();
  const [panelWidths, setPanelWidths] = useState<PanelWidths>(defaultWidths);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle panel resize
  const handleMouseDown = useCallback((resizeHandle: string) => {
    setIsResizing(resizeHandle);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const mouseX = e.clientX - containerRef.current.offsetLeft;
      const percentage = (mouseX / containerWidth) * 100;
      
      if (resizeHandle === 'media-timeline') {
        const newMediaWidth = Math.max(15, Math.min(60, percentage));
        const newTimelineWidth = 100 - newMediaWidth - panelWidths.preview;
        const newPreviewWidth = Math.max(15, Math.min(60, panelWidths.preview));
        
        setPanelWidths({
          mediaLibrary: newMediaWidth,
          timeline: newTimelineWidth,
          preview: newPreviewWidth
        });
      } else if (resizeHandle === 'timeline-preview') {
        const newPreviewWidth = Math.max(15, Math.min(60, 100 - percentage));
        const newTimelineWidth = 100 - panelWidths.mediaLibrary - newPreviewWidth;
        const newMediaWidth = Math.max(15, Math.min(60, panelWidths.mediaLibrary));
        
        setPanelWidths({
          mediaLibrary: newMediaWidth,
          timeline: newTimelineWidth,
          preview: newPreviewWidth
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelWidths]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Menu Bar */}
      <MenuBar />
      
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-hidden"
      >
        {/* Media Library Panel */}
        <div 
          className="bg-gray-800 border-r border-gray-700 flex flex-col"
          style={{ width: `${panelWidths.mediaLibrary}%` }}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Media Library</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="text-gray-400 text-center">
              Media Library content will go here
            </div>
          </div>
        </div>
        
        {/* Resize Handle - Media Library to Timeline */}
        <div
          className={`w-1 bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 ${
            isResizing === 'media-timeline' ? 'bg-blue-500' : ''
          }`}
          onMouseDown={() => handleMouseDown('media-timeline')}
        />
        
        {/* Timeline Panel */}
        <div 
          className="bg-gray-800 flex flex-col"
          style={{ width: `${panelWidths.timeline}%` }}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Timeline</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="text-gray-400 text-center">
              Timeline content will go here
            </div>
          </div>
        </div>
        
        {/* Resize Handle - Timeline to Preview */}
        <div
          className={`w-1 bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 ${
            isResizing === 'timeline-preview' ? 'bg-blue-500' : ''
          }`}
          onMouseDown={() => handleMouseDown('timeline-preview')}
        />
        
        {/* Preview Panel */}
        <div 
          className="bg-gray-800 border-l border-gray-700 flex flex-col"
          style={{ width: `${panelWidths.preview}%` }}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
          </div>
          <div className="flex-1 p-4">
            <div className="text-gray-400 text-center">
              Preview content will go here
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

// Export default
export default AppShell;
