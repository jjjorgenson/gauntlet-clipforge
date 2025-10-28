# Epic 2: Video Import & Media Library

**Epic ID:** CLIP-EPIC-002  
**Priority:** P0 (Must-Have for MVP)  
**Status:** Ready for Development  
**Timeline:** Phase 1 (Monday-Tuesday AM)  
**Estimated Effort:** 6-8 hours  
**Dependencies:** Epic 1 (Desktop Application Shell)

---

## Epic Goal

Enable users to import video files into ClipForge through drag-and-drop or file picker, and display them in an organized media library with visual thumbnails and metadata, creating the foundation for video editing workflows.

**Value Statement:** Without the ability to import and organize videos, users cannot edit anything. This epic delivers the content ingestion layer that feeds all downstream editing features.

---

## Epic Description

### What We're Building

A comprehensive video import and management system that:
- Accepts video files via drag-and-drop onto the application window
- Allows manual file selection through file picker dialog
- Validates and supports MP4, MOV, and WebM formats
- Generates thumbnail previews for visual recognition
- Displays rich metadata (filename, duration, file size, resolution)
- Stores file references efficiently without loading entire videos into memory
- Provides the content source for timeline editing

### Why It Matters

The media library is the user's content workspace - where raw materials are organized before editing begins. Users need:
- **Fast import** - Quick file ingestion without waiting
- **Visual recognition** - Thumbnails to identify content at a glance
- **Metadata awareness** - Know video properties before adding to timeline
- **Reliable validation** - Confidence that files will work in the editor

### Technical Foundation

This epic establishes:
1. **File Drop Zone** - Drag-and-drop handlers for intuitive import
2. **Video Metadata Extraction** - FFprobe integration for video analysis
3. **Thumbnail Generation** - FFmpeg-based frame extraction
4. **Media Library State** - Zustand store for imported file management
5. **File Validation** - Format and corruption detection

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.2)

**Functional Requirements - Must Pass:**
- ✅ User drags MP4 file onto app → File appears in media library
- ✅ User clicks "Import" button → File picker opens → Selected file appears in library
- ✅ Library displays accurate metadata (duration, size, resolution)
- ✅ Unsupported file formats show error message
- ✅ Supported formats: MP4, MOV, WebM
- ✅ Media library displays:
  - Thumbnail preview
  - Filename
  - Duration
  - File size
  - Resolution
- ✅ File paths and metadata stored efficiently

**Non-Functional Requirements - Must Pass:**
- ✅ Import time: <2 seconds for files under 100MB
- ✅ Memory efficiency: Don't load entire video into memory
- ✅ File validation: Detect corrupt or unsupported files

### MVP Checkpoint (Tuesday 10:59 PM CT)

**Critical Path Items:**
- ✅ Drag-and-drop functional on app window
- ✅ File picker import working
- ✅ All three formats (MP4, MOV, WebM) import successfully
- ✅ Thumbnails generate and display
- ✅ Metadata extraction works (duration, size, resolution)
- ✅ Library UI displays imported files with all metadata
- ✅ Files can be selected from library (foundation for timeline)
- ✅ Import performance meets <2 second target

**Error Handling:**
- ✅ Unsupported formats rejected with clear error message
- ✅ Corrupt files detected and reported
- ✅ Missing files handled gracefully
- ✅ Duplicate imports prevented or warned

---

## User Stories

### Story 1: Drag-and-Drop Video Import

**As a** video editor  
**I need** to drag video files from my file system onto ClipForge  
**So that** I can quickly import content without navigating file dialogs

**Acceptance Criteria:**

**Drop Zone Implementation:**
- [ ] Entire application window acts as drop zone
- [ ] Drop zone activates when dragging files over window
- [ ] Visual feedback during drag-over (border highlight, overlay message)
- [ ] Drop zone message: "Drop video files here to import"
- [ ] Drop zone deactivates when drag leaves window
- [ ] Multiple files can be dropped simultaneously

**File Drop Handling:**
- [ ] Drop event captured and processed
- [ ] File paths extracted from drop event
- [ ] Files validated before import begins
- [ ] Only video files (.mp4, .mov, .webm) accepted
- [ ] Non-video files rejected with error message
- [ ] Dropped files added to media library
- [ ] Progress indicator shown during import
- [ ] Success message after import completes

