# Custom Protocol Implementation - `media://`

## Overview

ClipForge uses a secure custom protocol (`media://`) to load local video files in the Electron renderer process. This approach maintains full web security while allowing controlled access to user video files.

## Why Custom Protocol?

### ✅ Advantages

1. **Security**: Keeps Chromium's `webSecurity` enabled - no blanket local file access
2. **Control**: Can restrict access to project folders or validate paths
3. **Cross-platform**: Works identically on Windows, macOS, and Linux
4. **Packaging-safe**: Functions correctly in ASAR archives and signed installers
5. **Future-proof**: Standard Electron pattern for local file access
6. **No CSP issues**: Bypasses Content Security Policy restrictions safely

### ❌ Alternative Approaches (Not Used)

- ❌ **`file://` protocol**: Blocked by CORS and CSP
- ❌ **Disabling `webSecurity`**: Security vulnerability, allows any file access
- ❌ **`allowFileAccessFromFileURLs`**: Still has security issues
- ❌ **Base64 encoding**: Memory intensive for large video files

## Implementation Details

### 1. Protocol Registration (Main Process)

**File**: `src/main/main.ts`

```typescript
// Register protocol BEFORE app.whenReady()
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      standard: true,      // Treat like http/https
      secure: true,        // HTTPS-like security
      supportFetchAPI: true, // Allow fetch() API
      corsEnabled: true,   // Enable CORS
      stream: true,        // Support streaming
      bypassCSP: true      // Bypass CSP safely
    }
  }
]);
```

### 2. Protocol Handler (Main Process)

The handler:
- ✅ Validates absolute paths only (security)
- ✅ Checks file existence
- ✅ Maps file extensions to correct MIME types
- ✅ Supports HTTP byte-range requests (critical for video seeking)
- ✅ Streams files efficiently (no memory loading)

**Key Features**:

```typescript
protocol.registerStreamProtocol('media', (request, callback) => {
  // Parse URL: media:///C:/path/to/video.mp4
  let filePath = request.url.slice('media:///'.length);
  filePath = decodeURIComponent(filePath);
  
  // Security validation
  if (!pathModule.isAbsolute(filePath)) {
    callback({ statusCode: 403 }); // Reject relative paths
    return;
  }
  
  // Handle byte-range requests (for seeking)
  const rangeHeader = request.headers['Range'];
  if (rangeHeader) {
    // Return partial content (HTTP 206)
    // Critical for video scrubbing/seeking
  }
  
  // Stream file efficiently
  const stream = fs.createReadStream(filePath, { start, end });
  callback({
    statusCode: 206, // or 200
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes'
    },
    data: stream
  });
});
```

### 3. Usage in Renderer (VideoPlayer Component)

**File**: `src/renderer/components/preview/VideoPlayer.tsx`

```tsx
// Convert file path to custom protocol URL
const mediaUrl = `media:///${encodeURIComponent(clip.sourceFile)}`;

return (
  <video
    src={mediaUrl}
    // ... other props
  />
);
```

**Example URLs**:
- Windows: `media:///C%3A%5CUsers%5Cuser%5CVideos%5Cvideo.mp4`
- macOS: `media:///Users%2Fuser%2FVideos%2Fvideo.mp4`
- Linux: `media:///home%2Fuser%2Fvideos%2Fvideo.mp4`

## Byte-Range Support

Video seeking requires HTTP 206 (Partial Content) responses. The protocol handler:

1. **Parses Range header**: `Range: bytes=1024-2047`
2. **Creates stream with offset**: `fs.createReadStream(path, { start: 1024, end: 2047 })`
3. **Returns 206 response**: With `Content-Range` header

This allows the browser to:
- Load video metadata without downloading the entire file
- Seek to any position instantly
- Buffer efficiently

## Security Considerations

### ✅ Implemented Safeguards

1. **Absolute path validation**: Rejects relative paths (prevents directory traversal)
2. **File existence check**: Returns 404 for missing files
3. **No directory listing**: Only serves individual files
4. **MIME type whitelist**: Only video formats mapped
5. **webSecurity enabled**: All other web security features active

### 🔒 Future Enhancements (Optional)

- [ ] Restrict to project/media library folders only
- [ ] Add file hash verification
- [ ] Implement virtual path mapping
- [ ] Add access logging/auditing
- [ ] Rate limiting per file

## Supported Video Formats

| Extension | MIME Type           |
|-----------|---------------------|
| `.mp4`    | `video/mp4`         |
| `.webm`   | `video/webm`        |
| `.mkv`    | `video/x-matroska`  |
| `.avi`    | `video/x-msvideo`   |
| `.mov`    | `video/quicktime`   |
| `.m4v`    | `video/mp4`         |
| `.flv`    | `video/x-flv`       |
| `.wmv`    | `video/x-ms-wmv`    |

## Debugging

### Console Logs (Main Process)

```
🎬 Media protocol request: {
  originalUrl: 'media:///C%3A%5CUsers%5C...',
  decodedPath: 'C:\Users\...\video.mp4'
}
🎬 Range request: { start: 0, end: 65535, chunkSize: 65536, fileSize: 8126678 }
✅ Streaming: video.mp4
```

### Console Logs (Renderer Process)

```
🎬 VideoPlayer render: {
  sourceFile: 'C:\Users\...\video.mp4',
  mediaUrl: 'media:///C%3A%5CUsers%5C...',
  currentTime: 0,
  isPlaying: false
}
🎬 Video load started: media:///C%3A%5CUsers%5C...
🎬 Video metadata loaded: { duration: 30, readyState: 1 }
🎬 Video can play: { readyState: 4 }
```

## Troubleshooting

### ❌ "net::ERR_UNKNOWN_URL_SCHEME"
- **Cause**: Protocol not registered before `app.whenReady()`
- **Fix**: Move `registerSchemesAsPrivileged` to top of `initializeApp()`

### ❌ "Failed to load resource: net::ERR_FILE_NOT_FOUND"
- **Cause**: Path encoding issue or wrong path format
- **Fix**: Use `encodeURIComponent()` for the entire path

### ❌ Video loads but can't seek
- **Cause**: Missing byte-range support
- **Fix**: Implement HTTP 206 responses with `Content-Range` header

### ❌ "MEDIA_ELEMENT_ERROR: Format error"
- **Cause**: Wrong MIME type or unsupported codec
- **Fix**: Check MIME type mapping and ensure video codec is browser-supported

## References

- [Electron Protocol API](https://www.electronjs.org/docs/latest/api/protocol)
- [registerStreamProtocol](https://www.electronjs.org/docs/latest/api/protocol#protocolregisterstreamprotocolscheme-handler)
- [HTTP Range Requests (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)

---

**Status**: ✅ Fully implemented and tested
**Last Updated**: October 28, 2025

