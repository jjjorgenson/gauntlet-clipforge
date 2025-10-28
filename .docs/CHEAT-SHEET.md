# ClipForge Development Cheat Sheet
## One-Page Quick Reference

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         WHERE AM I? WHAT DO I DO?                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCATION: PowerShell (Windows Terminal)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHEN: Setting up project, installing packages, git operations              │
│                                                                             │
│ COMMANDS:                                                                   │
│   cd C:\Projects\clipforge              Navigate to project                │
│   npx bmad-method install               Install BMAD (one time)            │
│   npm install package-name              Install dependencies               │
│   npm run dev                           Start development server           │
│   git add . && git commit -m "msg"      Save changes                       │
│   cursor .                              Open Cursor IDE                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCATION: Cursor IDE → AI Chat Panel (Ctrl+L)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHEN: Planning features, generating code, getting AI help                  │
│                                                                             │
│ AGENT SELECTOR (dropdown at top):                                          │
│   bmad-pm         → Create epics, plan features                            │
│   bmad-architect  → Design system architecture                             │
│   bmad-sm         → Write user stories                                     │
│   bmad-dev        → Generate code, implement features                      │
│   bmad-qa         → Review code, find bugs                                 │
│                                                                             │
│ EXAMPLE PROMPTS:                                                            │
│   [bmad-pm] "Create Epic 1 from the PRD: Video Import"                     │
│   [bmad-architect] "Design FFmpeg integration architecture"                │
│   [bmad-sm] "Draft story: Drag and drop video files"                       │
│   [bmad-dev] "Implement MediaService.ts with FFmpeg"                       │
│   [bmad-qa] "Review TimelineCanvas.tsx for performance issues"             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCATION: Cursor IDE → Code Editor                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHEN: Writing/editing code manually                                        │
│                                                                             │
│ SHORTCUTS:                                                                  │
│   Ctrl+P              Quick open file                                      │
│   Ctrl+Shift+P        Command palette                                      │
│   Ctrl+L              Open AI chat                                         │
│   Ctrl+`              Open terminal                                        │
│   Ctrl+\              Split editor                                         │
│   Ctrl+B              Toggle sidebar                                       │
│   Ctrl+F              Find in file                                         │
│   Ctrl+Shift+F        Find in project                                      │
│                                                                             │
│ AI INLINE:                                                                  │
│   Ctrl+K              AI inline edit (select code first)                   │
│   // Type comment, then Tab → AI completes code                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCATION: Cursor IDE → Integrated Terminal (Ctrl+`)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ WHEN: Running commands without leaving Cursor                              │
│                                                                             │
│ SAME AS POWERSHELL:                                                         │
│   npm run dev                           Start dev server                   │
│   npm run build                         Build production                   │
│   git status                            Check git status                   │
│   ffmpeg -version                       Check FFmpeg                       │
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                            BMAD WORKFLOW FLOW                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

1. [PM Agent] Create Epic
   ↓
2. [Architect Agent] Design Architecture
   ↓
3. [SM Agent] Write User Stories
   ↓
4. [Dev Agent] Implement Code
   ↓
5. [QA Agent] Review & Test
   ↓
6. Commit → Push → Repeat

╔══════════════════════════════════════════════════════════════════════════════╗
║                         DECISION TREE: I'M STUCK!                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Problem? → Where are you?

├─ IN POWERSHELL/TERMINAL
│  ├─ Command not found?
│  │  └─→ Check if tool installed: node --version, ffmpeg -version
│  ├─ Permission denied?
│  │  └─→ Run PowerShell as Administrator (Win+X)
│  └─ Package install fails?
│     └─→ npm cache clean --force, then npm install
│
├─ IN CURSOR AI CHAT
│  ├─ Agent not responding?
│  │  └─→ Check agent selected in dropdown, try restarting Cursor
│  ├─ Code doesn't work?
│  │  └─→ Ask agent: "Debug this code: [paste error]"
│  └─ Need different perspective?
│     └─→ Switch to different agent (e.g., Dev → QA)
│
└─ IN CODE EDITOR
   ├─ TypeScript error?
   │  └─→ Hover over red squiggle, read error, ask AI for fix
   ├─ Don't know what to code?
   │  └─→ Open AI chat, ask Dev agent: "What should I implement next?"
   └─ Performance issue?
      └─→ Open Technical Decisions doc, search for solution

╔══════════════════════════════════════════════════════════════════════════════╗
║                           TIME CHECKPOINTS                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

EVERY 2 HOURS:
  □ Commit code:     git add . && git commit -m "progress: [what you did]"
  □ Push to GitHub:  git push
  □ Check time budget: Am I on track? If >20% over, CUT SCOPE!

EVERY 6 HOURS:
  □ Review Strategic Plan
  □ Test build:      npm run build
  □ Rest: 30 min break (eat, walk, sleep if needed)

