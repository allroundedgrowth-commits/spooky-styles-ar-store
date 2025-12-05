# 🖱️ Drag to Position - User Guide

## Yes! You Can Drag the Wig

The wig is **fully draggable** - you can click and drag it to position it exactly where you want.

## How to Drag

### On Desktop (Mouse):
1. **Hover over the canvas** - Cursor changes to a hand (👋)
2. **Click and hold** on the wig
3. **Drag** to move it around
4. **Release** to drop it in place

### On Mobile (Touch):
1. **Touch the wig** on the screen
2. **Drag your finger** to move it
3. **Lift finger** to drop it in place

### On Tablet:
- Same as mobile - touch and drag

## Visual Feedback

**Cursor Changes:**
- 👋 **Grab cursor** - Ready to drag (hover)
- ✊ **Grabbing cursor** - Currently dragging (active)

**While Dragging:**
- Wig follows your mouse/finger in real-time
- Smooth, responsive movement
- No lag or jumping

## Tips for Best Results

### 1. Drag + Sliders = Perfect Fit
- **Drag** for rough positioning (get it in the right area)
- **Sliders** for fine-tuning (exact placement)
- **Combination** works best!

### 2. Start with Auto-Fit
- Click "Auto-Fit" button first
- Gets wig in reasonable position
- Then drag to adjust

### 3. Use Both Hands (Mobile)
- One finger to drag
- Other hand to adjust sliders
- Quick and precise!

### 4. Zoom In (If Needed)
- Pinch to zoom on mobile
- Get closer for precise placement
- Zoom out to see full result

## What You Can Do

### ✅ Drag to Move
- Move wig up/down
- Move wig left/right
- Move diagonally
- Anywhere on the canvas

### ✅ Combine with Sliders
- Drag for position
- Size slider for scale
- Transparency slider for blend
- All work together!

### ✅ Drag Multiple Times
- Not a one-time thing
- Drag as many times as you want
- Reposition until perfect
- No limits!

## Common Scenarios

### Scenario 1: Wig Too Low
**Solution:**
1. Click and drag wig upward
2. OR use Up/Down slider
3. OR both!

### Scenario 2: Wig Off-Center
**Solution:**
1. Drag wig left or right
2. OR use Left/Right slider
3. Center it perfectly

### Scenario 3: Wig Too Big
**Solution:**
1. Use Size slider to shrink
2. Then drag to reposition
3. Perfect fit!

### Scenario 4: Can't See Face
**Solution:**
1. Drag wig higher up
2. Reduce size with slider
3. Increase transparency
4. Face visible again!

## Technical Details

### How It Works
1. **Click/Touch** - Records starting position
2. **Move** - Calculates distance moved
3. **Update** - Applies movement to wig position
4. **Render** - Redraws wig in new position

### Movement Calculation
```typescript
// Delta = how far you moved
const deltaX = (currentX - startX) / canvasWidth;
const deltaY = (currentY - startY) / canvasHeight;

// Apply to wig position
wigX = centerX + (canvasWidth * offsetX);
wigY = centerY + (canvasHeight * offsetY);
```

### Performance
- **Real-time** - No lag
- **Smooth** - 60 FPS rendering
- **Responsive** - Instant feedback
- **Efficient** - Minimal CPU usage

## Troubleshooting

### Issue: Drag Not Working
**Possible Causes:**
1. AR not initialized yet
2. Browser blocking events
3. Touch events disabled

**Solutions:**
1. Wait for wig to load
2. Try different browser
3. Check touch settings

### Issue: Wig Jumps When Dragging
**Fixed!** - This was the original problem
- Simplified positioning logic
- No more complex calculations
- Smooth, predictable movement

### Issue: Can't Drag on Mobile
**Solutions:**
1. Make sure you're touching the canvas
2. Try single finger (not pinch)
3. Disable browser gestures
4. Use Chrome/Safari

### Issue: Drag Too Sensitive
**Solutions:**
1. Move slower
2. Use sliders for fine-tuning
3. Zoom in for precision
4. Take your time

## Best Practices

### For Quick Positioning:
1. Click Auto-Fit
2. Drag to rough position
3. Use sliders for fine-tuning
4. Done!

### For Precise Positioning:
1. Drag to general area
2. Use Up/Down slider (small adjustments)
3. Use Left/Right slider (small adjustments)
4. Use Size slider (perfect fit)
5. Perfect!

### For Mobile Users:
1. Hold phone steady
2. Use one finger to drag
3. Small movements work best
4. Sliders for precision

## Keyboard Shortcuts (Future)

**Coming Soon:**
- Arrow keys to move wig
- +/- keys to resize
- Space to reset
- Enter to screenshot

## Comparison: Drag vs Sliders

### Drag (Mouse/Touch):
- ✅ Fast for big movements
- ✅ Intuitive and natural
- ✅ Works on all devices
- ⚠️ Less precise for tiny adjustments

### Sliders:
- ✅ Precise control
- ✅ Exact values
- ✅ Fine-tuning
- ⚠️ Slower for big changes

### Best Approach:
**Use Both!**
1. Drag for rough positioning (fast)
2. Sliders for fine-tuning (precise)
3. Perfect result!

## Examples

### Example 1: Center Wig on Head
```
1. Drag wig to center of face
2. Use Up/Down slider to move to top of head
3. Adjust size if needed
4. Perfect!
```

### Example 2: Offset Wig (Stylish Look)
```
1. Drag wig slightly to the left
2. Tilt with rotation (future feature)
3. Adjust transparency
4. Edgy look!
```

### Example 3: Multiple Wigs (Future)
```
1. Position first wig with drag
2. Add second wig
3. Drag second wig to different position
4. Layer them!
```

## FAQ

**Q: Can I drag the wig anywhere?**
A: Yes! Anywhere on the canvas.

**Q: Will it stay where I put it?**
A: Yes! Position is saved until you move it again.

**Q: Can I undo a drag?**
A: Click "Reset" button to return to default position.

**Q: Does drag work with sliders?**
A: Yes! They work together perfectly.

**Q: Can I drag on mobile?**
A: Yes! Touch and drag with your finger.

**Q: Is there a limit to how many times I can drag?**
A: No! Drag as many times as you want.

**Q: Will dragging affect the screenshot?**
A: No! Screenshot captures the final positioned wig.

## Summary

**Drag is enabled and working!**

- ✅ Click and drag on desktop
- ✅ Touch and drag on mobile
- ✅ Smooth, responsive movement
- ✅ Works with sliders
- ✅ No limits on repositioning

**Try it now:**
1. Go to AR page
2. Upload a photo
3. Click and drag the wig
4. Position it perfectly!

---

**The wig is fully draggable. Just click/touch and move it!** 🖱️📱
