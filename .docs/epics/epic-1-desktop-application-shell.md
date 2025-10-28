# Epic 1: Desktop Application Shell

**Epic ID:** CLIP-EPIC-001  
**Priority:** P0 (Must-Have for MVP)  
**Status:** Ready for Development  
**Timeline:** Phase 1 (Monday-Tuesday AM)  
**Estimated Effort:** 8-12 hours  

---

## Epic Goal

Establish the foundational native desktop application infrastructure using Electron, React, and TypeScript that enables ClipForge to run as a standalone desktop application with proper OS integration, file system access, and process communication architecture.

**Value Statement:** Without a working desktop shell, no video editing features can be delivered. This epic creates the technical foundation that all other features depend on.

---

## Epic Description

### What We're Building

A production-ready Electron desktop application that:
- Launches as a native app on macOS, Windows, and Linux
- Provides a responsive React-based UI with proper menu bar, toolbar, and workspace layout
- Implements reliable IPC (Inter-Process Communication) between main and renderer processes
- Enables secure file system access for video import/export operations
- Can be packaged and distributed as a standalone executable

### Why It Matters

This epic delivers the "desktop" in "desktop video editor" - the core differentiator from web-based competitors. Users need:
- **Local processing** - No cloud uploads, work offline
- **Native performance** - Direct OS integration for recording and file access
- **Professional experience** - Familiar desktop app patterns (menus, shortcuts, native dialogs)

### Technical Foundation

This epic establishes:
1. **Main Process** - Node.js environment for system operations, FFmpeg, and recording services
2. **Renderer Process** - Chromium environment for React UI and video playback
3. **IPC Architecture** - Secure communication layer between processes
4. **Build Pipeline** - Development tooling and packaging for distribution

---

## Success Criteria

### Epic-Level Acceptance Criteria (from PRD Section 3.1)

**Functional Requirements - Must Pass:**
- ✅ User double-clicks app icon → Application launches successfully
- ✅ Main window displays with UI elements visible (menu bar, toolbar, workspace)
- ✅ User can quit application without errors
- ✅ Packaged app runs without requiring Node.js installation
- ✅ Native desktop app launches on macOS/Windows/Linux
- ✅ IPC communication established between main and renderer processes
- ✅ File system access functional for video import/export operations
- ✅ Application packages as standalone executable

**Non-Functional Requirements - Must Pass:**
- ✅ Startup time: <3 seconds on modern hardware
- ✅ Memory footprint: <200MB at idle
- ✅ Cross-platform compatibility verified:
  - macOS 10.15+ (Catalina and later)
  - Windows 10+ (64-bit)
  - Linux (Ubuntu 20.04+ or equivalent)

### MVP Checkpoint (Tuesday 10:59 PM CT)

**Critical Path Items:**
- ✅ Application launches by double-clicking app icon (no command line required)
- ✅ Main window renders completely with all UI elements
- ✅ Menu bar functional with File, Edit, View, Window, Help menus
- ✅ Toolbar displays with primary action buttons
- ✅ Workspace areas visible (media library, preview, timeline placeholders)
- ✅ User can quit application cleanly without errors or orphaned processes
- ✅ Window controls work (minimize, maximize, restore, close)

**Packaging & Distribution:**
- ✅ Packaged app (.dmg/.exe/.AppImage) builds successfully
- ✅ Packaged app runs on clean machine without Node.js installed
- ✅ All runtime dependencies bundled correctly
- ✅ App icon displays properly in all contexts (dock, taskbar, window)

**Performance Benchmarks:**
- ✅ Cold start: <3 seconds from icon click to UI ready
- ✅ Memory usage at idle: <200MB
- ✅ No memory leaks during normal operation
- ✅ CPU usage at idle: <5%

### Technical Validation

**Cross-Platform Compatibility:**
- ✅ Builds successfully on macOS 10.15+ (Catalina, Big Sur, Monterey, Ventura, Sonoma)
- ✅ Builds successfully on Windows 10+ (64-bit)
- ✅ Builds successfully on Linux (Ubuntu 20.04+, tested on common distros)
- ✅ UI renders consistently across platforms
- ✅ File paths handled correctly (Windows backslash vs Unix forward slash)
- ✅ Native dialogs use platform-specific styling

**Architecture & Communication:**
- ✅ Main process initializes successfully and creates application window
- ✅ Renderer process loads React app without errors or warnings
- ✅ IPC communication works bidirectionally (main ↔ renderer)
- ✅ IPC ping/pong test completes in <50ms
- ✅ Context isolation enabled for security
- ✅ Node integration disabled in renderer for security
- ✅ Preload script bridges main and renderer securely

**File System Access:**
- ✅ Native file picker (open dialog) launches successfully
- ✅ File picker filters by video formats (.mp4, .mov, .webm)
- ✅ Selected file paths returned correctly to renderer
- ✅ Application has read permissions for user-selected files
- ✅ Application has write permissions for user-selected directories
- ✅ File operations respect OS-level permissions and sandboxing

**Development Environment:**
- ✅ Dev tools accessible in development mode
- ✅ Hot module replacement (HMR) works for React components
- ✅ TypeScript compilation completes without errors
- ✅ Source maps work for debugging
- ✅ Console logging functional in both processes

---

## User Stories

### Story 1: Electron + React Development Environment Setup

**As a** developer  
**I need** a working Electron + React + TypeScript development environment  
**So that** I can begin building ClipForge features with modern tooling

**Acceptance Criteria:**

**Environment Setup:**
- [ ] Node.js 18+ installed and verified (`node --version`)
- [ ] Electron 28+ installed with proper Node.js version compatibility
- [ ] React 18.2+ with TypeScript 5.2+ configured and functional
- [ ] Vite 5.0+ dev server running with hot module replacement (HMR)
- [ ] Package.json includes all required dependencies and dev dependencies
- [ ] Git repository initialized with appropriate .gitignore