**Supported File Types:**
- [ ] MP4 files (.mp4) import successfully
- [ ] MOV files (.mov) import successfully
- [ ] WebM files (.webm) import successfully
- [ ] Case-insensitive extension matching (.MP4, .mov, .WEBM work)
- [ ] MIME type validation as secondary check

**Visual Feedback:**
- [ ] Drag-over state: Window border highlights (e.g., blue border)
- [ ] Drag-over state: Overlay appears with drop message
- [ ] Drag-over state: Cursor shows copy icon
- [ ] Drop state: Spinner or progress indicator
- [ ] Success state: Files appear in media library
- [ ] Error state: Red border or error message for invalid files

**Error Handling:**
- [ ] Unsupported format → Error: "Unsupported format. Use MP4, MOV, or WebM."
- [ ] Corrupt file → Error: "File is corrupted or cannot be read."
- [ ] File too large (>5GB) → Warning: "Large file may cause performance issues."
- [ ] No video stream → Error: "File does not contain video."
- [ ] Access denied → Error: "Cannot read file. Check permissions."
- [ ] Multiple drops handled sequentially (queue processing)

**Performance:**
- [ ] Drag-over feedback appears instantly (<50ms)
- [ ] Drop processing starts immediately
- [ ] UI remains responsive during import
- [ ] Large files (>1GB) don't block UI

**Cross-Platform:**
- [ ] Drag-and-drop works on macOS (Finder)
- [ ] Drag-and-drop works on Windows (Explorer)
- [ ] Drag-and-drop works on Linux (Nautilus, Dolphin)
- [ ] File paths normalized across platforms

**Verification Tests:**
- [ ] Drag single MP4 file → Imports successfully
- [ ] Drag multiple files → All import successfully
- [ ] Drag .txt file → Rejected with error message
- [ ] Drag mixed files (video + non-video) → Only videos import
- [ ] Drag very large file (>2GB) → Warning shown but imports
- [ ] Drag from external drive → Works correctly
- [ ] Drag file already in library → Duplicate prevention or warning

---

### Story 2: File Picker Video Import

**As a** video editor  
**I need** to manually select video files through a file picker  
**So that** I can import content when drag-and-drop isn't convenient

**Acceptance Criteria:**

**Import Trigger:**
- [ ] "Import Video" button in toolbar
- [ ] File > Import Video menu item
- [ ] Keyboard shortcut Cmd/Ctrl+I triggers import
- [ ] All three methods open file picker consistently

**File Picker Configuration:**
- [ ] Native OS file picker dialog appears
- [ ] Dialog title: "Import Video Files"
- [ ] File filters configured:
  - [ ] "All Supported Videos" (*.mp4, *.mov, *.webm)
  - [ ] "MP4 Video" (*.mp4)
  - [ ] "MOV Video" (*.mov)
  - [ ] "WebM Video" (*.webm)
  - [ ] "All Files" (*.*) - shows warning if used
- [ ] Multiple file selection enabled
- [ ] Dialog starts in last used directory
- [ ] Dialog shows file previews (OS dependent)

**Import Processing:**
- [ ] Selected file paths sent from main to renderer via IPC
- [ ] Files validated before import
- [ ] Import process same as drag-and-drop
- [ ] Progress shown for each file
- [ ] Batch processing for multiple files
- [ ] Cancel button available during import

**State Management:**
- [ ] Last import directory remembered
- [ ] Recent imports tracked (up to 10)
- [ ] Import history persists between sessions
- [ ] Duplicate detection: warn if file already imported

**Error Handling:**
- [ ] Cancel button → No error, returns to app
- [ ] Invalid file selected → Error message with details
- [ ] Permission denied → Error: "Cannot access file. Check permissions."
- [ ] File moved/deleted after selection → Error: "File not found."
- [ ] Network path unavailable → Error: "Network location unavailable."

