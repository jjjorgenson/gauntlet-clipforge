# ClipForge Modular Architecture - Master Index

**Version:** 1.0  
**Date:** October 27, 2025  
**Architect:** Winston (BMAD)  
**Purpose:** Enable parallel development by 14 independent agents

---

## 📚 Documentation Structure

This modular architecture consists of 4 core documents:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **This File** | Master index & quick reference | Start here |
| [ClipForge-Architecture.md](ClipForge-Architecture.md) | Full technical architecture | Deep technical understanding |
| [ClipForge-Modular-Architecture.md](ClipForge-Modular-Architecture.md) | Contract specifications | Contract definitions |
| [Development-Tracks-Summary.md](Development-Tracks-Summary.md) | Track assignments | Daily work reference |
| [Contract-Files-To-Create.md](Contract-Files-To-Create.md) | Implementation steps | Creating contract files |

---

## 🎯 Quick Start Guide

### For the Architect (Winston)

**Day 0 Tasks:**
1. ✅ Review all epics (DONE)
2. ✅ Create architecture documents (DONE)
3. ⏳ Create contract TypeScript files
4. ⏳ Validate TypeScript compilation
5. ⏳ Commit contracts to main branch

**Commands:**
```bash
# Create contract files (follow Contract-Files-To-Create.md)
mkdir -p src/shared/contracts src/shared/types

# Validate after creating files
npx tsc --noEmit

# Commit
git add src/shared/
git commit -m "feat: add modular architecture contracts"
git push origin main
```

---

### For Development Agents

**Getting Started:**

1. **Find your track** → [Development-Tracks-Summary.md](Development-Tracks-Summary.md)
2. **Check dependencies** → Can you start now? Or wait for another track?
3. **Clone repo & checkout branch**
   ```bash
   git clone <repo-url>
   git checkout -b feature/track-X-your-track-name
   ```
4. **Import contracts (read-only)**
   ```typescript
   import { YourContract } from '@contracts/...';
   ```
5. **Implement your files**
6. **Submit PR when done**

---

## 🏗️ Architecture Overview

### Modular Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                  Shared Contracts Layer                      │
│  (Read-Only for All Modules, Modify via PR Only)            │
│                                                              │
│  src/shared/contracts/                                       │
│  ├── ipc.ts           ← IPC message contracts                │
│  ├── stores.ts        ← Zustand store interfaces             │
│  ├── components.ts    ← React component props                │
│  └── services.ts      ← Main process services                │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ (imports from)
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼──────────┐                    ┌───────────▼─────────┐
│  Main Process    │                    │  Renderer Process   │
│  (Node.js)       │                    │  (Chromium + React) │
├──────────────────┤                    ├─────────────────────┤
│ Track 1: Core    │◄──────IPC─────────▶│ Track 6: Stores     │
│ Track 2: Media   │                    │ Track 7: Layout     │
│ Track 3: Record  │                    │ Track 8: Media UI   │
│ Track 4: Export  │                    │ Track 9: Timeline   │
│ Track 5: Project │                    │ Track 10: Preview   │
│                  │                    │ Track 11: Record UI │
│                  │                    │ Track 12: Export UI │
│                  │                    │ Track 13: Common UI │
│                  │                    │ Track 14: Hooks     │
└──────────────────┘                    └─────────────────────┘
```

---

## 📋 Development Tracks (Summary)

### 🚀 Can Start Immediately (No Dependencies)
- **Track 1:** Main Process Core
- **Track 6:** Store Architecture  
- **Track 13:** Common Components

### ⏳ Requires Track 1 Complete
- **Track 2:** Media Service
- **Track 3:** Recording Service
- **Track 5:** Project Service

### ⏳ Requires Track 6 Complete
- **Track 7:** Layout Components
- **Track 8:** Media Library UI
- **Track 9:** Timeline UI (most complex)
- **Track 10:** Video Preview UI
- **Track 11:** Recording UI
- **Track 12:** Export UI
- **Track 14:** Custom Hooks

### ⏳ Requires Track 2 Complete
- **Track 4:** Export Service

---

## 🎨 Contract Philosophy

### The Golden Rules

1. **Contracts are sacred** - Never modify without team PR approval
2. **Own your files** - Only edit files assigned to your track
3. **Import contracts only** - Never import from other modules
4. **Types, not implementations** - Contracts define shapes, not behavior

### Example: The Right Way

```typescript
// ✅ CORRECT: Import from contracts
import { MediaIPC } from '@contracts/ipc';
import { IMediaService } from '@contracts/services';

