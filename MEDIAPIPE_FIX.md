# MediaPipe Quick Fix Guide

## Problem
MediaPipe Face Mesh is trying to load from CDN but may not be working properly.

## Solution
Install packages locally and update the code.

## Step 1: Install Packages
```bash
cd frontend
npm install @mediapipe/face_mesh @mediapipe/camera_utils
```

## Step 2: Update MediaPipeFaceMesh.ts

Replace the `locateFile` function in `frontend/src/engine/MediaPipeFaceMesh.ts`:

### OLD CODE (Line ~30):
```typescript
this.faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
```

### NEW CODE:
```typescript
this.faceMesh = new FaceMesh({
  locateFile: (file) => {
    // Use local files from node_modules
    return `/node_modules/@mediapipe/face_mesh/${file}`;
  },
});
```

## Step 3: Update Vite Config

Add to `frontend/vite.config.ts` to serve MediaPipe files:

```typescript
export default defineConfig({
  // ... existing config
  optimizeDeps: {
    exclude: ['@mediapipe/face_mesh', '@mediapipe/camera_utils'],
  },
  server: {
    fs: {
      allow: ['..'], // Allow serving files from parent directory
    },
  },
});
```

## Step 4: Alternative - Disable MediaPipe for Tonight

If MediaPipe is still causing issues, you can disable it temporarily:

In `frontend/src/engine/Simple2DAREngine.ts`, find the `initializeFaceDetection` method and add:

```typescript
private async initializeFaceDetection(): Promise<void> {
  // TEMPORARY: Disable MediaPipe for tonight
  console.log('⚠️ MediaPipe disabled - using fallback detection');
  this.useMediaPipe = false;
  this.faceMeshTracker = null;
  return;
  
  // ... rest of the code
}
```

This will use the fallback face detection (centered positioning) which is good enough for manual adjustment.

## Step 5: Test

1. Restart frontend: `npm run dev`
2. Open browser console (F12)
3. Go to AR page
4. Look for one of these messages:
   - ✅ "MediaPipe Face Mesh initialized"
   - ⚠️ "MediaPipe disabled - using fallback detection"

## Recommendation for Tonight

**Disable MediaPipe and use fallback detection.**

Why?
- Fallback works fine with manual adjustment
- Users can position wig with sliders
- No dependency on external libraries
- Faster to get working
- Can fix MediaPipe properly tomorrow

The fallback detection provides a reasonable starting position, and users can easily adjust with the sliders. This is good enough for a beta launch!
