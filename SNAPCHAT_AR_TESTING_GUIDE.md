# Snapchat-Style AR Testing & Refinement Guide

## Overview
This guide helps you test and refine the Snapchat-style AR implementation with landmark-based positioning and smooth interpolation.

## Quick Test Setup

### 1. Start the Application
```bash
npm run dev
```

### 2. Navigate to 2D AR Try-On
- Go to http://localhost:3000
- Click on any product
- Click "Try On (2D AR)" button

### 3. Grant Camera Permissions
- Allow camera access when prompted
- Ensure good lighting for best results

## Testing Checklist

### ✅ Basic Functionality
- [ ] Camera initializes successfully
- [ ] Face is detected (MediaPipe landmarks appear)
- [ ] Wig image loads and displays
- [ ] Wig follows head movements
- [ ] No console errors

### ✅ Positioning Accuracy
- [ ] Wig covers hair area (not face)
- [ ] Wig centered on head
- [ ] Forehead remains visible
- [ ] Eyes and nose clearly visible
- [ ] Wig doesn't extend too far down

### ✅ Smooth Tracking
- [ ] No jittery movements when head is still
- [ ] Smooth transitions when moving head
- [ ] Wig follows head rotation naturally
- [ ] No lag or delay in tracking
- [ ] Stable positioning during small movements

### ✅ Edge Cases
- [ ] Works with different face sizes
- [ ] Works with different distances from camera
- [ ] Works with head tilted left/right
- [ ] Works with head turned slightly
- [ ] Works with different hairstyles (short, long, voluminous)

### ✅ Performance
- [ ] Maintains 30+ FPS
- [ ] No stuttering or freezing
- [ ] Smooth rendering throughout session
- [ ] Memory usage stable over time

## Adjustment Parameters

### Current Default Values
Located in `Simple2DAREngine.ts`:

```typescript
// Smoothing
SMOOTHING_FACTOR = 0.3  // Lower = smoother, Higher = more responsive

// Default config
scale: 1.2        // Wig size multiplier
offsetY: -0.7     // Vertical position (negative = higher)
offsetX: 0        // Horizontal position
opacity: 0.7      // Transparency (0-1)
```

### How to Adjust

#### 1. Smoothing Factor
**Location**: `frontend/src/engine/Simple2DAREngine.ts` line ~90

```typescript
private readonly SMOOTHING_FACTOR = 0.3;
```

**Adjustment Guide**:
- **Too jittery?** → Decrease to 0.2 or 0.15 (smoother but more lag)
- **Too laggy?** → Increase to 0.4 or 0.5 (more responsive but less smooth)
- **Recommended range**: 0.2 - 0.5

#### 2. Wig Scale
**Location**: `frontend/src/engine/Simple2DAREngine.ts` line ~105

```typescript
scale: 1.2,  // Wig size multiplier
```

**Adjustment Guide**:
- **Wig too small?** → Increase to 1.3 or 1.4
- **Wig too large?** → Decrease to 1.0 or 1.1
- **Recommended range**: 1.0 - 1.5

#### 3. Vertical Offset (Y)
**Location**: `frontend/src/engine/Simple2DAREngine.ts` line ~106

```typescript
offsetY: -0.7,  // Vertical position
```

**Adjustment Guide**:
- **Wig too low (covering face)?** → More negative: -0.8 or -0.9
- **Wig too high (floating)?** → Less negative: -0.6 or -0.5
- **Recommended range**: -1.0 to -0.4

#### 4. Horizontal Offset (X)
**Location**: `frontend/src/engine/Simple2DAREngine.ts` line ~107

```typescript
offsetX: 0,  // Horizontal position
```

**Adjustment Guide**:
- **Wig shifted left?** → Positive: 0.05 or 0.1
- **Wig shifted right?** → Negative: -0.05 or -0.1
- **Recommended range**: -0.2 to 0.2

#### 5. Opacity
**Location**: `frontend/src/engine/Simple2DAREngine.ts` line ~108

```typescript
opacity: 0.7,  // Transparency
```

**Adjustment Guide**:
- **Too transparent?** → Increase to 0.8 or 0.9
- **Too opaque?** → Decrease to 0.6 or 0.5
- **Recommended range**: 0.5 - 0.95

## Real-World Testing Scenarios

### Scenario 1: Different Face Sizes
**Test**: Have people with different face sizes try the AR
**Expected**: Wig should scale appropriately for each person
**If not working**: Adjust `calculateAutoScale()` method

### Scenario 2: Different Distances
**Test**: Move closer and farther from camera
**Expected**: Wig should maintain proportional size
**If not working**: Check auto-scaling logic in `drawWigWithLandmarks()`

### Scenario 3: Head Movements
**Test**: Turn head left, right, up, down
**Expected**: Wig should follow smoothly without lag
**If not working**: Adjust `SMOOTHING_FACTOR`