**Process Architecture:**
- [ ] Main process entry point created and launches successfully
- [ ] Renderer process entry point created and renders React app
- [ ] Main and renderer processes communicate bidirectionally via IPC
- [ ] IPC ping/pong test passes (send message, receive response)
- [ ] Context isolation enabled in BrowserWindow configuration
- [ ] Preload script configured for secure IPC bridging
- [ ] Node integration disabled in renderer for security

**TypeScript Configuration:**
- [ ] TypeScript compilation works without errors for main process
- [ ] TypeScript compilation works without errors for renderer process
- [ ] Separate tsconfig files for main and renderer if needed
- [ ] Type checking passes in both processes
- [ ] Source maps generated for debugging
- [ ] Import paths resolve correctly

**Development Tooling:**
- [ ] ESLint configured with TypeScript support
- [ ] Prettier configured for consistent code formatting
- [ ] VSCode settings recommended for team consistency
- [ ] Dev server starts with `npm run dev` command
- [ ] Hot reload works for React components (no full restart needed)
- [ ] DevTools accessible in development mode

**Build Scripts:**
- [ ] `npm run dev` - Start development server
- [ ] `npm run build` - Build for production
- [ ] `npm run package` - Create distributable packages
- [ ] `npm run type-check` - Verify TypeScript compilation
- [ ] `npm run lint` - Check code quality
- [ ] All scripts documented in README.md

**Verification Tests:**
- [ ] Run `npm run dev` → Electron window opens
- [ ] Run `npm run type-check` → No TypeScript errors
- [ ] Run `npm run lint` → No linting errors
- [ ] Make change to React component → HMR updates without restart
- [ ] Check DevTools console → No errors or warnings

**Technical Tasks:**
- Initialize npm project with package.json
- Install Electron + React + TypeScript dependencies
- Install Vite and configure for Electron renderer
- Install build tools (electron-builder)
- Set up main process entry point (main.ts)
- Set up renderer process entry point (index.html, main.tsx)
- Create preload script for IPC bridge
- Configure TypeScript for both processes (tsconfig.json)
- Create basic IPC channel for testing (ping/pong)
- Configure ESLint with TypeScript rules
- Configure Prettier with project standards
- Add dev, build, and package scripts to package.json
- Create .gitignore (node_modules, dist, out, etc.)
- Create basic README.md with setup instructions

---

### Story 2: Application Shell UI Layout

**As a** user  
**I need** a desktop application with intuitive layout and navigation  
**So that** I can access all video editing features efficiently

**Acceptance Criteria:**

**Menu Bar Implementation:**
- [ ] Menu bar visible at top of application window
- [ ] "File" menu with items:
  - [ ] New Project
  - [ ] Open... (with keyboard shortcut displayed)
  - [ ] Save / Save As...
  - [ ] Import Video... (Cmd/Ctrl+I)
  - [ ] Export Video... (Cmd/Ctrl+E)
  - [ ] Separator
  - [ ] Quit (Cmd/Ctrl+Q)
- [ ] "Edit" menu with items:
  - [ ] Undo (Cmd/Ctrl+Z)
  - [ ] Redo (Cmd/Ctrl+Shift+Z)
  - [ ] Separator
  - [ ] Cut (Cmd/Ctrl+X)
  - [ ] Copy (Cmd/Ctrl+C)
  - [ ] Paste (Cmd/Ctrl+V)
  - [ ] Delete (Del)
- [ ] "View" menu with items:
  - [ ] Zoom In (Cmd/Ctrl++)
  - [ ] Zoom Out (Cmd/Ctrl+-)
  - [ ] Reset Zoom
  - [ ] Separator
  - [ ] Toggle DevTools (Cmd/Ctrl+Shift+I)
- [ ] "Window" menu with items:
  - [ ] Minimize
  - [ ] Zoom (macOS only)
  - [ ] Full Screen
- [ ] "Help" menu with items:
  - [ ] Documentation
  - [ ] Keyboard Shortcuts
  - [ ] Separator
  - [ ] About ClipForge
- [ ] Menu bar uses native OS styling (macOS vs Windows/Linux)
- [ ] Keyboard shortcuts work when menu items selected
- [ ] Menu items disable when not applicable (grayed out)

**Toolbar Implementation:**
- [ ] Toolbar positioned directly below menu bar
- [ ] Primary action buttons visible and labeled:
  - [ ] 📁 Import Video button
  - [ ] ● Record Screen button (red dot icon)
  - [ ] 🎥 Record Webcam button
  - [ ] ✂️ Split Clip button
  - [ ] 🗑️ Delete button
  - [ ] ⟲ Undo button
  - [ ] ⟳ Redo button
  - [ ] 🎬 Export Video button (prominent, right-aligned)
- [ ] Buttons have hover states (visual feedback)
- [ ] Buttons have disabled states (grayed out when not applicable)
- [ ] Tooltips display on hover (show button name + shortcut)
- [ ] Icon sizing consistent (20-24px)
- [ ] Toolbar has subtle border/shadow for depth

**Workspace Layout:**
- [ ] Main workspace divided into three distinct areas
- [ ] **Left Sidebar (Media Library):**
  - [ ] Width: 250-300px default
  - [ ] Resizable with drag handle on right edge
  - [ ] Minimum width: 200px, maximum: 400px
  - [ ] Header: "Media Library" label
  - [ ] Placeholder content: "Import videos to get started" message
  - [ ] Background color distinct from main workspace
  - [ ] Border on right edge
- [ ] **Center Area (Video Preview):**
  - [ ] Takes remaining width between sidebar and edge
  - [ ] Header: "Preview" label
  - [ ] Placeholder: Gray rectangle with video player icon
  - [ ] Aspect ratio container (16:9) for video
  - [ ] Playback controls placeholder below preview:
    - [ ] ◀ Previous Frame | ⏸ Play/Pause | ▶ Next Frame
    - [ ] Time display: 00:00 / 00:00
    - [ ] Volume slider (muted for now)
  - [ ] Centered content with padding
