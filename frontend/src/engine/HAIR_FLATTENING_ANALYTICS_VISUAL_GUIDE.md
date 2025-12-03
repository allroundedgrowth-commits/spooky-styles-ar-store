# Hair Flattening Analytics Visual Guide

## Analytics Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Starts AR Session                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  trackSessionStart() │
                  └──────────┬───────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │     Hair Segmentation Pipeline         │
        └────────────┬───────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Capture Camera Frame      │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Run Segmentation Model    │
        └────────────┬───────────────┘
                     │
                     ├─── Success ──────────────────┐
                     │                              │
                     │                              ▼
                     │              ┌───────────────────────────────┐
                     │              │ trackSegmentationCompletion() │
                     │              │  - duration                   │
                     │              │  - volumeScore                │
                     │              │  - confidence                 │
                     │              │  - autoFlatteningApplied      │
                     │              └───────────────┬───────────────┘
                     │                              │
                     │                              ▼
                     │              ┌───────────────────────────────┐
                     │              │  Volume Score > 40?           │
                     │              └───────────┬───────────────────┘
                     │                          │
                     │                          ├─── Yes ───┐
                     │                          │           │
                     │                          │           ▼
                     │                          │  ┌────────────────┐
                     │                          │  │ trackModeChange│
                     │                          │  │ (auto-applied) │
                     │                          │  └────────┬───────┘
                     │                          │           │
                     │                          │           ▼
                     │                          │  ┌────────────────────┐
                     │                          │  │ Apply Flattening   │
                     │                          │  └────────┬───────────┘
                     │                          │           │
                     │                          │           ▼
                     │                          │  ┌─────────────────────────┐
                     │                          │  │ trackFlatteningApplied()│
                     │                          │  │  - mode                 │
                     │                          │  │  - processingTime       │
                     │                          │  │  - volumeReduction      │
                     │                          │  └─────────────────────────┘
                     │                          │
                     │                          └─── No ────┐
                     │                                      │
                     │                                      ▼
                     │                          ┌───────────────────┐
                     │                          │ Standard Rendering│
                     │                          └───────────────────┘
                     │
                     └─── Error ───────────────────┐
                                                   │
                                                   ▼
                                    ┌──────────────────────┐
                                    │   trackError()       │
                                    │   - errorType        │
                                    │   - errorMessage     │
                                    │   - context          │
                                    └──────────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────┐
                                    │  Fallback to         │
                                    │  Standard AR         │
                                    └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    User Interactions                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─── Mode Change ──────────────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────┐
                             │                  │  trackModeChange()    │
                             │                  │  - fromMode           │
                             │                  │  - toMode             │
                             │                  │  - userInitiated:true │
                             │                  └───────────────────────┘
                             │
                             ├─── Open Comparison ──────────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────────┐
                             │                  │ trackComparisonView()     │
                             │                  │  - action: 'open'         │
                             │                  └───────────────────────────┘
                             │
                             ├─── Close Comparison ─────────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────────┐
                             │                  │ trackComparisonView()     │
                             │                  │  - action: 'close'        │
                             │                  │  - viewDuration           │
                             │                  └───────────────────────────┘
                             │
                             ├─── Capture Screenshot ───────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────────┐
                             │                  │ trackComparisonView()     │
                             │                  │  - action: 'capture'      │
                             │                  └───────────────────────────┘
                             │
                             └─── Dismiss Info Message ─────────┐
                                                                │
                                                                ▼
                                                ┌───────────────────────┐
                                                │ trackInfoMessage()    │
                                                │  - action: 'dismissed'│
                                                │  - autoHide: false    │
                                                └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Performance Monitoring                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Monitor FPS         │
                  └──────────┬───────────┘
                             │
                             ├─── FPS < 24 ────────────────────┐
                             │                                 │
                             │                                 ▼
                             │              ┌──────────────────────────────────┐
                             │              │ trackPerformanceDegradation()    │
                             │              │  - currentFPS                    │
                             │              │  - targetFPS                     │
                             │              │  - segmentationFPS               │
                             │              │  - degradationLevel              │
                             │              │  - qualityLevel                  │
                             │              └──────────────────────────────────┘
                             │                                 │
                             │                                 ▼
                             │              ┌──────────────────────────────────┐
                             │              │  Apply Quality Degradation       │
                             │              │  - Reduce resolution             │
                             │              │  - Lower segmentation frequency  │
                             │              └──────────────────────────────────┘
                             │
                             └─── FPS >= 24 ───────────────────┐
                                                               │
                                                               ▼
                                                ┌──────────────────────┐
                                                │  Maintain Quality    │
                                                └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Edge Case Handling                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─── Bald User Detected ───────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────┐
                             │                  │  trackEdgeCase()      │
                             │                  │  - type: 'bald_user'  │
                             │                  │  - handled: true      │
                             │                  └───────────────────────┘
                             │
                             ├─── Hat Detected ─────────────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────┐
                             │                  │  trackEdgeCase()      │
                             │                  │  - type: 'hat_detected'│
                             │                  └───────────────────────┘
                             │
                             ├─── Low Quality Image ────────────┐
                             │                                  │
                             │                                  ▼
                             │                  ┌───────────────────────┐
                             │                  │  trackEdgeCase()      │
                             │                  │  - type: 'low_quality'│
                             │                  └───────────────────────┘
                             │
                             └─── Multiple Faces ───────────────┐
                                                                │
                                                                ▼
                                                ┌───────────────────────────┐
                                                │  trackEdgeCase()          │
                                                │  - type: 'multiple_faces' │
                                                └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Session End                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  trackSessionEnd()   │
                  │  - duration          │
                  │  - totalSegmentations│
                  │  - totalModeChanges  │
                  │  - totalErrors       │
                  └──────────────────────┘