export class MediaService implements IMediaService {
  async getMetadata(filePath: string): Promise<VideoMetadata> {
    // Your implementation
  }
}
```

### Example: The Wrong Way

```typescript
// ❌ WRONG: Importing from another module
import { RecordingService } from '../services/RecordingService';

// ❌ WRONG: Modifying contract in your module
export interface MediaIPC {
  myNewMethod: () => void; // NO! Modify contracts via PR only
}
```

---

## 📊 Progress Tracking

### Daily Standup Format

Post in team chat:

```
Agent: [Your Agent Name]
Track: [Track Number & Name]
Status: [Not Started | In Progress | Ready for Integration | Complete]
Progress: [X]%
Blockers: [None | Waiting on Track Y | Need clarification on Z]
Files Completed: [X/Y]
Next: [What you're working on next]
ETA: [When you'll be done]
```

### Track Status Board

| Track | Agent | Status | Progress | ETA |
|-------|-------|--------|----------|-----|
| 1 | Main-Core-Dev | Not Started | 0% | - |
| 2 | Media-Service-Dev | Not Started | 0% | - |
| 3 | Recording-Service-Dev | Not Started | 0% | - |
| 4 | Export-Service-Dev | Not Started | 0% | - |
| 5 | Project-Service-Dev | Not Started | 0% | - |
| 6 | Store-Dev | Not Started | 0% | - |
| 7 | Layout-UI-Dev | Not Started | 0% | - |
| 8 | Media-UI-Dev | Not Started | 0% | - |
| 9 | Timeline-UI-Dev | Not Started | 0% | - |
| 10 | Preview-UI-Dev | Not Started | 0% | - |
| 11 | Recording-UI-Dev | Not Started | 0% | - |
| 12 | Export-UI-Dev | Not Started | 0% | - |
| 13 | Common-UI-Dev | Not Started | 0% | - |
| 14 | Hooks-Dev | Not Started | 0% | - |

---

## 🔗 Integration Schedule

### Day 1 Evening (5 PM CT)
**Integration Point:** Foundation
- ✅ Track 1 (Main Core) complete
- ✅ Track 6 (Stores) complete
- ✅ Track 13 (Common UI) complete
- ✅ App launches with empty UI

**Test:**
```bash
npm run dev
# Window opens, no errors
```

---

### Day 2 Morning (10 AM CT)
**Integration Point:** Media Import
- ✅ Track 2 (Media Service) complete
- ✅ Track 8 (Media Library UI) complete

**Test:**
- Click Import button
- Select video file
- File appears in media library with thumbnail

---

### Day 2 Afternoon (2 PM CT)
**Integration Point:** Timeline
- ✅ Track 9 (Timeline UI) complete
- ✅ Track 7 (Layout) complete

**Test:**
- Drag clip from media library to timeline
- Clip appears on timeline
- Timeline renders correctly

---

### Day 2 Evening (5 PM CT)
**Integration Point:** Playback
- ✅ Track 10 (Preview UI) complete
- ✅ Track 14 (Hooks) complete

**Test:**
- Click clip on timeline
- Video loads in preview
- Play button works
- Playhead syncs with timeline

---

### Day 3 Morning (10 AM CT)
**Integration Point:** Recording
- ✅ Track 3 (Recording Service) complete
- ✅ Track 11 (Recording UI) complete

**Test:**
- Open record dialog
- Select screen source
- Start recording → Countdown → Capture
- Stop recording → File saved and imported

---

### Day 3 Afternoon (2 PM CT)
**Integration Point:** Export
- ✅ Track 4 (Export Service) complete
- ✅ Track 12 (Export UI) complete
- ✅ Track 5 (Project Service) complete

**Test:**
- Add multiple clips to timeline
- Click Export
- Configure settings
- Export completes successfully
- Exported file plays in VLC

---

## 🧪 Testing Strategy

### Unit Tests (Each Track)
Test your module in isolation using mock contracts.

```typescript
import { createMockIpcAPI } from '@contracts/testing';

test('MediaService.getMetadata', async () => {
  const mockAPI = createMockIpcAPI();
  mockAPI.media.getMetadata.mockResolvedValue({
    duration: 60,
    resolution: { width: 1920, height: 1080 },
    // ...
  });

  // Test your code
});
```

### Integration Tests (Team)
Test multiple tracks working together.

```typescript
test('Import → Timeline → Preview workflow', async () => {
  // Import video
  const clips = await window.api.media.import({ filePaths: ['/test.mp4'] });

  // Add to timeline
  const { addClip } = useTimelineStore.getState();
  addClip(clips[0], 'track-1', 0);

  // Verify preview loads
  const { currentClip } = usePlaybackStore.getState();
  expect(currentClip?.id).toBe(clips[0].id);
});
```

---

## 🚨 Common Pitfalls

### ❌ Pitfall 1: Modifying Contracts Without PR
**Problem:** You need a new IPC method, so you add it directly.  
**Solution:** Submit PR to architect, get approval, then all tracks pull latest.

### ❌ Pitfall 2: Importing from Other Modules
**Problem:** You need a function from another service.  
**Solution:** Define interface in contracts, import interface, not implementation.

### ❌ Pitfall 3: Editing Files Outside Your Track
**Problem:** You see a bug in another track's file.  
**Solution:** File an issue, notify that track's agent. Don't fix it yourself.

### ❌ Pitfall 4: Blocking on Dependencies
**Problem:** Your track depends on Track X, but Track X isn't done.  
**Solution:** Use mock contracts, develop against interface, integrate when Track X completes.

---

## 📞 Getting Help

### Questions About Contracts
**Contact:** Winston (Architect)  
**Channel:** `#architecture`

### Questions About Your Track
**Contact:** Check [Development-Tracks-Summary.md](Development-Tracks-Summary.md) for details  
**Channel:** `#dev-track-X`

### Integration Issues
**Contact:** Integration Team  
**Channel:** `#integration`

### Merge Conflicts
**Contact:** DevOps  
**Channel:** `#devops`

---

## ✅ Definition of Done (Per Track)

Before marking your track complete:

- [ ] All files in track created and implemented
- [ ] Implements contract interfaces correctly
- [ ] TypeScript compiles with zero errors
- [ ] No ESLint warnings
- [ ] Unit tests written and passing
- [ ] Manual testing completed
- [ ] Documentation comments added
- [ ] PR submitted with clear description
- [ ] No files outside your track modified
- [ ] Code reviewed by architect
- [ ] Merged to develop branch

---

## 🎯 Success Metrics

### MVP Checkpoint (Tuesday 10:59 PM)
**Must Be Complete:**
- Tracks 1, 2, 6, 7, 8, 9, 10, 13
- User can: Import → Timeline → Trim → Preview → Export

### Final Checkpoint (Wednesday 10:59 PM)
**Must Be Complete:**
- All 14 tracks
- User can: Record → Import → Edit → Export
- Multi-track PiP working

---

## 📈 Risk Mitigation

### If a Track is Blocked
1. Agent notifies team immediately
2. Architect reviews blocker
3. Options:
   - Reassign resources
   - Simplify scope
   - Use temporary mocks
   - Pair programming

### If Integration Fails
1. Isolate which tracks are incompatible
2. Review contract interfaces
3. Fix in separate PR
4. Re-test integration

### If Timeline Slips
1. Prioritize P0 features only
2. Cut P1/P2 features
3. Focus on MVP quality
4. Document known limitations

---

## 🚀 Launch Checklist

Before final submission:

- [ ] All 14 tracks complete
- [ ] Integration tests passing
- [ ] End-to-end testing complete
- [ ] Packaging tested (DMG/EXE/AppImage)
- [ ] Performance metrics within targets (<3s startup, <200MB memory)
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Demo video recorded
- [ ] Release notes written
- [ ] Git tagged (v1.0.0)

---

**This architecture enables 14 agents to work in parallel without conflicts. Follow the contracts, trust the system, ship fast. 🚀**

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Architect:** Winston (BMAD)  
**Status:** Ready for Development

**Quick Links:**
- [Full Architecture](ClipForge-Architecture.md)
- [Contract Specs](ClipForge-Modular-Architecture.md)
- [Track Assignments](Development-Tracks-Summary.md)
- [Implementation Guide](Contract-Files-To-Create.md)
- [Original PRD](ClipForge-Video-Editor-PRD.md)

