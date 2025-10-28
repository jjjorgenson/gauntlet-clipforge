# ClipForge Technical Decision Guide
## Fast Decision-Making Framework for 72-Hour Sprint

**Purpose:** Make critical technical decisions in <15 minutes using this framework

---

## 1. Framework Choice: FINAL DECISION

### ✅ RECOMMENDATION: Electron + React + TypeScript

**Rationale:**
- **Speed to MVP:** You can have a working app in 4 hours
- **Ecosystem:** Mature libraries for video (fluent-ffmpeg, MediaRecorder API)
- **Documentation:** Extensive Electron docs + community examples
- **Risk:** Low - proven technology stack
- **Trade-off:** Larger binary size (~200MB) - acceptable for this timeline

### ❌ NOT RECOMMENDED: Tauri
**Why:** Requires Rust knowledge, less mature video ecosystem, longer setup time (would cost 8-12 hours you don't have)

---

## 2. FFmpeg Integration Strategy

### Option A: System FFmpeg (Development)
```bash
# macOS
brew install ffmpeg

# Windows
choco install ffmpeg

# Linux
sudo apt-get install ffmpeg
```
**Pros:** Fast setup, no bundling needed
**Cons:** Not portable (won't work on user machines)
**Use for:** MVP development phase only

### Option B: Bundled FFmpeg (Production) ✅ REQUIRED
```bash
# Download static builds
# macOS: https://evermeet.cx/ffmpeg/
# Windows: https://www.gyan.dev/ffmpeg/builds/
# Linux: https://johnvansickle.com/ffmpeg/

# Add to electron-builder config
"extraResources": [
  {
    "from": "resources/bin/",
    "to": "bin",
    "filter": ["ffmpeg", "ffmpeg.exe"]
  }
]
```
**Pros:** App works standalone
**Cons:** 100MB binary size increase
**Use for:** Final submission build

### ⚠️ CRITICAL: Test bundled FFmpeg by Tuesday AM

---

## 3. Timeline Implementation: Canvas vs DOM

### ✅ RECOMMENDATION: HTML5 Canvas

**Why Canvas:**
- 60 FPS performance with hundreds of clips
- Pixel-perfect control over rendering
- GPU-accelerated
- Easy zoom/pan/scroll

**Example Structure:**
```typescript
// TimelineCanvas.tsx
const TimelineCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw timeline background
      // Draw clips as rectangles
      // Draw playhead
      
      requestAnimationFrame(render);
    };
    
    render();
  }, [clips]);
  
  return <canvas ref={canvasRef} width={1200} height={400} />;
};
```

### ❌ NOT RECOMMENDED: DOM-based Timeline
**Why:** Gets slow with >20 clips, harder to implement zoom/pan, more CSS headaches

---

## 4. State Management: Zustand vs Redux

### ✅ RECOMMENDATION: Zustand

**Setup (5 minutes):**
```typescript
// store/timeline.ts
import { create } from 'zustand';

interface TimelineState {
  clips: Clip[];
  currentTime: number;
  addClip: (clip: Clip) => void;
  removeClip: (id: string) => void;
  setCurrentTime: (time: number) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  clips: [],
  currentTime: 0,
  addClip: (clip) => set((state) => ({ clips: [...state.clips, clip] })),
  removeClip: (id) => set((state) => ({ 
    clips: state.clips.filter(c => c.id !== id) 
  })),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
```

**Why Zustand:**
- 15-minute setup vs 2+ hours for Redux
- No boilerplate
- TypeScript-first
- Perfect for this timeline

---

## 5. Video Playback Strategy

### ✅ RECOMMENDATION: HTML5 `<video>` Element

**Implementation:**
```typescript
// VideoPreview.tsx
const VideoPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { clips, currentTime } = useTimelineStore();
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Find clip at current time
    const activeClip = clips.find(c => 
      currentTime >= c.startTime && currentTime <= c.endTime
    );
    
    if (activeClip) {
      video.src = `file://${activeClip.sourceFile}`;
      video.currentTime = currentTime - activeClip.startTime + activeClip.trimIn;
    }
  }, [currentTime, clips]);
  
  return (
    <video 
      ref={videoRef} 
      controls 
      style={{ width: '100%', maxHeight: '400px' }}
    />
  );
};
```

**Why Native Video:**
- Zero setup
- Hardware-accelerated
- Supports all codecs
- Sync with timeline is simple

### ❌ AVOID: VideoJS, Plyr
**Why:** Overkill for this use case, adds complexity and bundle size

---

## 6. Recording Implementation

### Screen Recording
```typescript
// services/RecordingService.ts
import { desktopCapturer } from 'electron';

