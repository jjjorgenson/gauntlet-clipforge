# FFmpeg Binaries

This directory should contain FFmpeg binaries for video processing.

## Required Files

- `ffmpeg.exe` (Windows)
- `ffprobe.exe` (Windows)

## Download Instructions

### Windows

1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
   - Choose: `ffmpeg-release-essentials.zip`
   - Current version: 7.0 or later

2. Extract the archive

3. Copy these files to this directory:
   - `ffmpeg-X.X-essentials_build/bin/ffmpeg.exe`
   - `ffmpeg-X.X-essentials_build/bin/ffprobe.exe`

### macOS

```bash
brew install ffmpeg
# Binaries will be in /usr/local/bin or /opt/homebrew/bin
```

### Linux

```bash
sudo apt install ffmpeg  # Ubuntu/Debian
sudo dnf install ffmpeg  # Fedora
sudo pacman -S ffmpeg    # Arch
```

## File Sizes

- `ffmpeg.exe`: ~185 MB
- `ffprobe.exe`: ~185 MB

**Note:** These files are NOT committed to git due to size. They are bundled during the build process from your local `resources/bin` folder.

## Verification

The application will check for these binaries on startup. If not found, it will run in mock mode with limited functionality.

Check console for:
```
✅ FFmpeg binary found: [path]
✅ FFprobe binary found: [path]
✅ FFmpeg Manager initialized successfully
```