- [ ] **Bottom Area (Timeline):**
  - [ ] Height: 200-250px default
  - [ ] Resizable with drag handle on top edge
  - [ ] Minimum height: 150px, maximum: 400px
  - [ ] Header: "Timeline" label
  - [ ] Placeholder: Horizontal ruler showing time markers
  - [ ] Background with subtle grid pattern
  - [ ] Zoom controls in timeline header (+ / - buttons)

**Window Management:**
- [ ] Application window opens with default size: 1440x900
- [ ] Window minimum size enforced: 1280x720
- [ ] Window maximum size: system display resolution
- [ ] Window is resizable by dragging edges/corners
- [ ] Window state persists between sessions:
  - [ ] Width and height saved to local storage
  - [ ] X and Y position saved to local storage
  - [ ] Window state restored on next launch
  - [ ] Handles edge case: saved position off-screen (reset to center)
- [ ] Native window controls work correctly:
  - [ ] Minimize button → window minimizes to dock/taskbar
  - [ ] Maximize button → window fills screen (or enters full screen on macOS)
  - [ ] Restore button → returns to previous size
  - [ ] Close button → quits application cleanly

**UI/UX Requirements:**
- [ ] Modern, clean interface using Tailwind CSS
- [ ] Consistent color scheme:
  - [ ] Background: Dark theme (neutral-900) or light theme (neutral-50)
  - [ ] Text: High contrast for readability
  - [ ] Accents: Primary color for interactive elements
- [ ] Consistent spacing using Tailwind scale (4px base)
- [ ] Typography hierarchy:
  - [ ] Headers: font-semibold, text-lg
  - [ ] Body: font-normal, text-sm
  - [ ] Labels: font-medium, text-xs
- [ ] Responsive layout adapts to window size:
  - [ ] Sidebar collapses to icons at narrow widths (<1280px)
  - [ ] Timeline height adjusts proportionally
  - [ ] No horizontal scrolling required
- [ ] Loading state during initialization:
  - [ ] Splash screen or skeleton UI while app loads
  - [ ] Smooth fade-in when content ready
- [ ] Error boundary for graceful error handling:
  - [ ] Catches React component errors
  - [ ] Displays user-friendly error message
  - [ ] Offers "Reload" button
  - [ ] Logs error to console for debugging

**Accessibility:**
- [ ] Keyboard navigation works throughout UI
- [ ] Tab order logical (left to right, top to bottom)
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on icon-only buttons
- [ ] Sufficient color contrast (WCAG AA minimum)

**Performance:**
- [ ] Initial render completes in <500ms
- [ ] UI remains responsive during resize operations
- [ ] No layout shift or flicker during load
- [ ] Smooth animations (60 FPS) for transitions

**Verification Tests:**
- [ ] Open app → All three workspace areas visible
- [ ] Click each menu → All items appear correctly
- [ ] Hover toolbar buttons → Tooltips appear
- [ ] Resize window → Layout adapts smoothly
- [ ] Resize sidebar → Width changes, persists after reload
- [ ] Resize timeline → Height changes, persists after reload
- [ ] Close and reopen app → Window size/position restored
- [ ] Tab through UI → Logical focus order maintained

---

### Story 3: File System Integration

**As a** user  
**I need** the application to access my local file system  
**So that** I can import and export video files

**Acceptance Criteria:**

**File Open Dialog:**
- [ ] File > Open menu item triggers file picker
- [ ] Import Video button (toolbar/menu) triggers file picker
- [ ] Native OS file picker dialog appears (not web-based)
- [ ] Dialog title: "Select Video Files"
- [ ] File picker filters by supported video formats:
  - [ ] .mp4 (MPEG-4 Video)
  - [ ] .mov (QuickTime Movie)
  - [ ] .webm (WebM Video)
  - [ ] Filter dropdown allows "All Supported Formats" or individual types
- [ ] Multiple file selection enabled (Ctrl/Cmd+click)
- [ ] Dialog shows file preview thumbnails (OS dependent)
- [ ] Cancel button closes dialog without action
- [ ] Selected file path(s) returned correctly to renderer process

**File Save Dialog:**
- [ ] File > Save As menu item triggers save dialog
- [ ] Export Video button triggers save dialog (when implemented)
- [ ] Native OS save dialog appears
- [ ] Dialog title: "Export Video"
- [ ] Default filename suggested (e.g., "ClipForge Export.mp4")
- [ ] File format filter shows .mp4 as default
- [ ] Dialog respects user's default save location
- [ ] Overwrite confirmation if file exists
- [ ] Selected save path returned correctly to renderer

**IPC File Operations:**
- [ ] IPC channel `file:open` implemented
- [ ] Renderer sends request to main process
- [ ] Main process opens dialog via `dialog.showOpenDialog()`
- [ ] Main process returns file paths to renderer
- [ ] Timeout handling (10 seconds max)
- [ ] Error handling if dialog fails
- [ ] IPC channel `file:save` implemented
- [ ] Renderer sends save request with default filename
- [ ] Main process opens save dialog via `dialog.showSaveDialog()`
- [ ] Main process returns save path to renderer

**File Permissions:**
- [ ] Application has read permissions for user-selected files
- [ ] Read permission verified before file operations
- [ ] Application has write permissions for export directory
- [ ] Write permission verified before save operations
- [ ] Permission errors caught and displayed to user
- [ ] macOS: Prompts for file access permission if needed
- [ ] Windows: Respects UAC and folder permissions
- [ ] Linux: Respects standard Unix permissions

**Cross-Platform Path Handling:**
- [ ] File paths work correctly on macOS (Unix-style paths)
- [ ] File paths work correctly on Windows (backslash paths)
- [ ] File paths work correctly on Linux (Unix-style paths)
- [ ] Path conversion handled automatically (Node.js path module)
- [ ] No hardcoded path separators in code
- [ ] Relative paths resolved correctly
- [ ] Handles paths with spaces and special characters
- [ ] Handles Unicode characters in filenames
- [ ] Network paths supported on Windows (\\server\share)