**Verification Tests:**
- [ ] Click Import button → File picker opens
- [ ] Select single file → Imports successfully
- [ ] Select multiple files → All import successfully
- [ ] Press Cancel → No error, nothing imported
- [ ] Select non-video file → Error shown
- [ ] Re-open picker → Starts in same directory
- [ ] Import from network drive → Works correctly

---

### Story 3: Video Metadata Extraction

**As a** video editor  
**I need** video file metadata extracted and displayed  
**So that** I know the properties of my content before editing

**Acceptance Criteria:**

**FFprobe Integration:**
- [ ] FFprobe binary bundled with application
- [ ] FFprobe process spawned for metadata extraction
- [ ] Process executes with proper security (sandboxed)
- [ ] Output parsed into structured data
- [ ] Process timeout after 10 seconds (fail gracefully)

**Metadata Extracted:**
- [ ] **Duration:** Total video length in seconds (e.g., 125.5s → "2:05")
- [ ] **Resolution:** Width × height (e.g., 1920×1080)
- [ ] **Frame rate:** FPS (e.g., 30fps, 60fps, 23.976fps)
- [ ] **Codec:** Video codec name (e.g., H.264, H.265, VP9)
- [ ] **File size:** Bytes converted to human-readable (e.g., 45.3 MB)
- [ ] **Bitrate:** Video bitrate in kbps (e.g., 5000 kbps)
- [ ] **Audio tracks:** Number of audio streams
- [ ] **Audio codec:** Audio codec name (e.g., AAC, MP3)
- [ ] **Creation date:** File creation timestamp (optional)

**Metadata Formatting:**
- [ ] Duration formatted as MM:SS or HH:MM:SS
- [ ] File size formatted with appropriate unit (B, KB, MB, GB)
- [ ] Resolution shown as "1080p", "720p", "4K" when standard
- [ ] Frame rate rounded appropriately (23.976 → 24fps, 29.97 → 30fps)
- [ ] Bitrate shown in Mbps for readability