```

## Event Timeline Example

```
Time    Event                           Data
────────────────────────────────────────────────────────────────────
0ms     Session Start                   timestamp: 1234567890
                                        
150ms   Initialization Complete         success: true
                                        loadTime: 150ms
                                        
500ms   Segmentation Complete           duration: 245ms
                                        volumeScore: 65
                                        confidence: 0.92
                                        performanceClass: 'good'
                                        
520ms   Mode Change (Auto)              fromMode: 'normal'
                                        toMode: 'flattened'
                                        userInitiated: false
                                        
750ms   Flattening Applied              mode: 'flattened'
                                        processingTime: 230ms
                                        volumeReduction: 70%
                                        
770ms   Info Message Shown              action: 'shown'
                                        autoHide: false
                                        
4770ms  Info Message Dismissed          action: 'dismissed'
                                        autoHide: true
                                        
5200ms  User Mode Change                fromMode: 'flattened'
                                        toMode: 'normal'
                                        userInitiated: true
                                        
6100ms  Comparison View Opened          action: 'open'
                                        currentMode: 'normal'
                                        
8300ms  Comparison View Closed          action: 'close'
                                        viewDuration: 2200ms
                                        
12000ms Performance Degradation         currentFPS: 18
                                        targetFPS: 24
                                        degradationLevel: 'medium'
                                        
15000ms Session End                     duration: 15000ms
                                        totalSegmentations: 45
                                        totalModeChanges: 3
                                        totalErrors: 0