**File Validation:**
- [ ] Selected files validated as video format (by extension)
- [ ] File existence verified before operations
- [ ] File size checked (warn if >2GB)
- [ ] Corrupt or unreadable files detected
- [ ] Error message displayed for invalid files
- [ ] User can retry selection if validation fails

**Security Requirements:**
- [ ] Only user-initiated file operations allowed (no auto-access)
- [ ] No automatic file system access without user consent
- [ ] File paths validated and sanitized before operations
- [ ] No path traversal vulnerabilities (../../ attacks prevented)
- [ ] No execution of files (only read video data)
- [ ] File operations logged for debugging
- [ ] Error handling for permission denied scenarios:
  - [ ] User-friendly error message displayed
  - [ ] Technical details logged to console
  - [ ] Suggestion to check permissions
- [ ] Temporary files cleaned up after operations

**State Management:**
- [ ] Recently opened files tracked in state
- [ ] Last opened directory remembered
- [ ] Recent files shown in File menu (up to 10)
- [ ] Recent files persist between sessions
- [ ] Invalid recent files removed from list

**Error Handling:**
- [ ] Permission denied → "Cannot access file. Check permissions."
- [ ] File not found → "File no longer exists at this location."
- [ ] Invalid format → "Unsupported file format. Use MP4, MOV, or WebM."
- [ ] Disk full (on save) → "Insufficient disk space for export."
- [ ] Network error → "Cannot access network location."
- [ ] All errors include actionable next steps

**Verification Tests:**
- [ ] Click File > Open → Native dialog appears
- [ ] Select .mp4 file → Path logged to console
- [ ] Select .mov file → Path logged to console
- [ ] Select .webm file → Path logged to console
- [ ] Select .txt file → Error shown (invalid format)
- [ ] Select multiple files → All paths returned
- [ ] Cancel dialog → No errors, no action taken
- [ ] Test on Windows → Paths with backslashes work
- [ ] Test on macOS → Unix paths work
- [ ] Test with filename containing spaces → Works correctly
- [ ] Click File > Save As → Save dialog appears
- [ ] Choose location and filename → Path returned correctly
- [ ] Try to save to read-only folder → Permission error shown

---

### Story 4: Application Packaging & Distribution

**As a** developer  
**I need** to package ClipForge as a distributable native app  
**So that** users can install and run it without technical setup

**Acceptance Criteria:**

**electron-builder Configuration:**
- [ ] electron-builder installed as dev dependency
- [ ] Build configuration file created (electron-builder.json or package.json config)
- [ ] Product name set: "ClipForge"
- [ ] App ID set: "com.clipforge.app" (or appropriate identifier)
- [ ] Version number from package.json used automatically
- [ ] Copyright notice included
- [ ] Description and author metadata configured
- [ ] Build output directory configured (dist/ or release/)
- [ ] Build files configuration excludes dev files
- [ ] Compression enabled for smaller package size

**macOS Packaging (.dmg):**
- [ ] macOS target configured in electron-builder
- [ ] Generates .dmg disk image installer
- [ ] DMG includes drag-to-Applications folder UI
- [ ] DMG background image (optional but recommended)
- [ ] App icon displays correctly in .dmg and Applications
- [ ] App bundle name: ClipForge.app
- [ ] Minimum macOS version specified: 10.15 (Catalina)
- [ ] Universal binary (Intel + Apple Silicon) or separate builds
- [ ] File associations configured for .mp4, .mov, .webm (optional)
- [ ] Code signing configuration prepared:
  - [ ] Signing identity configured (if certificate available)
  - [ ] Notarization prepared (can be disabled for development)
  - [ ] If no certificate: Build with ad-hoc signing for testing
- [ ] Packaged app size reasonable (<150MB without FFmpeg)

**Windows Packaging (.exe):**
- [ ] Windows target configured in electron-builder
- [ ] NSIS installer configured (recommended) or Squirrel.Windows
- [ ] Generates .exe installer
- [ ] Installer includes:
  - [ ] Welcome screen with ClipForge branding
  - [ ] License agreement (if applicable)
  - [ ] Installation directory selection
  - [ ] Desktop shortcut option
  - [ ] Start Menu shortcut option
  - [ ] Uninstaller creation
- [ ] App icon displays correctly in installer, Start Menu, desktop
- [ ] Minimum Windows version specified: Windows 10 64-bit
- [ ] Code signing configuration prepared:
  - [ ] Signing certificate configured (if available)
  - [ ] If no certificate: Build unsigned for testing (SmartScreen warning expected)
- [ ] File associations configured for .mp4, .mov, .webm (optional)
- [ ] Packaged installer size reasonable (<150MB without FFmpeg)
- [ ] Silent install option available: `ClipForge-Setup.exe /S`

**Linux Packaging (.AppImage):**
- [ ] Linux target configured in electron-builder
- [ ] Generates .AppImage (recommended for distribution)
- [ ] AppImage is self-contained (no installation required)
- [ ] AppImage has executable permissions set automatically
- [ ] App icon displays correctly in app launcher
- [ ] Desktop file (.desktop) created with proper metadata
- [ ] Minimum Linux version: Ubuntu 20.04 or equivalent
- [ ] Works on common distros: Ubuntu, Debian, Fedora, Arch
- [ ] Alternative formats available:
  - [ ] .deb package (Debian/Ubuntu) - optional
  - [ ] .rpm package (Fedora/RHEL) - optional
- [ ] Packaged AppImage size reasonable (<150MB without FFmpeg)

**App Icon:**
- [ ] Icon created at multiple resolutions:
  - [ ] 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512, 1024x1024
- [ ] macOS: .icns file generated
- [ ] Windows: .ico file generated
- [ ] Linux: .png files at various sizes
- [ ] Icon displays correctly in all contexts:
  - [ ] Application dock/taskbar
  - [ ] Window title bar
  - [ ] Alt-Tab switcher
  - [ ] About dialog
  - [ ] Installer screens