TUESDAY 6 PM (Critical Checkpoint):
  □ MVP features working?
  □ If behind → Cut features, focus on core: import, timeline, export
  □ If ahead → Start Final features: recording

TUESDAY 10:59 PM (MVP DEADLINE):
  □ Build native app:  npm run package
  □ Test on clean machine
  □ Submit!

WEDNESDAY 10:59 PM (FINAL DEADLINE):
  □ All features complete?
  □ Demo video recorded?
  □ Submit!

╔══════════════════════════════════════════════════════════════════════════════╗
║                        EMERGENCY CONTACTS                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

DOCS TO CHECK WHEN STUCK:
  1. ClipForge-Technical-Decisions.md   (Ctrl+P → type filename)
  2. ClipForge-Strategic-Plan.md
  3. ClipForge-Video-Editor-PRD.md

EXTERNAL RESOURCES:
  • Electron Docs:  https://electronjs.org/docs
  • FFmpeg Guide:   https://ffmpeg.org/documentation.html
  • React Docs:     https://react.dev

AI HELP (In Cursor):
  • Stuck >15 min? → Ask AI: "I'm stuck on [problem]. What should I try?"
  • Need explanation? → Ask AI: "Explain how [concept] works in simple terms"
  • Code not working? → Ask AI: "Debug this: [paste code + error]"

╔══════════════════════════════════════════════════════════════════════════════╗
║                          PROJECT STRUCTURE                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

C:\Projects\clipforge\
├── docs/                           ← Your planning docs
│   ├── ClipForge-Video-Editor-PRD.md
│   ├── ClipForge-Technical-Decisions.md
│   └── ClipForge-Strategic-Plan.md
├── src/
│   ├── main/                       ← Electron main process (Node.js)
│   │   ├── main.ts
│   │   ├── ipc/                    ← IPC handlers
│   │   └── services/               ← FFmpeg, Recording, Export
│   └── renderer/                   ← Frontend (React)
│       ├── App.tsx
│       ├── components/             ← UI components
│       ├── store/                  ← Zustand state
│       └── types/                  ← TypeScript types
├── resources/
│   └── bin/                        ← FFmpeg binaries (bundle these!)
│       ├── ffmpeg.exe
│       └── ffprobe.exe
├── .bmad-core/                     ← BMAD framework
│   ├── agents/
│   ├── tasks/
│   └── templates/
├── .cursor/
│   └── rules/
│       └── bmad/                   ← BMAD agent rules
│           ├── pm.mdc
│           ├── architect.mdc
│           ├── sm.mdc
│           ├── dev.mdc
│           └── qa.mdc
├── package.json
├── electron-builder.yml
└── tsconfig.json

╔══════════════════════════════════════════════════════════════════════════════╗
║                     MOST USED COMMANDS (COPY-PASTE)                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

# START DEVELOPMENT
cd C:\Projects\clipforge
npm run dev

# INSTALL NEW PACKAGE
npm install package-name

# SAVE PROGRESS
git add .
git commit -m "feat: implement [feature]"
git push

# BUILD FOR TESTING
npm run build

# PACKAGE NATIVE APP
npm run package

# CHECK TOOLS
node --version
npm --version
ffmpeg -version

# OPEN CURSOR
cursor .

# CLEAN RESTART (if things break)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev

╔══════════════════════════════════════════════════════════════════════════════╗
║                         MANTRAS (READ WHEN STRESSED)                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

□ Progress over perfection
□ Ship working code, polish later
□ If stuck >15 min → ask AI or simplify
□ Commit every 2 hours (minimum)
□ Test early, test often
□ If behind schedule → CUT SCOPE, don't rush
□ MVP is a checkpoint, not throwaway
□ You've got this! 💪

╔══════════════════════════════════════════════════════════════════════════════╗
║                           FINAL SUBMISSION CHECKLIST                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

MVP (Tuesday 10:59 PM):
  □ App launches
  □ Video import works
  □ Timeline displays clips
  □ Preview plays video
  □ Trim functionality works
  □ Export to MP4 succeeds
  □ Native app builds

Final (Wednesday 10:59 PM):
  □ All MVP features +
  □ Screen recording
  □ Webcam recording
  □ Multi-clip timeline
  □ Split/delete clips
  □ Multi-track (PiP)
  □ Demo video recorded
  □ README updated

BUILD COMMAND:
  npm run package

TEST ON CLEAN MACHINE:
  Copy .exe from release/ folder
  Run on different computer
  Verify all features work

SUBMIT:
  □ Upload to submission platform
  □ Include demo video
  □ Include README.md
  □ Git tag: final-submission

═══════════════════════════════════════════════════════════════════════════════
                            YOU'RE READY. GO BUILD! 🚀
═══════════════════════════════════════════════════════════════════════════════
