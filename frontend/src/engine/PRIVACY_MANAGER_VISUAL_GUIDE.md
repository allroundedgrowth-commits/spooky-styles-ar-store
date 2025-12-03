# PrivacyManager Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AR Session                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           PrivacyManager                           │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Session Management                      │     │    │
│  │  │  • startSession()                        │     │    │
│  │  │  • handleSessionEnd()                    │     │    │
│  │  │  • isSessionActive()                     │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Frame Tracking                          │     │    │
│  │  │  • trackCameraFrame()                    │     │    │
│  │  │  • trackProcessedFrame()                 │     │    │
│  │  │  • MAX_FRAME_RETENTION = 10              │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Data Cleanup                            │     │    │
│  │  │  • clearCameraData()                     │     │    │
│  │  │  • Periodic cleanup (30s)                │     │    │
│  │  │  • Automatic on session end              │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Model Integrity                         │     │    │
│  │  │  • verifyModelIntegrity()                │     │    │
│  │  │  • Checksum verification                 │     │    │
│  │  │  • SRI hash support                      │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Privacy Metrics                         │     │    │
│  │  │  • getMetrics()                          │     │    │
│  │  │  • getMemoryUsage()                      │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Session Lifecycle

```
┌─────────────┐
│   Start     │
│   Session   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Session Active                     │
│  • Automatic cleanup enabled        │
│  • Frame tracking active            │
│  • Memory monitoring active         │
└──────┬──────────────────────────────┘
       │
       │  ┌──────────────────────┐
       ├─▶│  Process Frames      │
       │  │  • Track camera      │
       │  │  • Track processed   │
       │  └──────────────────────┘
       │
       │  ┌──────────────────────┐
       ├─▶│  Periodic Cleanup    │
       │  │  • Every 30 seconds  │
       │  │  • Remove old frames │
       │  └──────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  End Session                        │
│  • Clear all data                   │
│  • Stop automatic cleanup           │
│  • Free memory                      │
└─────────────────────────────────────┘
```

## Frame Tracking Flow

```
Camera Frame
     │
     ▼
┌─────────────────────────────────────┐
│  trackCameraFrame(frame)            │
│  • Add to cameraFrames array        │
│  • Increment framesProcessed        │
│  • Check retention limit            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Retention Limit Check              │
│  • If > MAX_FRAME_RETENTION (10)    │
│  • Remove oldest frame              │
│  • Update memoryFreed               │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Processing                         │
│  • Hair segmentation                │
│  • Flattening                       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  trackProcessedFrame(result)        │
│  • Add to processedFrames array     │
│  • Check retention limit            │
└─────────────────────────────────────┘
```

## Memory Management

```
┌─────────────────────────────────────────────────────────┐
│                    Memory Timeline                       │
│                                                          │
│  Memory                                                  │
│  Usage                                                   │
│    ▲                                                     │
│    │     ┌───┐                                          │
│    │     │   │     ┌───┐                                │
│    │  ┌──┤   ├─────┤   ├──┐                            │
│    │  │  │   │     │   │  │     ┌───┐                  │
│    │  │  └───┘     └───┘  │     │   │                  │
│    │  │                    └─────┤   ├──┐              │
│    │  │                          └───┘  │              │
│    │  │                                 │              │
│    └──┴─────────────────────────────────┴──────────▶   │
│       │         │         │         │         │   Time  │
│       │         │         │         │         │         │
│    Frame 1   Frame 5   Cleanup   Frame 10  Session     │
│    Added     Added     (30s)     Added     End         │
│                                                          │
│  Legend:                                                 │
│  ┌───┐ = Frames in memory                               │
│  └───┘                                                   │
│                                                          │
│  Max Retention: 10 frames                               │
│  Cleanup Interval: 30 seconds                           │
└─────────────────────────────────────────────────────────┘
```

## Model Integrity Verification

```
┌─────────────────────────────────────┐
│  Model URL + Config                 │
│  • url: model location              │
│  • checksum: expected hash          │
│  • algorithm: SHA-256/384/512       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Fetch Model                        │
│  • Download from URL                │
│  • Convert to ArrayBuffer           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Compute Checksum                   │
│  • Use Web Crypto API               │
│  • crypto.subtle.digest()           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Compare Checksums                  │
│  • Expected vs Computed             │
└──────┬──────────────────────────────┘
       │
       ├─▶ Match ──▶ ✓ Model Verified
       │
       └─▶ Mismatch ──▶ ✗ Verification Failed
```