- [ ] Icon is professional and recognizable
- [ ] Icon follows platform design guidelines

**Application Metadata:**
- [ ] Application name: "ClipForge"
- [ ] Application version from package.json (e.g., "1.0.0")
- [ ] Copyright notice included
- [ ] Author/company name specified
- [ ] Description: "Desktop video editor for rapid content creation"
- [ ] License type specified (MIT, GPL, proprietary, etc.)
- [ ] Homepage URL (if applicable)
- [ ] About dialog displays correct information

**Runtime Dependencies:**
- [ ] Packaged app launches without requiring Node.js installation
- [ ] Electron runtime bundled correctly
- [ ] Node.js native modules bundled (if any)
- [ ] All npm dependencies included (production only)
- [ ] No missing module errors on launch
- [ ] No external runtime requirements (except OS libraries)
- [ ] FFmpeg integration prepared but not required for MVP (added in Epic 6)

**Build Scripts:**
- [ ] `npm run package:mac` - Build macOS .dmg
- [ ] `npm run package:win` - Build Windows .exe
- [ ] `npm run package:linux` - Build Linux .AppImage
- [ ] `npm run package:all` - Build all platforms (if on compatible OS)
- [ ] `npm run package` - Build for current platform
- [ ] Build scripts documented in README.md
- [ ] CI/CD preparation (GitHub Actions config optional)

**Testing on Clean Machine:**
- [ ] macOS: Test .dmg on Mac without Xcode/Node.js
  - [ ] Download .dmg file
  - [ ] Open .dmg and drag to Applications
  - [ ] Launch from Applications folder
  - [ ] Verify app launches without errors
  - [ ] Check Gatekeeper doesn't block (or shows expected warning if unsigned)
- [ ] Windows: Test .exe on Windows without Visual Studio/Node.js
  - [ ] Download .exe installer
  - [ ] Run installer
  - [ ] Verify installation completes successfully
  - [ ] Launch from Start Menu or desktop shortcut
  - [ ] Verify app launches without errors
  - [ ] Check SmartScreen warning if unsigned (expected)
- [ ] Linux: Test .AppImage on Ubuntu without dev tools
  - [ ] Download .AppImage file
  - [ ] Make executable: `chmod +x ClipForge.AppImage`
  - [ ] Run: `./ClipForge.AppImage`
  - [ ] Verify app launches without errors

**Package Size Optimization:**
- [ ] Production build strips dev dependencies
- [ ] Source maps excluded from production build (optional)
- [ ] Unused modules tree-shaken
- [ ] Compression enabled (asar archive)
- [ ] Final package size documented:
  - [ ] macOS .dmg: Target <150MB
  - [ ] Windows .exe: Target <150MB
  - [ ] Linux .AppImage: Target <150MB

**Build Performance:**
- [ ] Development build completes in <2 minutes
- [ ] Production package build completes in <5 minutes
- [ ] Incremental builds work correctly (only changed files rebuilt)

**Error Handling:**
- [ ] Build errors clearly reported
- [ ] Missing dependencies detected early
- [ ] Platform incompatibilities warned (e.g., can't build macOS .dmg on Windows)
- [ ] Disk space insufficient → Clear error message
- [ ] Build log saved for debugging

**Documentation:**
- [ ] README.md includes:
  - [ ] Build prerequisites (Node.js version, OS requirements)
  - [ ] Build commands for each platform
  - [ ] Troubleshooting common build issues
  - [ ] How to test packaged app
- [ ] BUILD.md or CONTRIBUTING.md with detailed build instructions (optional)

**Verification Tests:**
- [ ] Run `npm run package` → Build completes successfully
- [ ] Check dist/release folder → Installer files present
- [ ] Copy installer to USB drive or Downloads
- [ ] Test on clean VM or separate machine
- [ ] Install and launch app → Works without Node.js
- [ ] Check app icon → Displays correctly
- [ ] Check About dialog → Version/metadata correct
- [ ] Check file size → Within acceptable range
- [ ] Uninstall app (Windows) → Removes cleanly

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Electron App                         │
├───────────────────────────────┬─────────────────────────────┤
│        Main Process           │      Renderer Process        │
│         (Node.js)             │       (Chromium)             │
│                               │                              │
│  - app lifecycle              │  - React 18 UI               │
│  - BrowserWindow              │  - TypeScript components     │
│  - ipcMain handlers           │  - Tailwind CSS              │
│  - File system operations     │  - ipcRenderer client        │
│  - Native dialogs             │  - State management (Zustand)│
│                               │                              │
│  [Future: FFmpeg, Recording]  │  [Future: Canvas, Video]     │
└───────────────────────────────┴─────────────────────────────┘
```

### IPC Communication Patterns

**Channel: `file:open`**
- Renderer → Main: Request to open file picker
- Main → Renderer: Return selected file path(s)

**Channel: `app:ready`**
- Renderer → Main: UI loaded notification
- Main → Renderer: Application state initialization

**Channel: `window:state`**
- Renderer → Main: Save window size/position
- Main → Renderer: Restore window state

### Technology Stack

**Core Dependencies:**
```json
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.2.0"
}
```

**Build Tools:**
```json
{
  "vite": "^5.0.0",
  "electron-builder": "^24.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```

**UI Framework:**
```json
{
  "tailwindcss": "^3.3.0",
  "zustand": "^4.4.0"
}
```

---

## Dependencies & Blockers

### Dependencies
- None (this is the foundation epic)

### Enables
- **Epic 2:** Video Import & Media Library (needs file system access)
- **Epic 3:** Timeline Editor (needs UI shell and React rendering)
- **Epic 4:** Video Preview & Playback (needs window and media handling)
- **All other features** depend on this foundation

### External Dependencies
- Electron framework (stable, well-documented)
- Node.js 18+ runtime
- Platform-specific build tools (Xcode for macOS, VS Build Tools for Windows)

---

## Risks & Mitigation

### Risk 1: Packaging Fails on Target Platforms
**Impact:** HIGH - Cannot deliver native app  
**Probability:** MEDIUM  
**Mitigation:**
- Test packaging on all platforms early (by end of Story 1)
- Use GitHub Actions for CI builds
- Keep electron-builder config minimal initially
- Document platform-specific requirements

**Contingency:** Focus on single platform (macOS) for MVP if multi-platform blocked

---

### Risk 2: IPC Communication Unstable
**Impact:** HIGH - App cannot function properly  
**Probability:** LOW  
**Mitigation:**
- Use Electron's contextBridge for secure IPC
- Implement error handling and timeouts
- Add logging for IPC messages during development
- Follow Electron security best practices

**Contingency:** Simplify to minimal IPC channels for MVP only

---

### Risk 3: Slow Startup Time (>3 seconds)
**Impact:** MEDIUM - Poor user experience  
**Probability:** MEDIUM  
**Mitigation:**
- Lazy load non-critical components
- Optimize bundle size with tree-shaking
- Use Vite's code splitting
- Profile startup performance regularly

**Contingency:** Accept slower startup for hackathon, optimize post-submission

---

### Risk 4: Cross-Platform UI Inconsistencies
**Impact:** LOW - Cosmetic issues  
**Probability:** HIGH  
**Mitigation:**
- Use Tailwind CSS for consistent styling
- Test on multiple platforms regularly
- Use platform-agnostic components
- Document known platform differences

**Contingency:** Accept minor differences, document as known issues

---

## Definition of Done

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] ESLint passes with no warnings
- [ ] Code follows project conventions
- [ ] No console errors in development mode

