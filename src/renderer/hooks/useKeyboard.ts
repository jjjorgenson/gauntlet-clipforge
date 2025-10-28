/**
 * useKeyboard Hook - Global Keyboard Shortcuts
 * 
 * Manages global keyboard shortcuts for the application.
 * Provides common shortcuts for timeline operations.
 */

import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

// Keyboard shortcut configuration
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboard = () => {
  const { timeline, app } = useStore();

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Playback controls
    {
      key: ' ',
      action: () => {
        if (timeline.isPlaying) {
          timeline.pause();
        } else {
          timeline.play();
        }
      },
      description: 'Play/Pause'
    },
    {
      key: 'Home',
      action: () => timeline.seek(0),
      description: 'Seek to beginning'
    },
    {
      key: 'End',
      action: () => timeline.seek(timeline.duration),
      description: 'Seek to end'
    },
    {
      key: 'ArrowLeft',
      action: () => {
        const newTime = Math.max(0, timeline.currentTime - 1);
        timeline.seek(newTime);
      },
      description: 'Seek backward 1 second'
    },
    {
      key: 'ArrowRight',
      action: () => {
        const newTime = Math.min(timeline.duration, timeline.currentTime + 1);
        timeline.seek(newTime);
      },
      description: 'Seek forward 1 second'
    },
    {
      key: 'ArrowLeft',
      shiftKey: true,
      action: () => {
        const newTime = Math.max(0, timeline.currentTime - 5);
        timeline.seek(newTime);
      },
      description: 'Seek backward 5 seconds'
    },
    {
      key: 'ArrowRight',
      shiftKey: true,
      action: () => {
        const newTime = Math.min(timeline.duration, timeline.currentTime + 5);
        timeline.seek(newTime);
      },
      description: 'Seek forward 5 seconds'
    },
    
    // Edit operations
    {
      key: 'Delete',
      action: () => timeline.deleteSelectedClips(),
      description: 'Delete selected clips'
    },
    {
      key: 'Backspace',
      action: () => timeline.deleteSelectedClips(),
      description: 'Delete selected clips'
    },
    {
      key: 'z',
      ctrlKey: true,
      action: () => timeline.undo(),
      description: 'Undo'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => timeline.redo(),
      description: 'Redo'
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => timeline.redo(),
      description: 'Redo (Ctrl+Shift+Z)'
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => timeline.copySelectedClips(),
      description: 'Copy selected clips'
    },
    {
      key: 'x',
      ctrlKey: true,
      action: () => timeline.cutSelectedClips(),
      description: 'Cut selected clips'
    },
    {
      key: 'v',
      ctrlKey: true,
      action: () => {
        // Paste at current time
        timeline.pasteClips('track-1', timeline.currentTime);
      },
      description: 'Paste clips'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => timeline.duplicateSelectedClips(),
      description: 'Duplicate selected clips'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Split clip at playhead
        if (timeline.selectedClipIds.length > 0) {
          const clipId = timeline.selectedClipIds[0];
          timeline.splitClip(clipId, timeline.currentTime);
        }
      },
      description: 'Split clip at playhead'
    },
    
    // Selection
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        // Select all clips (would need to implement in store)
        console.log('Select all clips');
      },
      description: 'Select all clips'
    },
    {
      key: 'Escape',
      action: () => timeline.clearSelection(),
      description: 'Clear selection'
    },
    
    // Zoom controls
    {
      key: '=',
      ctrlKey: true,
      action: () => {
        const newZoom = Math.min(5.0, timeline.zoom + 0.1);
        timeline.setZoom(newZoom);
      },
      description: 'Zoom in'
    },
    {
      key: '-',
      ctrlKey: true,
      action: () => {
        const newZoom = Math.max(0.1, timeline.zoom - 0.1);
        timeline.setZoom(newZoom);
      },
      description: 'Zoom out'
    },
    {
      key: '0',
      ctrlKey: true,
      action: () => timeline.setZoom(1.0),
      description: 'Reset zoom'
    }
  ];

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if keyboard shortcuts are disabled
    if (!app.keyboardShortcutsEnabled) return;
    
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      return shortcut.key.toLowerCase() === event.key.toLowerCase() &&
             !!shortcut.ctrlKey === event.ctrlKey &&
             !!shortcut.metaKey === event.metaKey &&
             !!shortcut.shiftKey === event.shiftKey &&
             !!shortcut.altKey === event.altKey;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, app.keyboardShortcutsEnabled]);

  // Register keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Toggle keyboard shortcuts
  const toggleKeyboardShortcuts = useCallback(() => {
    app.toggleKeyboardShortcuts();
  }, [app]);

  return {
    // State
    keyboardShortcutsEnabled: app.keyboardShortcutsEnabled,
    
    // Actions
    toggleKeyboardShortcuts,
    
    // Shortcut definitions (for help/documentation)
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      modifiers: {
        ctrl: s.ctrlKey,
        meta: s.metaKey,
        shift: s.shiftKey,
        alt: s.altKey
      },
      description: s.description
    }))
  };
};

// Export default
export default useKeyboard;