async function startScreenRecording() {
  // 1. Get available sources
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window']
  });
  
  // 2. User selects source (show dialog)
  const selectedSource = sources[0]; // Or let user choose
  
  // 3. Get media stream
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: selectedSource.id
      }
    }
  });
  
  // 4. Record with MediaRecorder
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });
  
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    // Save to file
  };
  
  recorder.start();
  return recorder;
}
```

### Webcam Recording
```typescript
async function startWebcamRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1920, height: 1080 },
    audio: true
  });
  
  const recorder = new MediaRecorder(stream);
  // Same as screen recording
}
```

### ⚠️ CRITICAL: Request permissions early (test in first 2 hours)

---

## 7. Export Pipeline

### Basic Export (MVP)
```typescript
// services/ExportService.ts
import ffmpeg from 'fluent-ffmpeg';

async function exportVideo(clip: Clip, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(clip.sourceFile)
      .setStartTime(clip.trimIn)
      .setDuration(clip.trimOut - clip.trimIn)
      .output(outputPath)
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Multi-Clip Export (Final)
```typescript
async function exportTimeline(clips: Clip[], outputPath: string) {
  // 1. Create concat file
  const concatFile = clips.map(c => 
    `file '${c.sourceFile}'\ninpoint ${c.trimIn}\noutpoint ${c.trimOut}`
  ).join('\n');
  
  // 2. Write to temp file
  fs.writeFileSync('/tmp/concat.txt', concatFile);
  
  // 3. Concatenate with FFmpeg
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input('/tmp/concat.txt')
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy']) // Fast, no re-encode
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

---

## 8. Project Structure (Copy This)

```
clipforge/
├── src/
│   ├── main/
│   │   ├── main.ts              # Electron entry point
│   │   ├── ipc/
│   │   │   ├── fileHandlers.ts  # Import/export IPC
│   │   │   └── recordHandlers.ts # Recording IPC
│   │   └── services/
│   │       ├── MediaService.ts
│   │       ├── RecordingService.ts
│   │       └── ExportService.ts
│   │
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── MediaLibrary.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── VideoPreview.tsx
│   │   │   └── ExportDialog.tsx
│   │   ├── store/
│   │   │   └── timeline.ts      # Zustand store
│   │   └── types/
│   │       └── models.ts        # Clip, Track, Project
│   │
│   └── shared/
│       ├── types.ts
│       └── constants.ts
│
├── resources/
│   └── bin/
│       ├── ffmpeg              # Bundle these
│       └── ffmpeg.exe
│
├── electron-builder.yml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 9. When Things Go Wrong (Debugging Checklist)

### Problem: FFmpeg Not Found
```typescript
// Diagnostic script
import ffmpeg from 'fluent-ffmpeg';
import { app } from 'electron';

const ffmpegPath = app.isPackaged
  ? path.join(process.resourcesPath, 'bin', 'ffmpeg')
  : 'ffmpeg';

console.log('FFmpeg path:', ffmpegPath);
console.log('Exists:', fs.existsSync(ffmpegPath));

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) console.error('FFmpeg error:', err);
  else console.log('FFmpeg working! Formats:', Object.keys(formats).length);
});
```

**Solutions:**
1. Verify FFmpeg binary is in `resources/bin/`
2. Check electron-builder config includes `extraResources`
3. Test with `ffmpeg -version` in terminal
4. Use absolute paths (avoid relative paths)

### Problem: Video Won't Play
**Checklist:**
- [ ] File path correct? (use `file://` protocol)
- [ ] Codec supported? (H.264 is safest)
- [ ] CORS issue? (shouldn't happen with file://)
- [ ] Video element has controls attribute?
- [ ] Check browser console for errors

### Problem: Timeline is Slow
**Solutions:**
1. Use `requestAnimationFrame` instead of setInterval
2. Only redraw when state changes (not every frame)
3. Implement clip culling (don't render offscreen clips)
4. Reduce canvas resolution if >4K

### Problem: Export Fails Silently
**Debug:**
```typescript
ffmpeg(input)
  .output(output)
  .on('start', (cmd) => console.log('FFmpeg command:', cmd))
  .on('stderr', (line) => console.log('FFmpeg log:', line))
  .on('error', (err) => console.error('FFmpeg error:', err))
  .run();
```

---

## 10. Rapid Decision Matrix

Use this when stuck:

| Question | Answer | Action | Time Limit |
|----------|--------|--------|------------|
| Can't get X working? | Yes | Google/ChatGPT for 15 min → Simplify if no solution | 15 min |
| Feature too complex? | Yes | Break into smaller parts OR cut from MVP | Immediate |
| Bug blocking progress? | Yes | Add to known issues, move on | 10 min |
| Performance issue? | Yes | Profile → Optimize OR reduce scope | 30 min |
| Should I refactor? | Ask: Is MVP at risk? | If yes → NO refactor. If no → Quick refactor OK | 5 min |

---

## 11. Emergency Fallbacks

### If FFmpeg is Impossible (Last Resort)
- Use @ffmpeg.wasm (slower but works)
- Limit exports to 720p
- Warn users about slow exports

### If Timeline is Too Hard
- Simplify to list view (vertical clip list)
- Basic drag-reorder only
- Skip visual timeline (not ideal but functional)

### If Recording Won't Work
- Focus on import/edit/export workflow
- Use pre-recorded sample videos
- Document "known limitation: recording on macOS only"

### If You're Behind Schedule
**Tuesday 6 PM Checkpoint:**
- Have: Import, timeline, preview
- Missing: Trim or export
- **Action:** Cut trim, focus on export (can trim in external tool)

**Wednesday 3 PM Checkpoint:**
- Have: MVP + recording
- Missing: Multi-track
- **Action:** Ship single-track only, document as future feature

---

## 12. Success Metrics (Measurable)

### MVP (Tuesday 10:59 PM)
- [ ] Launch app in <3 seconds
- [ ] Import 3 different videos successfully
- [ ] Timeline displays all 3 clips
- [ ] Preview plays correctly
- [ ] Trim adjusts preview (visual feedback)
- [ ] Export completes in <2 minutes
- [ ] Packaged app runs on clean machine

### Final (Wednesday 10:59 PM)
- [ ] Screen recording works (tested on 2 sources)
- [ ] Webcam recording works (tested with camera on/off)
- [ ] Timeline supports 5+ clips without lag
- [ ] Export concatenates multiple clips correctly
- [ ] Multi-track PiP displays overlay
- [ ] Keyboard shortcuts work (play/pause, delete, split)
- [ ] UI is polished (no obvious bugs)

---

## 13. Time Management (Iron Triangle)

You have **48 working hours** (two full days). Allocate:

**30% - Core Infrastructure (14 hours)**
- Electron setup, FFmpeg, IPC, file handling
- Can't skip this, must be solid

**40% - MVP Features (19 hours)**
- Import, timeline, preview, trim, export
- This is your safety net

**20% - Final Features (10 hours)**
- Recording, multi-track, advanced editing
- Scale back if behind

**10% - Polish & Testing (5 hours)**
- Bug fixes, UI improvements, packaging
- Buffer for unexpected issues

### ⚠️ RULE: If any phase runs 20% over budget → Cut scope immediately

---

## 14. Tech Stack Summary (Final Config)

**Package.json:**
```json
{
  "name": "clipforge",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build && electron-builder",
    "preview": "vite preview"
  },
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "fluent-ffmpeg": "^2.1.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "@types/fluent-ffmpeg": "^2.1.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

**electron-builder.yml:**
```yaml
appId: com.yourname.clipforge
productName: ClipForge
directories:
  output: release
files:
  - dist
  - dist-electron
extraResources:
  - from: resources/bin
    to: bin
    filter:
      - ffmpeg
      - ffmpeg.exe
mac:
  target: dmg
  category: public.app-category.video
win:
  target: nsis
linux:
  target: AppImage
```

---

## 15. Final Checklist (Pre-Submission)

### Before MVP Submission (Tuesday)
- [ ] Run `npm run build`
- [ ] Test packaged app on clean VM or second machine
- [ ] Verify FFmpeg bundled correctly
- [ ] Test import → trim → export workflow
- [ ] README.md with setup instructions
- [ ] Git tag: `mvp-submission`

### Before Final Submission (Wednesday)
- [ ] All above +
- [ ] Test recording on 2+ sources
- [ ] Test multi-clip export
- [ ] Test multi-track PiP
- [ ] Record 1-2 minute demo video
- [ ] Update README with all features
- [ ] Git tag: `final-submission`
- [ ] Create GitHub release with packaged binaries

---

## 16. Contact & Resources (Quick Reference)

**Official Docs:**
- Electron: https://electronjs.org/docs
- FFmpeg: https://ffmpeg.org/documentation.html
- React: https://react.dev

**Code Examples:**
- Electron Screen Recording: https://github.com/electron/electron/tree/main/docs/api/desktop-capturer.md
- FFmpeg Trim: https://trac.ffmpeg.org/wiki/Seeking
- MediaRecorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

**When Stuck (15-min rule):**
1. Google: "electron [your problem]"
2. ChatGPT/Claude: Paste error + context
3. Stack Overflow: Search existing answers
4. If no solution → Simplify or move on

---

**Remember: Progress over perfection. Ship working code.**

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Philosophy:** Make fast decisions, minimize regret, ship features