### Functionality
- [ ] All user stories completed with acceptance criteria met
- [ ] Application launches successfully on all target platforms
- [ ] UI renders correctly and is responsive
- [ ] File dialogs work on all platforms
- [ ] Window state persists correctly

### Testing
- [ ] Manual smoke test passed on macOS
- [ ] Manual smoke test passed on Windows
- [ ] Manual smoke test passed on Linux
- [ ] IPC communication verified
- [ ] Memory usage <200MB at idle

### Documentation
- [ ] README.md includes setup instructions
- [ ] Development environment documented
- [ ] Build and packaging process documented
- [ ] Known issues documented

### Deployment
- [ ] Application packages successfully (.dmg, .exe, .AppImage)
- [ ] Packaged app runs on clean machine
- [ ] App icon displays correctly
- [ ] Version number correct in About dialog

---

## Timeline & Milestones

### Monday Morning (Hours 1-4)
- Story 1: Development environment setup
- First "Hello World" Electron window running

### Monday Afternoon (Hours 5-8)
- Story 2: UI layout implementation
- Basic shell interface visible

### Tuesday Morning (Hours 9-12)
- Story 3: File system integration
- Story 4: Packaging setup and first build

### Checkpoint: Tuesday 10:59 PM CT
- All stories complete
- Packaged app ready for testing
- Foundation ready for video features

---

## Acceptance Testing

### Manual Test Scripts

**Test Suite 1: First Launch Experience**

**Test 1.1: Initial Application Launch**
1. Locate packaged application (ClipForge.app / ClipForge.exe / ClipForge.AppImage)
2. Double-click application icon
3. **Expected:** App launches within 3 seconds
4. **Expected:** Main window appears with default size (1440x900)
5. **Expected:** All UI elements visible (menu bar, toolbar, sidebar, preview, timeline)
6. **Expected:** No console errors (check DevTools)
7. **Expected:** Memory usage <200MB (check Activity Monitor / Task Manager)
8. **Pass/Fail:** _______

**Test 1.2: Application Quit**
1. Click File > Quit (or close button)
2. **Expected:** Application closes immediately
3. **Expected:** No orphaned processes (check Task Manager / Activity Monitor)
4. **Expected:** No error dialogs
5. **Pass/Fail:** _______

**Test 1.3: Startup Performance**
1. Relaunch application
2. Measure time from icon click to UI ready
3. **Expected:** Cold start <3 seconds
4. **Expected:** Warm start <1 second (if applicable)
5. **Pass/Fail:** _______

---

**Test Suite 2: User Interface Elements**

**Test 2.1: Menu Bar Navigation**
1. Click "File" menu
2. **Expected:** Menu opens with all items (New, Open, Save, Import, Export, Quit)
3. **Expected:** Keyboard shortcuts displayed next to menu items
4. Click "Edit" menu
5. **Expected:** All editing commands visible (Undo, Redo, Cut, Copy, Paste, Delete)
6. Click "View" menu
7. **Expected:** View options visible (Zoom In/Out, Reset, DevTools)
8. Click "Window" menu
9. **Expected:** Window controls visible (Minimize, Zoom, Full Screen)
10. Click "Help" menu
11. **Expected:** Help items visible (Documentation, Shortcuts, About)
12. **Pass/Fail:** _______

**Test 2.2: Toolbar Functionality**
1. Hover over Import Video button
2. **Expected:** Tooltip appears showing "Import Video (Cmd/Ctrl+I)"
3. Hover over each toolbar button
4. **Expected:** All tooltips display correctly
5. Check button states (should all be clickable except context-sensitive ones)
6. **Expected:** Buttons have visual hover state
7. **Pass/Fail:** _______

**Test 2.3: Workspace Layout**
1. Identify left sidebar (Media Library)
2. **Expected:** Width approximately 250-300px
3. **Expected:** Header shows "Media Library"
4. **Expected:** Placeholder text visible
5. Identify center area (Video Preview)
6. **Expected:** Preview area with 16:9 aspect ratio placeholder
7. **Expected:** Playback controls visible below preview
8. Identify bottom area (Timeline)
9. **Expected:** Height approximately 200-250px
10. **Expected:** Timeline header with "Timeline" label
11. **Expected:** Time ruler visible
12. **Pass/Fail:** _______

---

**Test Suite 3: Window Management**

