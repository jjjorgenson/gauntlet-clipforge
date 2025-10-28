/**
 * MenuBar Component - Application Menu Bar
 * 
 * File, Edit, and View menus with IPC integration.
 * Uses Dropdown from common components for menu items.
 */

import React, { useState } from 'react';
import { useStore } from '../../store';
import { Dropdown, DropdownItem } from '../common';

// Menu item types
type MenuType = 'file' | 'edit' | 'view';

// File menu items
const fileMenuItems: DropdownItem[] = [
  { value: 'new', label: 'New Project' },
  { value: 'open', label: 'Open Project' },
  { value: 'save', label: 'Save Project' },
  { value: 'save-as', label: 'Save As...' },
  { value: 'separator', label: '---', disabled: true },
  { value: 'export', label: 'Export Video' },
  { value: 'separator2', label: '---', disabled: true },
  { value: 'quit', label: 'Quit' }
];

// Edit menu items
const editMenuItems: DropdownItem[] = [
  { value: 'undo', label: 'Undo' },
  { value: 'redo', label: 'Redo' },
  { value: 'separator', label: '---', disabled: true },
  { value: 'cut', label: 'Cut' },
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste' },
  { value: 'separator2', label: '---', disabled: true },
  { value: 'delete', label: 'Delete' },
  { value: 'duplicate', label: 'Duplicate' }
];

// View menu items
const viewMenuItems: DropdownItem[] = [
  { value: 'toggle-media', label: 'Toggle Media Library' },
  { value: 'toggle-preview', label: 'Toggle Preview' },
  { value: 'separator', label: '---', disabled: true },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'zoom-fit', label: 'Zoom to Fit' },
  { value: 'separator2', label: '---', disabled: true },
  { value: 'fullscreen', label: 'Toggle Fullscreen' }
];

export const MenuBar: React.FC = () => {
  const { timeline, project, app } = useStore();
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);

  // Handle menu item selection
  const handleMenuSelect = async (menuType: MenuType, value: string) => {
    setActiveMenu(null);
    
    try {
      switch (menuType) {
        case 'file':
          await handleFileAction(value);
          break;
        case 'edit':
          await handleEditAction(value);
          break;
        case 'view':
          await handleViewAction(value);
          break;
      }
    } catch (error) {
      console.error(`Error handling ${menuType} action:`, error);
    }
  };

  // File menu actions
  const handleFileAction = async (action: string) => {
    switch (action) {
      case 'new':
        project.newProject('Untitled Project');
        break;
      case 'open':
        // In a real app, this would open a file dialog
        console.log('Open project dialog would open here');
        break;
      case 'save':
        if (project.currentFilePath) {
          await project.saveProject();
        } else {
          console.log('Save as dialog would open here');
        }
        break;
      case 'save-as':
        console.log('Save as dialog would open here');
        break;
      case 'export':
        app.setActivePanel('export');
        break;
      case 'quit':
        // Quit functionality would be handled by the main process
        console.log('Quit requested');
        break;
    }
  };

  // Edit menu actions
  const handleEditAction = async (action: string) => {
    switch (action) {
      case 'undo':
        timeline.undo();
        break;
      case 'redo':
        timeline.redo();
        break;
      case 'cut':
        timeline.cutSelectedClips();
        break;
      case 'copy':
        timeline.copySelectedClips();
        break;
      case 'paste':
        // Paste at current time - would need current time from timeline
        timeline.pasteClips('track-1', timeline.currentTime);
        break;
      case 'delete':
        timeline.deleteSelectedClips();
        break;
      case 'duplicate':
        timeline.duplicateSelectedClips();
        break;
    }
  };

  // View menu actions
  const handleViewAction = async (action: string) => {
    switch (action) {
      case 'toggle-media':
        // Toggle media library panel visibility
        console.log('Toggle media library panel');
        break;
      case 'toggle-preview':
        // Toggle preview panel visibility
        console.log('Toggle preview panel');
        break;
      case 'zoom-in':
        timeline.setZoom(Math.min(5.0, timeline.zoom + 0.1));
        break;
      case 'zoom-out':
        timeline.setZoom(Math.max(0.1, timeline.zoom - 0.1));
        break;
      case 'zoom-fit':
        timeline.setZoom(1.0);
        break;
      case 'fullscreen':
        // Fullscreen functionality would be handled by the main process
        console.log('Toggle fullscreen requested');
        break;
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-6">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50">
              {fileMenuItems.map((item, index) => (
                <div key={index}>
                  {item.disabled ? (
                    <div className="px-3 py-1 text-gray-500 text-xs">
                      {item.label === '---' ? '────────────' : item.label}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMenuSelect('file', item.value)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            className="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50">
              {editMenuItems.map((item, index) => (
                <div key={index}>
                  {item.disabled ? (
                    <div className="px-3 py-1 text-gray-500 text-xs">
                      {item.label === '---' ? '────────────' : item.label}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMenuSelect('edit', item.value)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
            className="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50">
              {viewMenuItems.map((item, index) => (
                <div key={index}>
                  {item.disabled ? (
                    <div className="px-3 py-1 text-gray-500 text-xs">
                      {item.label === '---' ? '────────────' : item.label}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMenuSelect('view', item.value)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export default
export default MenuBar;
