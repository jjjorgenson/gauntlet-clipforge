# Building ClipForge

This guide explains how to build ClipForge for distribution.

## Prerequisites

1. **Node.js** (v18 or later)
2. **FFmpeg binaries** in `resources/bin/`
   - Download from: https://www.gyan.dev/ffmpeg/builds/
   - Extract `ffmpeg.exe` and `ffprobe.exe` to `resources/bin/`
   - See `resources/bin/README.md` for details

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify FFmpeg Binaries

Ensure these files exist:
```
resources/
  └── bin/
      ├── ffmpeg.exe   (~185 MB)
      ├── ffprobe.exe  (~185 MB)
      └── README.md
```

### 3. Build the Application

```bash
npm run electron:build
```

This will:
1. Compile TypeScript renderer code → `dist/`
2. Compile TypeScript main process → `dist-electron/`
3. Run electron-builder to create installer

### 4. Find the Output

The installer will be in:
```
release/
  └── ClipForge Setup 1.0.0.exe  (~300 MB)
```

## Build Output

- **Unpacked**: `release/win-unpacked/` - Full application folder
- **Installer**: `release/ClipForge Setup 1.0.0.exe` - NSIS installer

## Testing the Build

### Test Unpacked App

```bash
cd release/win-unpacked
ClipForge.exe
```

### Verify FFmpeg Bundling

1. Run the built app
2. Open DevTools (Ctrl+Shift+I)
3. Check console for:
   ```
   ✅ FFmpeg binary found: [path]
   ✅ FFprobe binary found: [path]
   ✅ FFmpeg Manager initialized successfully
   ```

Expected paths in production:
```
C:\Users\[USER]\AppData\Local\Programs\ClipForge\resources\resources\bin\ffmpeg.exe
C:\Users\[USER]\AppData\Local\Programs\ClipForge\resources\resources\bin\ffprobe.exe
```

## Troubleshooting

### FFmpeg Not Found in Build

**Problem**: "⚠️ No FFmpeg found, using mock mode"

**Solutions**:
1. Verify `resources/bin/ffmpeg.exe` exists before build
2. Check `electron-builder.yml` has:
   ```yaml
   extraResources:
     - from: resources/bin
       to: resources/bin
   ```
3. Ensure FFmpeg files are NOT in `.gitignore` locally

### Build Fails with "ENOENT"

**Problem**: Build can't find files

**Solution**: Run from project root, ensure all paths are correct

### Large Installer Size

**Expected**: ~300 MB installer (FFmpeg binaries are ~370 MB)

This is normal. FFmpeg is required for video processing.

## Platform-Specific Builds

### Windows (Current)

```bash
npm run electron:build
```

### macOS (Future)

```bash
npm run electron:build -- --mac
```

Requires macOS machine with:
- Xcode Command Line Tools
- FFmpeg via Homebrew

### Linux (Future)

```bash
npm run electron:build -- --linux
```

Requires:
- FFmpeg installed system-wide
- Or bundled Linux binaries

## Clean Build

```bash
# Remove old build artifacts
rm -rf dist dist-electron release

# Fresh build
npm run electron:build
```

## Development Build

For testing without full installer:

```bash
npm run electron:dev
```

This runs from source with hot reload.

## Release Checklist

Before building a release:

- [ ] FFmpeg binaries in `resources/bin/`
- [ ] Version updated in `package.json`
- [ ] All tests pass
- [ ] No console errors
- [ ] Import video works
- [ ] Export video works
- [ ] Trim feature works
- [ ] Timeline works
- [ ] Clean `git status`

## Signing (Future)

For production releases, sign the installer:

1. Obtain code signing certificate
2. Set environment variables:
   ```
   CSC_LINK=path/to/certificate.p12
   CSC_KEY_PASSWORD=your_password
   ```
3. Build normally - electron-builder will sign automatically

## Auto-Updates (Future)

Configure in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: jjjorgenson
  repo: gauntlet-clipforge
```

Requires GitHub token for automated releases.