**Test 3.1: Window Resizing**
1. Drag window corner to resize smaller (e.g., 1280x720)
2. **Expected:** Layout adapts smoothly, no content cut off
3. **Expected:** Minimum size enforced (cannot resize below 1280x720)
4. Drag window corner to resize larger (e.g., 1920x1080)
5. **Expected:** Layout expands to fill space
6. **Expected:** All elements remain properly positioned
7. **Pass/Fail:** _______

**Test 3.2: Sidebar Resizing**
1. Locate drag handle on right edge of sidebar
2. Drag handle to make sidebar wider (e.g., 350px)
3. **Expected:** Sidebar width changes in real-time
4. **Expected:** Preview area adjusts accordingly
5. Drag handle to make sidebar narrower (e.g., 200px)
6. **Expected:** Cannot resize below 200px minimum
7. **Pass/Fail:** _______

**Test 3.3: Timeline Resizing**
1. Locate drag handle on top edge of timeline
2. Drag handle up to make timeline taller (e.g., 300px)
3. **Expected:** Timeline height changes in real-time
4. **Expected:** Preview area shrinks accordingly
5. Drag handle down to make timeline shorter
6. **Expected:** Cannot resize below 150px minimum
7. **Pass/Fail:** _______

**Test 3.4: Window State Persistence**
1. Resize window to non-default size (e.g., 1600x1000)
2. Move window to specific position on screen
3. Resize sidebar to 320px
4. Resize timeline to 280px
5. Close application
6. Reopen application
7. **Expected:** Window size restored (1600x1000)
8. **Expected:** Window position restored
9. **Expected:** Sidebar width restored (320px)
10. **Expected:** Timeline height restored (280px)
11. **Pass/Fail:** _______

**Test 3.5: Window Controls**
1. Click Minimize button
2. **Expected:** Window minimizes to dock/taskbar
3. Click app in dock/taskbar to restore
4. **Expected:** Window restores to previous size/position
5. Click Maximize/Full Screen button
6. **Expected:** Window fills screen
7. Click Restore button
8. **Expected:** Window returns to previous size
9. **Pass/Fail:** _______

---

**Test Suite 4: File System Integration**

**Test 4.1: Open File Dialog - Basic**
1. Click File > Open (or toolbar Import button)
2. **Expected:** Native OS file picker appears
3. **Expected:** Dialog title shows "Select Video Files"
4. **Expected:** File filter shows video formats (.mp4, .mov, .webm)
5. **Pass/Fail:** _______

**Test 4.2: Open File Dialog - File Selection**
1. Navigate to folder containing test video files
2. Select a .mp4 file
3. Click "Open"
4. **Expected:** Dialog closes
5. **Expected:** File path logged to console (check DevTools)
6. **Expected:** No errors displayed
7. **Pass/Fail:** _______

**Test 4.3: Open File Dialog - Multiple Files**
1. Open file dialog again
2. Select multiple video files (Ctrl/Cmd+click)
3. Click "Open"
4. **Expected:** All file paths returned
5. **Expected:** Paths logged to console
6. **Pass/Fail:** _______

**Test 4.4: Open File Dialog - Cancel**
1. Open file dialog
2. Click "Cancel" without selecting file
3. **Expected:** Dialog closes
4. **Expected:** No errors or warnings
5. **Expected:** Application remains responsive
6. **Pass/Fail:** _______

**Test 4.5: Open File Dialog - Invalid File**
1. Open file dialog
2. Change filter to "All Files" (if possible)
3. Select a non-video file (e.g., .txt, .pdf)
4. Click "Open"
5. **Expected:** Error message displayed: "Unsupported file format"
6. **Expected:** User can dismiss error and continue
7. **Pass/Fail:** _______

**Test 4.6: Save File Dialog**
1. Click File > Save As
2. **Expected:** Native save dialog appears
3. **Expected:** Dialog title shows "Export Video"
4. **Expected:** Default filename suggested (e.g., "ClipForge Export.mp4")
5. Enter custom filename
6. Choose save location
7. Click "Save"
8. **Expected:** Path returned to application
9. **Expected:** Path logged to console
10. **Pass/Fail:** _______

**Test 4.7: Cross-Platform Paths (Windows)**
1. On Windows machine, open file from C:\Users\...\Videos\
2. **Expected:** Path with backslashes handled correctly
3. **Expected:** Path logged shows correct format
4. Try network path (\\\\server\\share if available)
5. **Expected:** Network paths supported
6. **Pass/Fail:** _______

**Test 4.8: Cross-Platform Paths (macOS/Linux)**
1. On macOS/Linux, open file from /Users/.../Videos/ or ~/Videos/
2. **Expected:** Unix-style paths handled correctly
3. Open file with spaces in path
4. **Expected:** Spaces handled correctly
5. Open file with Unicode characters in name (e.g., "视频.mp4")
6. **Expected:** Unicode handled correctly
7. **Pass/Fail:** _______

---

**Test Suite 5: IPC Communication**

**Test 5.1: IPC Ping/Pong Test**
1. Open DevTools (Cmd/Ctrl+Shift+I)
2. Open Console tab
3. Type: `window.electronAPI.ping('test')`
4. **Expected:** Response received within 50ms
5. **Expected:** Console logs: "Pong: test"
6. **Pass/Fail:** _______

**Test 5.2: File Dialog IPC**
1. Click Import button (triggers IPC call)
2. Monitor DevTools Network/Console
3. **Expected:** IPC message sent from renderer to main
4. **Expected:** File dialog opens (proves IPC worked)
5. Select file
6. **Expected:** IPC response returns file path
7. **Pass/Fail:** _______

---

**Test Suite 6: Cross-Platform Compatibility**

**Test 6.1: macOS Build and Launch**
1. Build on macOS: `npm run package:mac`
2. **Expected:** Build completes without errors
3. **Expected:** .dmg file created in dist/
4. Open .dmg file
5. **Expected:** Installer window shows drag-to-Applications UI
6. Drag to Applications folder
7. Double-click ClipForge.app in Applications
8. **Expected:** App launches (may show Gatekeeper warning if unsigned)
9. **Expected:** All features work on macOS
10. **Pass/Fail:** _______

