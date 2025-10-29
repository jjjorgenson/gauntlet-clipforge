/**
 * Component Props Contracts
 * 
 * Defines props interfaces for all major components.
 * Enables parallel component development without coupling.
 */

import { Clip, Track, VideoMetadata, RecordingSource, ExportConfig } from '../types';
import React from 'react';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export namespace LayoutComponentProps {
  export interface AppShell {
    children?: React.ReactNode;
  }

  export interface MenuBar {
    onNewProject: () => void;
    onOpenProject: () => void;
    onSaveProject: () => void;
    onExport: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  }

  export interface Toolbar {
    onImport: () => void;
    onRecord: () => void;
    onExport: () => void;
    onSplit: () => void;
    onDelete: () => void;
    onUndo: () => void;
    onRedo: () => void;
    hasSelection: boolean;
    canUndo: boolean;
    canRedo: boolean;
  }

  export interface StatusBar {
    message?: string;
    fps?: number;
    zoom?: number;
    currentTime?: number;
    duration?: number;
  }
}

// ============================================================================
// MEDIA LIBRARY COMPONENTS
// ============================================================================

export namespace MediaLibraryComponentProps {
  export interface MediaLibrary {
    className?: string;
  }

  export interface MediaItem {
    id: string;
    clip: Clip;
    thumbnail?: string;
    isSelected: boolean;
    onSelect: (id: string, multiSelect: boolean) => void;
    onDragStart: (id: string) => void;
    onDoubleClick: (id: string) => void;
  }

  export interface MediaGrid {
    items: Array<{
      id: string;
      clip: Clip;
      thumbnail?: string;
    }>;
    selectedIds: string[];
    onSelectItem: (id: string, multiSelect: boolean) => void;
    onDragStart: (id: string) => void;
    onDoubleClick: (id: string) => void;
  }

  export interface ImportButton {
    onImport: (files: string[]) => void;
    isLoading?: boolean;
  }
}

// ============================================================================
// TIMELINE COMPONENTS
// ============================================================================

export namespace TimelineComponentProps {
  export interface Timeline {
    className?: string;
  }

  export interface TimelineCanvas {
    tracks: Track[];
    currentTime: number;
    zoom: number;
    scrollLeft: number;
    selectedClipIds: string[];
    onClipClick: (clipId: string, multiSelect: boolean) => void;
    onClipDragStart: (clipId: string) => void;
    onClipDragEnd: (clipId: string, trackId: string, position: number) => void;
    onTrimHandleDrag: (clipId: string, handle: 'start' | 'end', delta: number) => void;
    onPlayheadDrag: (time: number) => void;
  }

  export interface TimeRuler {
    duration: number;
    zoom: number;
    scrollLeft: number;
    currentTime: number;
    onSeek: (time: number) => void;
  }

  export interface Track {
    track: Track;
    isSelected: boolean;
    zoom: number;
    scrollLeft: number;
    onClipClick: (clipId: string) => void;
    onClipDragStart: (clipId: string) => void;
    onTrackSelect: (trackId: string) => void;
  }

  export interface TimelineClip {
    clip: Clip;
    isSelected: boolean;
    zoom: number;
    onSelect: (clipId: string) => void;
    onDragStart: () => void;
    onTrimStart: (handle: 'start' | 'end') => void;
    onTrimEnd: () => void;
  }

  export interface Playhead {
    currentTime: number;
    zoom: number;
    scrollLeft: number;
    onDrag: (time: number) => void;
  }

  export interface TimelineControls {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    snapEnabled: boolean;
    onSnapToggle: () => void;
  }
}

// ============================================================================
// VIDEO PREVIEW COMPONENTS
// ============================================================================

export namespace VideoPreviewComponentProps {
  export interface VideoPreview {
    className?: string;
  }

  export interface VideoPlayer {
    clip: Clip | null;
    currentTime: number;
    isPlaying: boolean;
    volume: number;
    onTimeUpdate: (time: number) => void;
    onPlay?: () => void; // Optional - no longer used (store is single source of truth)
    onPause?: () => void; // Optional - no longer used (store is single source of truth)
    onEnded: () => void;
  }

  export interface PlaybackControls {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onFullscreen: () => void;
  }
}

// ============================================================================
// RECORDING COMPONENTS
// ============================================================================

export namespace RecordingComponentProps {
  export interface RecordDialog {
    isOpen: boolean;
    onClose: () => void;
    onStartRecording: (sourceId: string) => void;
  }

  export interface SourceSelector {
    sources: RecordingSource[];
    selectedSourceId: string | null;
    onSelectSource: (sourceId: string) => void;
    onRefresh: () => void;
  }

  export interface CameraPreview {
    deviceId: string | null;
    onDeviceChange: (deviceId: string) => void;
  }

  export interface RecordControls {
    isRecording: boolean;
    duration: number;
    countdown: number | null;
    onStart: () => void;
    onStop: () => void;
  }
}

// ============================================================================
// EXPORT COMPONENTS
// ============================================================================

export namespace ExportComponentProps {
  export interface ExportDialog {
    isOpen: boolean;
    isExporting: boolean;
    progress: number;
    config: ExportConfig;
    onConfigChange: (config: Partial<ExportConfig>) => void;
    onStartExport: () => void;
    onCancelExport: () => void;
    onClose: () => void;
  }

  export interface ExportSettings {
    config: ExportConfig;
    onChange: (config: Partial<ExportConfig>) => void;
  }

  export interface ExportProgress {
    progress: number;
    currentFrame: number;
    totalFrames: number;
    fps: number;
    eta: number;
    onCancel: () => void;
  }

  export interface QualityPreset {
    value: ExportConfig['quality'];
    label: string;
    selected: boolean;
    onSelect: (value: ExportConfig['quality']) => void;
  }
}

// ============================================================================
// COMMON COMPONENTS
// ============================================================================

export namespace CommonComponentProps {
  export interface Button {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
  }

  export interface Dialog {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }

  export interface Dropdown {
    trigger: React.ReactNode;
    items: Array<{
      label: string;
      value: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    }>;
    onSelect: (value: string) => void;
    placement?: 'bottom' | 'top' | 'left' | 'right';
  }

  export interface ProgressBar {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }

  export interface Slider {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    showValue?: boolean;
  }
}

