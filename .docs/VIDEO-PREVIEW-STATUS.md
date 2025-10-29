# Video Preview Status - Critical Issue

## 🚨 Current Problem

**Video preview is NOT working** due to Electron security restrictions blocking custom protocol video loading.

### Error Message
```
MEDIA_ELEMENT_ERROR: Media load rejected by URL safety check
Error Code: 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
```

---

## ✅ What IS Working

1. ✅ FFmpeg binary found and initialized
2. ✅ Real thumbnails generated (not mock)
3. ✅ Video imports successfully
4. ✅ Clips can be dragged to timeline
5. ✅ Clips can be moved on timeline
6. ✅ Tracks can be added/removed
7. ✅ Clips can be selected/deleted
8. ✅ Custom protocol registered (`media-file:///`)
9. ✅ Protocol handler code executes
10. ✅ Video element receives correct URL

---

## ❌ What Is NOT Working

**Video preview refuses to load local files** even with:
- ✅ Custom protocol registered (`registerStreamProtocol`)
- ✅ Sandbox disabled (`sandbox: false`)
- ✅ Protocol marked as privileged before `app.ready()`
- ✅ Proper MIME types and streaming headers
- ✅ File exists and is accessible

---

## 🔍 Root Cause

Electron's Chromium sandboxing **blocks video element from loading custom protocols** regardless of configuration. This is a known Electron limitation in v39.x with stricter security policies.

### Attempts Made:
1. ❌ `protocol.registerFileProtocol()` - Rejected by URL safety check
2. ❌ `protocol.registerStreamProtocol()` - Rejected by URL safety check  
3. ❌ `sandbox: false` - No effect
4. ❌ `protocol.registerSchemesAsPrivileged()` with all privileges - No effect

---

## 💡 Recommended Solutions

### Option 1: Disable Web Security (Development Only) ⚠️

**Pros:**
- Immediate fix
- Simple one-line change

**Cons:**
- **INSECURE** - only for development
- Must be removed before production

**Implementation:**
```typescript
// src/main/main.ts
webPreferences: {
  webSecurity: false,  // ⚠️ DEV ONLY!
  ...
}
```

### Option 2: Use `file://` Protocol with Node Integration

**Pros:**
- Works without custom protocol
- Standard Electron approach

**Cons:**
- Requires `nodeIntegration: true` and `contextIsolation: false`
- Security implications

**Implementation:**
```typescript
// Load video directly
<video src={`file:///${clip.sourceFile}`} />
```

### Option 3: Serve Files via Local HTTP Server

**Pros:**
- Most secure
- Works with all video features (seeking, etc.)
- Production-ready

**Cons:**
- More complex setup
- Need to manage server lifecycle

**Implementation:**
```typescript
// Start express server in main process
const server = express();
server.use(express.static('/'));
server.listen(3001);

// Use in renderer
<video src={`http://localhost:3001${encodeURIComponent(filePath)}`} />
```

### Option 4: Copy to App's Resources Directory

**Pros:**
- Simple
- Works with standard file:// protocol

**Cons:**
- Disk I/O overhead
- Need to manage temp files

---

## 🎯 Immediate Action Required

**DECISION NEEDED:** Which approach to use?

**Recommended for MVP:** Option 3 (Local HTTP Server)
- Most production-ready
- Best security
- Full video feature support

**Quick Fix for Testing:** Option 1 (`webSecurity: false`)
- Get it working NOW
- Replace before production

---

## 📝 Implementation Notes

### If using Option 3 (HTTP Server):

```typescript
// src/main/services/VideoServer.ts
import express from 'express';
import { createReadStream, statSync } from 'fs';

export class VideoServer {
  private app = express();
  private port = 3001;

  start() {
    this.app.get('/video/*', (req, res) => {
      const filePath = decodeURIComponent(req.path.slice(7));
      const stat = statSync(filePath);
      
      res.writeHead(200, {
        'Content-Type': 'video/x-matroska',
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
      });
      
      createReadStream(filePath).pipe(res);
    });

    this.app.listen(this.port);
    console.log(`✅ Video server running on http://localhost:${this.port}`);
  }
}
```

Then in VideoPlayer:
```typescript
const mediaUrl = `http://localhost:3001/video/${encodeURIComponent(clip.sourceFile)}`;
```

---

## 🚀 Next Steps

1. **Choose approach** (recommend Option 3)
2. **Implement** chosen solution
3. **Test** video playback
4. **Document** security considerations
5. **Add** to production checklist

---

## 📚 References

- [Electron Custom Protocols](https://www.electronjs.org/docs/latest/api/protocol)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [HTML5 Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Similar Issue on GitHub](https://github.com/electron/electron/issues/36809)

---

**Status:** 🔴 **BLOCKED** - Awaiting decision on implementation approach
**Priority:** 🔥 **CRITICAL** - Core feature non-functional
**Est. Fix Time:** 
- Option 1: 5 minutes
- Option 3: 2-3 hours

