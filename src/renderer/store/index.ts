/**
 * Combined Store Hook - All Stores in One
 * 
 * Exports all stores as a single hook for easy consumption.
 * Usage: const { timeline, media, recording, export, project, app } = useStore();
 */

import { useTimelineStore } from './timelineStore';
import { useMediaStore } from './mediaStore';
import { useRecordingStore } from './recordingStore';
import { useExportStore } from './exportStore';
import { useProjectStore } from './projectStore';
import { useAppStore } from './appStore';

// Combined store hook
export const useStore = () => {
  const timeline = useTimelineStore();
  const media = useMediaStore();
  const recording = useRecordingStore();
  const exportStore = useExportStore();
  const project = useProjectStore();
  const app = useAppStore();

  return {
    timeline,
    media,
    recording,
    export: exportStore, // Renamed to avoid conflict with JS keyword
    project,
    app
  };
};

// Individual store exports for direct access when needed
export {
  useTimelineStore,
  useMediaStore,
  useRecordingStore,
  useExportStore,
  useProjectStore,
  useAppStore
};

// Type exports for TypeScript
export type {
  TimelineStoreContract,
  MediaLibraryStoreContract,
  RecordingStoreContract,
  ExportStoreContract,
  ProjectStoreContract,
  AppStoreContract
} from '../../shared/contracts/stores';