**Performance:**
- [ ] Metadata extraction completes in <1 second for typical files
- [ ] Extraction runs asynchronously (doesn't block UI)
- [ ] Multiple extractions run in parallel (up to 4 concurrent)
- [ ] Extraction cached (don't re-extract same file)

**Error Handling:**
- [ ] FFprobe not found → Error: "Video processor missing. Reinstall application."
- [ ] FFprobe fails → Error: "Cannot read video properties."
- [ ] Corrupt file → Error: "File is corrupted."
- [ ] Missing codec → Warning: "Unsupported codec, may not play correctly."
- [ ] Zero duration → Error: "Invalid video file."

**Data Storage:**
- [ ] Metadata stored in Zustand store
- [ ] Metadata persists between sessions (localStorage)
- [ ] File path stored as absolute path
- [ ] Metadata includes timestamp for cache invalidation

**Verification Tests:**
- [ ] Import MP4 → Duration extracted correctly
- [ ] Import 1080p video → Resolution shown as "1920×1080" or "1080p"
- [ ] Import variable frame rate video → Average FPS shown
- [ ] Import 4K video → Resolution shown as "4K" or "3840×2160"
- [ ] Import very large file → Metadata extracted without hanging
- [ ] Import file with multiple audio tracks → Audio count shown

---

### Story 4: Thumbnail Generation

**As a** video editor  
**I need** visual thumbnail previews of imported videos  
**So that** I can quickly identify content in my media library

**Acceptance Criteria:**

**FFmpeg Thumbnail Extraction:**
- [ ] FFmpeg binary bundled with application
- [ ] Thumbnail extracted at specific timestamp (e.g., 1 second or 10% into video)
- [ ] Frame extracted as JPEG or PNG
- [ ] Thumbnail saved to temporary directory
- [ ] Temporary files cleaned up on app exit

**Thumbnail Specifications:**
- [ ] Thumbnail size: 160×90 pixels (16:9 aspect ratio)
- [ ] Thumbnail maintains source aspect ratio (letterbox if needed)
- [ ] Thumbnail quality: Medium compression (balance size/quality)
- [ ] Thumbnail format: JPEG for file size efficiency
- [ ] Fallback: Default "video file" icon if extraction fails

**Thumbnail Strategy:**
- [ ] Extract from 10% into video (skip intro/black frames)
- [ ] If 10% frame is black, try 25%
- [ ] If still black, try middle frame (50%)
- [ ] Cache thumbnails to avoid regeneration
- [ ] Thumbnail filename: MD5 hash of file path + ".jpg"

**Performance:**
- [ ] Thumbnail generation completes in <2 seconds
- [ ] Generation runs asynchronously (doesn't block UI)
- [ ] Multiple thumbnails generated in parallel (up to 4 concurrent)
- [ ] Placeholder shown while thumbnail generates
- [ ] Generated thumbnails cached on disk

**Display:**
- [ ] Thumbnail appears in media library item
- [ ] Thumbnail has subtle border/shadow for depth
- [ ] Thumbnail scales proportionally in UI
- [ ] Hover over thumbnail → Shows larger preview (P2 feature)
- [ ] Broken thumbnail → Shows default video icon

**Memory Management:**
- [ ] Thumbnails loaded as needed (lazy loading)
- [ ] Thumbnails unloaded when not visible (virtualization)
- [ ] Thumbnail cache limited to 100MB
- [ ] Old thumbnails cleaned up (LRU eviction)

**Error Handling:**
- [ ] FFmpeg fails → Show default icon, log error
- [ ] Corrupt video → Show error icon with warning badge
- [ ] Very short video (<1s) → Extract from first frame
- [ ] No video stream → Show audio-only icon
- [ ] Thumbnail write fails → Continue without thumbnail

**Verification Tests:**
- [ ] Import video → Thumbnail generates automatically
- [ ] Thumbnail displays in library within 2 seconds
- [ ] Import 10 videos → All thumbnails generate
- [ ] Close and reopen app → Thumbnails reload from cache
- [ ] Delete cached thumbnails → Regenerate on next open
- [ ] Import video with black intro → Thumbnail shows actual content

---

### Story 5: Media Library UI

**As a** video editor  
**I need** an organized media library interface  
**So that** I can browse and select videos for editing

**Acceptance Criteria:**

**Library Layout:**
- [ ] Media library panel in left sidebar (from Epic 1)
- [ ] Header shows "Media Library" with item count (e.g., "Media Library (5)")
- [ ] Empty state message: "No videos imported yet. Drag files here or click Import."
- [ ] Empty state shows import button
- [ ] Scrollable list when content exceeds panel height

**Library Item Display:**
- [ ] Each item shows:
  - [ ] Thumbnail image (160×90px)
  - [ ] Filename (truncated with ellipsis if too long)
  - [ ] Duration (MM:SS format)
  - [ ] File size (MB or GB)
  - [ ] Resolution badge (e.g., "1080p")
- [ ] Items arranged in vertical list
- [ ] Each item has distinct background (card style)
- [ ] Spacing between items: 8-12px

**Item Interaction:**
- [ ] Click item → Selects item (highlight background)
- [ ] Double-click item → Adds to timeline (Epic 3 dependency)
- [ ] Right-click item → Context menu (Remove, Reveal in Finder, etc.)
- [ ] Hover item → Subtle highlight (lighter background)
- [ ] Selected item → Clear visual indicator (border, different background)
- [ ] Multi-select support: Cmd/Ctrl+click for multiple selection

**Context Menu:**
- [ ] "Add to Timeline" - Adds clip to timeline
- [ ] "Remove from Library" - Removes from library (doesn't delete file)
- [ ] "Reveal in Finder/Explorer" - Opens file location
- [ ] "Show Properties" - Opens metadata details dialog
- [ ] "Separator"
- [ ] "Delete File" - Moves file to trash (requires confirmation)

**Toolbar Actions:**
- [ ] Import button (triggers file picker)
- [ ] Remove selected button (trash icon)
- [ ] Sort dropdown: "Name", "Date Added", "Duration", "Size"
- [ ] View mode toggle: List view / Grid view (P2)
- [ ] Search/filter box (P2)

**Item States:**
- [ ] Normal state: Default appearance
- [ ] Hover state: Lighter background
- [ ] Selected state: Blue highlight
- [ ] Processing state: Spinner overlay on thumbnail
- [ ] Error state: Red border, error icon badge
- [ ] Missing file state: Grayed out, warning icon

**Metadata Display:**
- [ ] Filename: Bold, 13px, truncated if needed
- [ ] Duration: Gray, 11px, format: "2:45"
- [ ] File size: Gray, 11px, format: "123 MB"
- [ ] Resolution: Badge (pill shape), small text: "1080p"
- [ ] Tooltip on hover shows full filename and path

**Performance:**
- [ ] Library renders 100+ items without lag
- [ ] Virtual scrolling for large libraries (>50 items)
- [ ] Thumbnails lazy-load as scrolled into view
- [ ] Smooth scrolling (60 FPS)

**Accessibility:**
- [ ] Keyboard navigation: Arrow keys move selection
- [ ] Enter key: Adds selected item to timeline
- [ ] Delete key: Removes selected item from library
- [ ] Tab navigation works logically
- [ ] Screen reader announcements for item count

**Verification Tests:**
- [ ] Import 1 video → Appears in library with all metadata
- [ ] Import 10 videos → All appear in organized list
- [ ] Click item → Item highlights
- [ ] Double-click item → (Placeholder for Epic 3 integration)
- [ ] Right-click item → Context menu appears
- [ ] Click "Remove from Library" → Item removed
- [ ] Sort by Duration → Items reorder correctly
- [ ] Scroll library → Items load smoothly
- [ ] Import large file → File size displays correctly (GB)
- [ ] Hover over truncated filename → Tooltip shows full name

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Media Library System                      │
├───────────────────────────────┬─────────────────────────────┤
│        Main Process           │      Renderer Process        │
│         (Node.js)             │       (Chromium)             │
│                               │                              │
│  File System Operations       │  React UI Components         │
│  - File dialog handlers       │  - MediaLibrary.tsx          │
│  - File path resolution       │  - MediaItem.tsx             │
│                               │  - ImportButton.tsx          │
│  FFmpeg/FFprobe Services      │                              │
│  - Metadata extraction        │  State Management (Zustand)  │
│  - Thumbnail generation       │  - mediaStore.ts             │
│  - Process management         │  - Actions: import, remove   │
│                               │  - Selectors: getMedia       │
│  IPC Handlers                 │                              │
│  - media:import               │  Drop Zone Handler           │
│  - media:metadata             │  - dragOver, dragLeave       │
│  - media:thumbnail            │  - drop event processing     │
│  - media:remove               │                              │
└───────────────────────────────┴─────────────────────────────┘
```

### Data Models

**MediaItem**
```typescript
interface MediaItem {
  id: string;                    // UUID
  filename: string;              // "my-video.mp4"
  filepath: string;              // Absolute path
  filesize: number;              // Bytes
  thumbnailPath?: string;        // Path to cached thumbnail
  metadata: VideoMetadata;
  dateAdded: string;             // ISO 8601 timestamp
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

interface VideoMetadata {
  duration: number;              // Seconds
  width: number;                 // Pixels
  height: number;                // Pixels
  frameRate: number;             // FPS
  codec: string;                 // "h264", "hevc", etc.
  bitrate: number;               // kbps
  audioTracks: number;
  audioCodec?: string;
}
```

**Media Store (Zustand)**
```typescript
interface MediaStore {
  items: MediaItem[];
  selectedIds: string[];
  sortBy: 'name' | 'dateAdded' | 'duration' | 'size';
  
  // Actions
  addMedia: (file: File | string) => Promise<void>;
  removeMedia: (id: string) => void;
  selectMedia: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  updateMetadata: (id: string, metadata: VideoMetadata) => void;
  updateThumbnail: (id: string, path: string) => void;
  setError: (id: string, error: string) => void;
}
```

### IPC Channels

**Channel: `media:import`**
- Renderer → Main: File path(s) to import
- Main → Renderer: Import progress/completion

**Channel: `media:extract-metadata`**
- Main process: Spawns FFprobe
- Returns: VideoMetadata object

**Channel: `media:generate-thumbnail`**
- Main process: Spawns FFmpeg
- Returns: Thumbnail file path

**Channel: `media:validate`**
- Main process: Validates file format/integrity
- Returns: Validation result + error details

### Technology Stack

**Media Processing:**
```json
{
  "ffmpeg-static": "^5.2.0",
  "ffprobe-static": "^3.1.0",
  "fluent-ffmpeg": "^2.1.2"
}
```

**File Handling:**
```json
{
  "uuid": "^9.0.0",
  "file-type": "^18.5.0"
}
```

**State Management:**
```json
{
  "zustand": "^4.4.0"
}
```

---

## Dependencies & Blockers

### Dependencies
- **Epic 1:** Desktop Application Shell (file system access, IPC, UI framework)

### Enables
- **Epic 3:** Timeline Editor (needs media library as content source)
- **Epic 4:** Video Preview & Playback (needs imported videos)
- **Epic 5:** Clip Trimming (needs clips on timeline)
- **Epic 6:** Video Export (needs timeline content)

### External Dependencies
- FFmpeg binary (for thumbnail generation)
- FFprobe binary (for metadata extraction)
- Node.js fs module (file operations)

---

## Risks & Mitigation

### Risk 1: FFmpeg/FFprobe Binary Packaging
**Impact:** HIGH - Cannot extract metadata or thumbnails  
**Probability:** MEDIUM  
**Mitigation:**
- Use `ffmpeg-static` and `ffprobe-static` npm packages (pre-compiled binaries)
- Test binary execution on all platforms early
- Include binaries in electron-builder config
- Fallback: Minimal metadata from file headers if FFmpeg unavailable

**Contingency:** Show basic file info (name, size) without thumbnail/duration

---

### Risk 2: Large File Performance
**Impact:** MEDIUM - Slow imports, UI lag  
**Probability:** MEDIUM  
**Mitigation:**
- Stream file reading (don't load entire file)
- Async processing with progress feedback
- Limit concurrent operations (4 max)
- Warn users about files >2GB

**Contingency:** Add "large file mode" with simplified metadata

---

### Risk 3: Thumbnail Cache Growth
**Impact:** LOW - Disk space usage  
**Probability:** HIGH  
**Mitigation:**
- Limit cache to 100MB
- LRU eviction policy
- Clean up on app exit
- User preference to clear cache

**Contingency:** Regenerate thumbnails as needed (acceptable slight delay)

---

### Risk 4: Corrupt or Unsupported Files
**Impact:** MEDIUM - Poor user experience  
**Probability:** HIGH  
**Mitigation:**
- Validate files before import
- Clear error messages
- Don't crash on bad files
- Skip corrupt files in batch import

**Contingency:** Add "retry" option and link to supported formats documentation

---

## Definition of Done

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] ESLint passes with no warnings
- [ ] Code follows project conventions
- [ ] Unit tests for media store actions (if time permits)

### Functionality
- [ ] All user stories completed with acceptance criteria met
- [ ] Drag-and-drop works on all platforms
- [ ] File picker import works
- [ ] Metadata extraction successful for MP4, MOV, WebM
- [ ] Thumbnails generate correctly
- [ ] Media library UI displays all information

### Testing
- [ ] Import 20+ videos → All appear with thumbnails
- [ ] Test with 4K video → Imports without hanging
- [ ] Test with corrupt file → Error handled gracefully
- [ ] Test on macOS, Windows, Linux → All work
- [ ] Memory usage reasonable (<500MB with 50 files)

### Documentation
- [ ] README updated with import instructions
- [ ] Supported formats documented
- [ ] Troubleshooting section for import issues

### Integration
- [ ] Media items selectable (ready for Epic 3)
- [ ] Media store accessible from other components
- [ ] File paths properly formatted for timeline use

---

## Timeline & Milestones

### Monday Afternoon (Hours 5-8)
- Story 1: Drag-and-drop implementation
- Story 2: File picker import

### Monday Evening (Hours 9-12)
- Story 3: FFprobe metadata extraction
- Story 4: FFmpeg thumbnail generation

### Tuesday Morning (Hours 13-16)
- Story 5: Media library UI
- Integration testing

### Checkpoint: Tuesday 10:59 PM CT
- All stories complete
- Import working reliably
- Media library ready to feed timeline

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.2