### Scenario 4: Different Hairstyles
**Test**: People with short hair, long hair, voluminous hair
**Expected**: Wig should position consistently
**If not working**: May need hair flattening feature

### Scenario 5: Lighting Conditions
**Test**: Bright light, dim light, backlit
**Expected**: Face tracking should remain stable
**If not working**: Check MediaPipe initialization

## Common Issues & Solutions

### Issue: Wig is jittery
**Solution**: Decrease `SMOOTHING_FACTOR` to 0.2 or 0.15

### Issue: Wig lags behind head movement
**Solution**: Increase `SMOOTHING_FACTOR` to 0.4 or 0.5

### Issue: Wig covers face too much
**Solution**: Make `offsetY` more negative (e.g., -0.8)

### Issue: Wig floats above head
**Solution**: Make `offsetY` less negative (e.g., -0.6)

### Issue: Wig too small
**Solution**: Increase `scale` to 1.3 or 1.4

### Issue: Wig too large
**Solution**: Decrease `scale` to 1.0 or 1.1

### Issue: Wig off-center horizontally
**Solution**: Adjust `offsetX` (positive = right, negative = left)

### Issue: Face not detected
**Solution**: 
1. Check camera permissions
2. Ensure good lighting
3. Check browser console for MediaPipe errors
4. Verify MediaPipe models are loading

### Issue: Poor performance
**Solution**:
1. Check FPS in console logs
2. Disable hair flattening if enabled
3. Reduce video resolution in `initialize()` method

## Advanced Tuning

### Per-Product Adjustments
You can override defaults per product in the UI:

```typescript
// In Simple2DARTryOn.tsx or useSimple2DAR.ts
engine.updateConfig({
  scale: 1.3,      // Larger wig
  offsetY: -0.8,   // Higher position
  opacity: 0.85,   // More opaque
});
```

### Dynamic Adjustments
Add UI controls for real-time adjustment:

```typescript
// Example: Add sliders in UI
<input 
  type="range" 
  min="0.8" 
  max="1.6" 
  step="0.1"
  value={scale}
  onChange={(e) => engine.updateConfig({ scale: parseFloat(e.target.value) })}
/>
```

## Performance Monitoring

### Check FPS
Open browser console and look for:
```
2D AR Engine initialized { faceTracking: 'MediaPipe Face Mesh', ... }
```

### Monitor Smoothing
Watch for smooth vs. jittery movement in real-time

### Memory Usage
Use Chrome DevTools → Performance → Memory to check for leaks

## Testing Matrix

| Test Case | Expected Result | Pass/Fail |
|-----------|----------------|-----------|
| Face detection works | ✓ Landmarks detected | ☐ |
| Wig loads correctly | ✓ Image displays | ☐ |
| Smooth tracking | ✓ No jitter | ☐ |
| Proper positioning | ✓ Covers hair only | ☐ |
| Head rotation | ✓ Follows naturally | ☐ |
| Different faces | ✓ Works for all | ☐ |
| Different distances | ✓ Scales properly | ☐ |
| Performance | ✓ 30+ FPS | ☐ |

## Recommended Workflow

1. **Initial Test**: Use default values, test with 3-5 people
2. **Identify Issues**: Note common problems (too high, too low, jittery, etc.)
3. **Adjust Parameters**: Make small changes (0.1 increments)
4. **Re-test**: Verify improvements with same test group
5. **Fine-tune**: Continue adjusting until optimal
6. **Document**: Record final values for production

## Production Recommendations

### Optimal Settings (Based on Testing)
After testing, update these values:

```typescript
// Recommended production values
SMOOTHING_FACTOR = 0.3  // Good balance
scale: 1.2              // Natural size
offsetY: -0.7           // Covers hair, shows face
offsetX: 0              // Centered
opacity: 0.75           // Visible but natural
```

### A/B Testing
Consider testing multiple configurations:
- **Configuration A**: More responsive (SMOOTHING_FACTOR = 0.4)
- **Configuration B**: Smoother (SMOOTHING_FACTOR = 0.2)

Track user preferences and conversion rates.

## Next Steps

1. ✅ Test with default values
2. ✅ Gather feedback from real users
3. ✅ Adjust parameters based on feedback
4. ✅ Re-test and validate
5. ✅ Deploy optimized configuration
6. ✅ Monitor analytics for user engagement

## Support

If you encounter issues not covered here:
1. Check browser console for errors
2. Verify MediaPipe is loading correctly
3. Test in different browsers (Chrome, Firefox, Safari)
4. Check camera permissions and lighting
5. Review `Simple2DAREngine.ts` implementation

## Quick Reference Card

```
SMOOTHING_FACTOR: 0.3 (0.2-0.5)
scale: 1.2 (1.0-1.5)
offsetY: -0.7 (-1.0 to -0.4)
offsetX: 0 (-0.2 to 0.2)
opacity: 0.7 (0.5-0.95)
```

**Remember**: Small adjustments (0.1 increments) work best!
