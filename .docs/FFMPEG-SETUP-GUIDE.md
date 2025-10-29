# FFmpeg Setup Guide for ClipForge

## 🔍 Current Issue

ClipForge is running in **mock mode** because FFmpeg binaries are not installed:

```
⚠️ No FFmpeg found, using mock mode for testing
```

**This means:**
- ❌ No real thumbnail generation (shows placeholder)
- ❌ No real video processing
- ❌ Video preview won't work with actual files

---

## ✅ Solution: Install FFmpeg Binaries

### Option 1: System FFmpeg (Quick for Development)

**Windows (using Chocolatey):**
```powershell
# If you don't have Chocolatey, install it first:
# https://chocolatey.org/install

choco install ffmpeg -y
```

**Windows (Manual Download):**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Choose "ffmpeg-release-essentials.zip"
3. Extract to `C:\ffmpeg`
4. Add to PATH:
   - Open System Properties → Environment Variables
   - Edit "Path" variable
   - Add: `C:\ffmpeg\bin`
5. Restart terminal and verify:
   ```powershell
   ffmpeg -version
   ffprobe -version
   ```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

---

### Option 2: Bundle FFmpeg with App (For Production)

1. **Download static FFmpeg binaries:**
   - Windows: https://www.gyan.dev/ffmpeg/builds/
   - macOS: https://evermeet.cx/ffmpeg/
   - Linux: https://johnvansickle.com/ffmpeg/

2. **Extract and place binaries:**
   ```
   clipforge/
   └── resources/
       └── bin/
           ├── ffmpeg.exe      (Windows)
           ├── ffprobe.exe     (Windows)
           ├── ffmpeg          (macOS/Linux)
           └── ffprobe         (macOS/Linux)
   ```

3. **Verify files exist:**
   ```powershell
   # Windows
   dir resources\bin\
   
   # macOS/Linux
   ls -la resources/bin/
   ```

---

## 🔧 How ClipForge Finds FFmpeg

The `FFmpegManager` looks for binaries in this order:

1. **Development mode:**
   - First: `resources/bin/ffmpeg.exe`
   - Fallback: System FFmpeg (`ffmpeg.exe` in PATH)
   - Last resort: Mock mode

2. **Production mode (packaged app):**
   - Bundled binaries in `app.asar.unpacked/resources/bin/`

---

## ✅ Verification

After installing FFmpeg, restart the app:

```bash
npm run electron:dev
```

**Look for these success messages:**
```
✅ FFmpeg binary found: C:\path\to\ffmpeg.exe
✅ FFprobe binary found: C:\path\to\ffprobe.exe
✅ FFmpeg Manager initialized successfully
```

**You should now see:**
- ✅ Real thumbnails generated for imported videos
- ✅ Video preview working
- ✅ No more "Using mock" warnings

---

## 🐛 Troubleshooting

### "Binary not found" Error

**Check if FFmpeg is in PATH:**
```powershell
ffmpeg -version
```

If this fails, FFmpeg is not installed or not in PATH.

### "Binary not executable" (macOS/Linux)

```bash
chmod +x resources/bin/ffmpeg
chmod +x resources/bin/ffprobe
```

### Still Using Mock Mode?

1. Check terminal output for specific error messages
2. Verify file paths match exactly
3. Try absolute path test:
   ```powershell
   # Windows
   C:\ffmpeg\bin\ffmpeg.exe -version
   
   # macOS/Linux
   /usr/local/bin/ffmpeg -version
   ```

---

## 📦 For Distribution

Update `electron-builder.yml` to bundle FFmpeg:

```yaml
extraResources:
  - from: resources/bin/
    to: bin
    filter:
      - ffmpeg*
      - ffprobe*
```

This ensures the final `.exe` or `.app` includes FFmpeg binaries.

---

## 🎯 Quick Start (Recommended)

**For immediate testing, use System FFmpeg:**

```powershell
# 1. Install (Windows with Chocolatey)
choco install ffmpeg -y

# 2. Close and reopen terminal

# 3. Verify installation
ffmpeg -version

# 4. Restart ClipForge
npm run electron:dev

# 5. Check for success messages (no more ⚠️ warnings)
```

**Expected output:**
```
✅ Using system FFmpeg: ffmpeg.exe
✅ Using system FFprobe: ffprobe.exe
```

---

## 🚀 Next Steps

Once FFmpeg is installed:
1. Import a video → Should see real thumbnail
2. Drag to timeline → Should see video preview
3. Check DevTools console for any remaining errors

The video preview and thumbnail issues should be **completely resolved**! 🎉