**Test 6.2: Windows Build and Launch**
1. Build on Windows: `npm run package:win`
2. **Expected:** Build completes without errors
3. **Expected:** .exe installer created in dist/
4. Run installer
5. **Expected:** Installation wizard appears
6. Follow installation steps
7. **Expected:** Installation completes successfully
8. Launch from Start Menu
9. **Expected:** App launches (may show SmartScreen warning if unsigned)
10. **Expected:** All features work on Windows
11. **Pass/Fail:** _______

**Test 6.3: Linux Build and Launch**
1. Build on Linux: `npm run package:linux`
2. **Expected:** Build completes without errors
3. **Expected:** .AppImage created in dist/
4. Make executable: `chmod +x ClipForge-*.AppImage`
5. Run: `./ClipForge-*.AppImage`
6. **Expected:** App launches
7. **Expected:** All features work on Linux
8. **Pass/Fail:** _______

**Test 6.4: Clean Machine Test (Critical)**
1. Identify clean machine/VM WITHOUT Node.js installed
2. Copy packaged installer to clean machine
3. Install application
4. Launch application
5. **Expected:** App launches successfully
6. **Expected:** No "Node.js required" or similar errors
7. **Expected:** All features functional
8. **Expected:** Memory usage <200MB
9. **Pass/Fail:** _______

---

**Test Suite 7: Performance & Resource Usage**

**Test 7.1: Startup Time**
1. Cold start (first launch after reboot)
2. Measure time from icon click to UI fully rendered
3. **Expected:** <3 seconds
4. **Recorded Time:** _______ seconds
5. **Pass/Fail:** _______

**Test 7.2: Memory Usage at Idle**
1. Launch application
2. Wait 30 seconds for stabilization
3. Check memory usage in Activity Monitor/Task Manager
4. **Expected:** <200MB
5. **Recorded Usage:** _______ MB
6. **Pass/Fail:** _______

**Test 7.3: CPU Usage at Idle**
1. Application running, no user interaction
2. Check CPU usage
3. **Expected:** <5%
4. **Recorded Usage:** _______ %
5. **Pass/Fail:** _______

**Test 7.4: UI Responsiveness**
1. Rapidly resize window multiple times
2. **Expected:** Smooth animation, no lag
3. **Expected:** Maintains 30+ FPS
4. Drag sidebar rapidly
5. **Expected:** Real-time updates, no lag
6. **Pass/Fail:** _______

---

**Test Suite 8: Error Handling & Edge Cases**

**Test 8.1: Graceful Error Handling**
1. With DevTools open, trigger a React error (if possible in Story 2)
2. **Expected:** Error boundary catches error
3. **Expected:** User-friendly error message displayed
4. **Expected:** "Reload" button available
5. **Pass/Fail:** _______

**Test 8.2: Window Off-Screen Recovery**
1. Manually edit window position in localStorage/settings
2. Set position to (-5000, -5000) (off-screen)
3. Relaunch application
4. **Expected:** Window appears centered on screen
5. **Expected:** Window not invisible or inaccessible
6. **Pass/Fail:** _______

**Test 8.3: Keyboard Shortcuts**
1. Press Cmd/Ctrl+I
2. **Expected:** Import dialog opens
3. Press Cmd/Ctrl+Q
4. **Expected:** Application quits
5. Press Cmd/Ctrl+Z (when feature implemented)
6. **Expected:** Undo action triggered or button responds
7. **Pass/Fail:** _______

---

### Summary Report Template

**Epic 1: Desktop Application Shell - Acceptance Test Results**

**Date Tested:** _____________  
**Tester:** _____________  
**Platform:** macOS / Windows / Linux (circle one)  
**OS Version:** _____________

**Test Results Summary:**
- Suite 1 (First Launch): ___/3 Passed
- Suite 2 (UI Elements): ___/3 Passed
- Suite 3 (Window Management): ___/5 Passed
- Suite 4 (File System): ___/8 Passed
- Suite 5 (IPC): ___/2 Passed
- Suite 6 (Cross-Platform): ___/4 Passed
- Suite 7 (Performance): ___/4 Passed
- Suite 8 (Error Handling): ___/3 Passed

**Total: ___/32 Tests Passed**

**Critical Blockers:** (List any P0 failures)
- 
- 

**Known Issues:** (List non-critical issues)
- 
- 

**Sign-off:**
- [ ] All P0 acceptance criteria met
- [ ] Application ready for next epic
- [ ] Known issues documented

**Approved by:** _____________  
**Date:** _____________

---

## Notes & Assumptions

### Assumptions
- Development on macOS primary, Windows/Linux secondary
- Users have modern hardware (2017+ laptops)
- Internet required for initial npm install, not for runtime
- Single window application (no multi-window support needed)

### Out of Scope for This Epic
- Video playback functionality (Epic 4)
- Timeline rendering (Epic 3)
- Recording features (Epic 7-8)
- Export functionality (Epic 6)
- Any video processing logic

### Technical Decisions
- **Vite over Webpack:** Faster dev server, better DX
- **Zustand over Redux:** Simpler state management for small app
- **Tailwind CSS:** Rapid UI development with utility classes
- **TypeScript strict mode:** Catch errors early

---

## Handoff to Development

### Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Code editor (VS Code recommended with Electron extension)

### Getting Started
1. Review this epic document completely
2. Start with Story 1 (environment setup)
3. Commit frequently with descriptive messages
4. Test packaging early and often
5. Flag blockers immediately in team chat

### Resources
- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Electron + Vite Template](https://github.com/electron-vite/electron-vite-react)
- [electron-builder Docs](https://www.electron.build/)
- PRD Reference: `.docs/ClipForge-Video-Editor-PRD.md` Section 3.1

---

## Change Log

- **v1.0 (2025-10-27):** Initial epic creation from PRD section 3.1