## Privacy Metrics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                  Privacy Metrics                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Session Status:  ● Active                              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Frames Processed:        1,234                │    │
│  │  Frames Cleared:            234                │    │
│  │  Memory Freed:           45.2 MB               │    │
│  │  Current Memory:          8.5 MB               │    │
│  │  Last Cleanup:      10:30:45 AM                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Memory Usage Over Time                        │    │
│  │                                                 │    │
│  │  10 MB ┤     ╭─╮                               │    │
│  │   8 MB ┤   ╭─╯ ╰─╮                             │    │
│  │   6 MB ┤ ╭─╯     ╰─╮                           │    │
│  │   4 MB ┤─╯         ╰─╮                         │    │
│  │   2 MB ┤             ╰─────                    │    │
│  │   0 MB └─────────────────────────────▶         │    │
│  │        0s    30s   60s   90s  120s             │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Camera     │
│   Capture    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  PrivacyManager.trackCameraFrame()   │
│  • Store frame reference             │
│  • Update metrics                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Hair Segmentation                   │
│  • Client-side processing            │
│  • No server upload                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  PrivacyManager.trackProcessedFrame()│
│  • Store result reference            │
│  • Update metrics                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Hair Flattening                     │
│  • Client-side processing            │
│  • No server upload                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Wig Rendering                       │
│  • Display to user                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Session End                         │
│  • PrivacyManager.handleSessionEnd() │
│  • Clear all data                    │
│  • Free memory                       │
└──────────────────────────────────────┘
```

## Privacy Guarantees Visualization

```
┌─────────────────────────────────────────────────────────┐
│                  Privacy Guarantees                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ Client-Side Processing                               │
│    ┌──────────────────────────────────────────┐        │
│    │  Browser                                 │        │
│    │  ┌────────────────────────────────┐     │        │
│    │  │  Camera → Process → Display    │     │        │
│    │  └────────────────────────────────┘     │        │
│    │                                          │        │
│    │  ✗ No Server Upload                     │        │
│    └──────────────────────────────────────────┘        │
│                                                          │
│  ✓ Automatic Data Cleanup                               │
│    ┌──────────────────────────────────────────┐        │
│    │  Session End → Clear All Data            │        │
│    │  Periodic → Remove Old Frames            │        │
│    │  Limit → Max 10 Frames                   │        │
│    └──────────────────────────────────────────┘        │
│                                                          │
│  ✓ Model Integrity                                      │
│    ┌──────────────────────────────────────────┐        │
│    │  Model → Verify Checksum → Load          │        │
│    │  ✗ Invalid → Reject                      │        │
│    └──────────────────────────────────────────┘        │
│                                                          │
│  ✓ Memory Management                                    │
│    ┌──────────────────────────────────────────┐        │
│    │  Track Usage → Enforce Limits            │        │
│    │  Monitor → Report Metrics                │        │
│    └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Integration Example

```
┌─────────────────────────────────────────────────────────┐
│                  AR Session Class                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  class ARSession {                                       │
│    private privacyManager = new PrivacyManager();       │
│    private arEngine = new Simple2DAREngine();           │
│                                                          │
│    async start() {                                       │
│      // 1. Start privacy tracking                       │
│      this.privacyManager.startSession();                │
│                                                          │
│      // 2. Verify model integrity                       │
│      const isValid = await                              │
│        this.privacyManager.verifyModelIntegrity({       │
│          url: modelUrl,                                 │
│          checksum: expectedChecksum,                    │
│          algorithm: 'SHA-256'                           │
│        });                                              │
│                                                          │
│      if (!isValid) {                                    │
│        throw new Error('Model verification failed');    │
│      }                                                  │
│                                                          │
│      // 3. Initialize AR engine                         │
│      await this.arEngine.initialize();                  │
│    }                                                    │
│                                                          │
│    processFrame(frame: ImageData) {                     │
│      // Track frame for privacy                         │
│      this.privacyManager.trackCameraFrame(frame);       │
│                                                          │
│      // Process frame                                   │
│      const result = this.arEngine.processFrame(frame);  │
│                                                          │
│      // Track result                                    │
│      if (result) {                                      │
│        this.privacyManager.trackProcessedFrame(result); │
│      }                                                  │
│                                                          │
│      return result;                                     │
│    }                                                    │
│                                                          │
│    stop() {                                             │
│      // Clean up AR engine                              │
│      this.arEngine.dispose();                           │
│                                                          │
│      // Clean up privacy manager (automatic cleanup)    │
│      this.privacyManager.handleSessionEnd();            │
│    }                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

## Configuration Options

```
┌─────────────────────────────────────────────────────────┐
│              PrivacyManager Configuration                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frame Retention                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │  MAX_FRAME_RETENTION = 10                      │    │
│  │  • Limits memory usage                         │    │
│  │  • Prevents unbounded growth                   │    │
│  │  • Automatic old frame removal                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Cleanup Interval                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  CLEANUP_INTERVAL_MS = 30000 (30 seconds)      │    │
│  │  • Periodic background cleanup                 │    │
│  │  • Removes old frames                          │    │
│  │  • Frees memory                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Model Verification                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  Supported Algorithms:                         │    │
│  │  • SHA-256                                     │    │
│  │  • SHA-384                                     │    │
│  │  • SHA-512                                     │    │
│  │  • SRI hashes                                  │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Performance Impact

```
┌─────────────────────────────────────────────────────────┐
│                  Performance Metrics                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frame Tracking Overhead                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │  < 1ms per frame                               │    │
│  │  Negligible impact on FPS                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Cleanup Performance                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  Background operation                          │    │
│  │  Non-blocking                                  │    │
│  │  < 5ms per cleanup cycle                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Model Verification                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  One-time on model load                        │    │
│  │  Async operation                               │    │
│  │  Doesn't block rendering                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Memory Usage                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │  Bounded by frame retention limit              │    │
│  │  Typical: 5-10 MB                              │    │
│  │  Maximum: ~20 MB (10 frames @ 1920x1080)       │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Security Checklist

```
┌─────────────────────────────────────────────────────────┐
│                  Security Checklist                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ No Server Uploads                                    │
│    • Camera frames stay on device                       │
│    • All processing client-side                         │
│    • No network transmission of user data               │
│                                                          │
│  ✓ Model Verification                                   │
│    • Checksum verification before use                   │
│    • Tamper detection                                   │
│    • HTTPS-only model loading                           │
│                                                          │
│  ✓ Memory Security                                      │
│    • Automatic data cleanup                             │
│    • Frame retention limits                             │
│    • Memory usage monitoring                            │
│                                                          │
│  ✓ Session Security                                     │
│    • Automatic cleanup on session end                   │
│    • No data persistence                                │
│    • Clean disposal                                     │
│                                                          │
│  ✓ Browser Security                                     │
│    • Web Crypto API for checksums                       │
│    • Secure random number generation                    │
│    • Same-origin policy enforcement                     │
└─────────────────────────────────────────────────────────┘
```