```

## Analytics Dashboard Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│              Hair Flattening Analytics Dashboard                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Total Sessions      │  │  Avg Session Time    │  │  Feature Adoption    │
│      1,234           │  │      45 seconds      │  │       78%            │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Segmentation Performance Distribution                           │
│                                                                  │
│  Excellent (<200ms)  ████████████████████ 45%                   │
│  Good (200-350ms)    ████████████ 30%                           │
│  Acceptable (350-500)████ 15%                                   │
│  Slow (>500ms)       ██ 10%                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Mode Preference Distribution                                    │
│                                                                  │
│  Flattened (Auto)    ████████████████████████ 60%               │
│  Normal              ████████████ 30%                            │
│  Bald                ████ 10%                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Volume Score Distribution                                       │
│                                                                  │
│  Very High (75-100)  ████████████ 25%                           │
│  High (50-75)        ████████████████████ 40%                   │
│  Moderate (25-50)    ████████████ 25%                           │
│  Low (5-25)          ████ 8%                                    │
│  Minimal (0-5)       ██ 2%                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Error Rate by Type                                              │
│                                                                  │
│  LOW_CONFIDENCE      ████████ 2.5%                              │
│  TIMEOUT             ████ 1.2%                                  │
│  SEGMENTATION_FAILED ██ 0.8%                                    │
│  MODEL_LOAD_FAILED   █ 0.3%                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Edge Cases Encountered                                          │
│                                                                  │
│  Multiple Faces      ████████ 15%                               │
│  Low Quality         ████ 8%                                    │
│  Hat Detected        ██ 5%                                      │
│  Bald User           █ 2%                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  User Engagement Metrics                                         │
│                                                                  │
│  Comparison View Usage:        45% of sessions                   │
│  Avg Comparison View Duration: 3.2 seconds                       │
│  Info Message Dismissal Rate:  35% manual, 65% auto             │
│  Mode Changes per Session:     2.3 average                       │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Checklist

```
Session Lifecycle
├─ [✓] Track session start in AR component mount
├─ [✓] Track session end in AR component unmount
└─ [✓] Get session stats for debugging

Segmentation Pipeline
├─ [✓] Track segmentation completion in HairSegmentationModule
├─ [✓] Track segmentation errors
└─ [✓] Track initialization success/failure

Flattening Engine
├─ [✓] Track mode changes (auto and manual)
├─ [✓] Track flattening application
└─ [✓] Track processing performance

Performance Monitoring
├─ [✓] Track performance degradation in PerformanceManager
├─ [✓] Track FPS drops
└─ [✓] Track quality adjustments

Edge Cases
├─ [✓] Track bald user detection
├─ [✓] Track hat detection
├─ [✓] Track low quality images
└─ [✓] Track multiple faces

UI Interactions
├─ [✓] Track comparison view open/close/capture
├─ [✓] Track info message show/dismiss
├─ [✓] Track volume score display
└─ [✓] Track adjustment mode toggle

Error Handling
├─ [✓] Track MODEL_LOAD_FAILED errors
├─ [✓] Track SEGMENTATION_FAILED errors
├─ [✓] Track TIMEOUT errors
├─ [✓] Track LOW_CONFIDENCE warnings
└─ [✓] Track PROCESSING_ERROR errors
```

## Data Flow Summary

```
User Action → Component → Analytics Tracker → Analytics Service → Database

Example:
User clicks "Flattened" mode
    ↓
AdjustmentModeToggle component
    ↓
hairFlatteningAnalytics.trackModeChange()
    ↓
analyticsService.trackEvent()
    ↓
Backend API /analytics/event
    ↓
PostgreSQL events table
```

## Privacy & Security Flow

```
┌─────────────────────┐
│  User Camera Frame  │
│  (stays local)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Process Locally    │
│  (no upload)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract Metrics    │
│  (no image data)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send to Analytics  │
│  (metadata only)    │
└─────────────────────┘
```

## Key Insights from Analytics

1. **Performance Optimization**
   - Identify slow operations
   - Track degradation patterns
   - Validate timing requirements

2. **User Behavior**
   - Understand mode preferences
   - Measure feature engagement
   - Identify confusing interactions

3. **Quality Assurance**
   - Monitor error rates
   - Track edge case frequency
   - Validate requirement compliance

4. **Business Impact**
   - Measure feature adoption
   - Track conversion impact
   - Identify optimization opportunities
