# Smart Hair Flattening - Troubleshooting Guide

## Quick Diagnostics

Before diving into specific issues, try these quick fixes:

1. **Refresh the page** - Clears any temporary glitches
2. **Check lighting** - Ensure bright, even lighting from the front
3. **Center your face** - Position your face in the middle of the frame
4. **Remove obstructions** - Take off hats, sunglasses, or anything covering your hair
5. **Update your browser** - Ensure you're using the latest version

## Common Issues and Solutions

### Issue: Hair Detection Not Working

**Symptoms:**
- No hair is detected (volume score shows 0)
- Flattening doesn't apply even with visible hair
- "Low confidence" warning appears repeatedly

**Possible Causes and Solutions:**

#### 1. Poor Lighting Conditions

**Problem:** Insufficient or uneven lighting makes hair detection difficult.

**Solutions:**
- Move to a brighter area with even lighting
- Use natural daylight (not direct sunlight)
- Add front-facing lights to illuminate your face
- Avoid backlighting (light behind you)
- Turn on room lights if indoors

**Test:** Can you clearly see your hair in the camera preview? If not, the AI can't detect it either.

#### 2. Camera Quality Issues

**Problem:** Blurry or low-quality camera feed.

**Solutions:**
- Clean your camera lens
- Ensure camera is in focus
- Hold your device steady
- Move closer to the camera (1-2 feet optimal)
- Use a device with a better camera if available

#### 3. Hair Covered or Obscured

**Problem:** Hair is not visible to the camera.

**Solutions:**
- Remove hats, hoods, or head coverings
- Ensure hair is not hidden behind your head
- Move hair accessories that obscure volume
- Tie back hair if it's covering your face

#### 4. Extreme Camera Angles

**Problem:** Face is at an unusual angle.

**Solutions:**
- Position camera at eye level
- Face the camera directly
- Keep head rotation within ±45 degrees
- Avoid looking up or down at extreme angles

#### 5. Multiple Faces in Frame

**Problem:** More than one person visible.

**Solutions:**
- Ensure only one person is in the camera view
- Ask others to step out of frame
- The system will select the largest/most centered face

### Issue: Flattening Looks Unnatural

**Symptoms:**
- Hair appears overly processed or artificial
- Visible artifacts or glitches
- Unnatural edges or transitions
- Scalp color looks wrong

**Possible Causes and Solutions:**

#### 1. Harsh Lighting or Shadows

**Problem:** Strong shadows create detection errors.

**Solutions:**
- Use diffused, even lighting
- Avoid single strong light sources
- Add fill lighting to reduce shadows
- Move away from windows with direct sunlight

#### 2. Hair Color Similar to Background

**Problem:** Low contrast between hair and background.

**Solutions:**
- Change your background (use a plain wall)
- Adjust lighting to create more contrast
- Move to a different location
- Ensure background is different from hair color

#### 3. Complex Hairstyles

**Problem:** Intricate hairstyles confuse the AI.

**Solutions:**
- Try with hair down or in a simpler style
- Use "Normal" mode if flattening doesn't work well
- Adjust lighting to make hair boundaries clearer
- Consider that some styles may not flatten realistically

#### 4. Low Confidence Detection

**Problem:** AI isn't confident about hair boundaries.

**Solutions:**
- Improve lighting conditions
- Ensure face is clearly visible
- Remove obstructions
- Try refreshing and restarting the session

### Issue: Performance Problems

**Symptoms:**
- Slow or laggy AR experience
- Low frame rate (choppy video)
- Long processing times
- Browser freezing or crashing

**Possible Causes and Solutions:**

#### 1. Device Limitations

**Problem:** Device doesn't have enough processing power.

**Solutions:**
- Close other browser tabs and applications
- Restart your browser
- Use a more powerful device if available
- Select "Normal" mode to disable hair processing
- The system will automatically reduce quality on low-end devices

**Minimum Specs:**
- 2GB+ RAM
- Modern processor (2018+)
- WebGL support
- Updated browser

#### 2. Browser Issues

**Problem:** Browser is outdated or misconfigured.

**Solutions:**
- Update to the latest browser version
- Clear browser cache and cookies
- Disable unnecessary browser extensions
- Try a different browser (Chrome recommended)
- Enable hardware acceleration in browser settings

#### 3. Network Problems

**Problem:** Slow initial model loading.

**Solutions:**
- Ensure stable internet connection (for first use)
- Wait for models to fully download (~3MB)
- Refresh if download stalls
- After first use, models are cached locally

#### 4. Memory Issues

**Problem:** Browser running out of memory.

**Solutions:**
- Close other tabs and applications
- Restart your browser
- Clear browser cache
- Use a device with more RAM

### Issue: Wig Alignment Problems

**Symptoms:**
- Wig doesn't sit properly on head
- Visible gaps between wig and hair
- Wig position shifts incorrectly
- Misalignment during head movement

**Possible Causes and Solutions:**

#### 1. Inaccurate Hair Detection

**Problem:** Hair boundaries detected incorrectly.

**Solutions:**
- Improve lighting conditions
- Ensure hair is clearly visible
- Try different adjustment modes
- Refresh and restart the session

#### 2. Extreme Head Angles

**Problem:** Head rotated beyond optimal range.

**Solutions:**
- Keep head rotation within ±45 degrees
- Face the camera more directly
- Avoid tilting head too far up or down
- Move slowly to allow tracking to adjust

#### 3. Rapid Movement

**Problem:** Moving too quickly for tracking.

**Solutions:**
- Move your head slowly and smoothly
- Allow system to track before moving again
- Stay within camera frame
- Avoid sudden movements

### Issue: Feature Not Loading

**Symptoms:**
- Hair flattening controls don't appear
- Error messages on page load
- AR works but no flattening option
- Infinite loading state

**Possible Causes and Solutions:**

#### 1. Browser Compatibility

**Problem:** Browser doesn't support required features.

**Solutions:**
- Update to latest browser version
- Try a different browser:
  - Chrome 90+ (recommended)
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- Enable JavaScript
- Enable WebGL

**Check WebGL:** Visit `chrome://gpu` (Chrome) or `about:support` (Firefox) to verify WebGL is enabled.

#### 2. Camera Access Denied

**Problem:** Browser doesn't have camera permission.

**Solutions:**
- Click the camera icon in address bar
- Allow camera access when prompted
- Check browser settings for camera permissions
- Restart browser after granting permissions

#### 3. Network Issues

**Problem:** Can't download AI models.

**Solutions:**
- Check internet connection
- Disable VPN or proxy temporarily
- Try a different network
- Wait and retry (server may be busy)
- Clear browser cache and retry

#### 4. JavaScript Errors

**Problem:** Script errors preventing feature load.

**Solutions:**
- Open browser console (F12) to check for errors
- Refresh the page
- Clear browser cache
- Disable conflicting browser extensions
- Try incognito/private mode

### Issue: Volume Score Seems Incorrect

**Symptoms:**
- Score doesn't match visible hair volume
- Score is 0 despite having hair
- Score is very high with minimal hair
- Score fluctuates wildly

**Possible Causes and Solutions:**

#### 1. Partial Hair Visibility

**Problem:** Not all hair is visible in frame.

**Solutions:**
- Ensure your full head is in the camera view
- Move back slightly to show more hair
- Adjust camera angle to capture all hair
- Remove anything blocking hair from view

#### 2. Lighting Creating False Shadows

**Problem:** Shadows look like hair to the AI.

**Solutions:**
- Use even, diffused lighting
- Eliminate harsh shadows
- Avoid backlighting
- Add front-facing lights

#### 3. Background Confusion

**Problem:** Background elements detected as hair.

**Solutions:**
- Use a plain, contrasting background
- Move away from busy backgrounds
- Ensure clear separation between hair and background
- Adjust lighting to create better contrast

#### 4. Hair Color Issues

**Problem:** Hair color too similar to skin or background.

**Solutions:**
- Improve lighting to create contrast
- Change background color
- Adjust camera position
- Try different lighting angles

### Issue: Privacy or Security Concerns

**Symptoms:**
- Worried about data collection
- Concerned about camera access
- Questions about image storage

**Solutions:**

**Understanding the Feature:**
- All processing happens on your device
- No images are uploaded to servers
- Camera data is processed and immediately discarded
- No storage of personal information
- Models are loaded with integrity verification

**Verifying Privacy:**
- Check browser console (F12) - no network requests for images
- Review browser permissions - only camera access needed
- Data is cleared when you close the AR session
- No cookies or tracking related to camera data

**If Still Concerned:**
- Use the feature in incognito/private mode
- Clear browser data after use
- Revoke camera permissions after session
- Contact support for more information

## Edge Cases

### Bald Users

**Issue:** System tries to detect hair when there is none.

**Solution:**
- System automatically detects bald users (volume score < 5)
- Flattening is skipped automatically
- Select "Bald" mode for most accurate preview
- No action needed - feature handles this automatically

### Users Wearing Hats

**Issue:** Hat interferes with hair detection.

**Solution:**
- System detects unusual patterns indicating hat/covering
- Message suggests removing head coverings
- Remove hat for best results
- If you must keep it on, use "Normal" mode

### Very Long or Thick Hair

**Issue:** Extreme hair volume may challenge the system.

**Solution:**
- System is designed for high volumes (up to score 100)
- Flattening is especially important for thick hair
- May take slightly longer to process
- Results should still be realistic
- Try comparison view to verify accuracy

### Multiple Hair Colors

**Issue:** Dyed or highlighted hair with multiple colors.

**Solution:**
- System detects all visible hair colors
- May take slightly longer to process
- Should work normally in most cases
- Ensure good lighting for best results

### Hair Accessories

**Issue:** Clips, headbands, or accessories affect detection.

**Solution:**
- Small accessories usually don't interfere
- Large accessories may be detected as hair
- Remove if causing issues
- System focuses on hair volume, not accessories

## Error Messages

### "Unable to load hair detection. Try refreshing."

**Cause:** Model loading failed.

**Solutions:**
1. Refresh the page
2. Check internet connection
3. Clear browser cache
4. Try a different browser
5. Wait a few minutes and retry

**Fallback:** AR try-on will work without hair flattening.

### "Hair detection confidence is low. Try better lighting."

**Cause:** AI isn't confident about detection.

**Solutions:**
1. Move to brighter area
2. Ensure even lighting
3. Remove obstructions
4. Center face in frame
5. Clean camera lens

**Note:** You can still proceed, but results may be less accurate.

### "Camera access required for AR try-on."

**Cause:** Camera permission not granted.

**Solutions:**
1. Click "Allow" when prompted
2. Check browser address bar for camera icon
3. Go to browser settings → Privacy → Camera
4. Refresh page after granting permission

### "WebGL not supported. Please update your browser."

**Cause:** Browser doesn't support WebGL.

**Solutions:**
1. Update to latest browser version
2. Enable WebGL in browser settings
3. Try a different browser
4. Check graphics drivers are updated

### "Performance degraded. Some features disabled."

**Cause:** Device struggling with processing load.

**Solutions:**
1. Close other applications
2. Select "Normal" mode to reduce load
3. System has automatically reduced quality
4. Use a more powerful device if available

**Note:** This is automatic optimization, not an error.

## Advanced Troubleshooting

### Checking Browser Console

1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Look for error messages in red
4. Share errors with support if needed

### Testing WebGL

1. Visit: `https://get.webgl.org/`
2. Should see spinning cube
3. If not, WebGL is not working
4. Update browser or graphics drivers

### Clearing Browser Data

**Chrome:**
1. Settings → Privacy and Security
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data and refresh

**Firefox:**
1. Settings → Privacy & Security
2. Cookies and Site Data
3. Clear Data
4. Refresh page

**Safari:**
1. Preferences → Privacy
2. Manage Website Data
3. Remove data for site
4. Refresh page

### Testing Different Browsers

If issues persist, try:
1. Chrome (recommended)
2. Firefox
3. Edge
4. Safari (Mac/iOS)

This helps determine if it's a browser-specific issue.

## Still Having Issues?

If you've tried the solutions above and still experience problems:

1. **Document the issue:**
   - What you were trying to do
   - What happened instead
   - Error messages (if any)
   - Screenshots or screen recordings

2. **Gather system information:**
   - Browser name and version
   - Device type and model
   - Operating system
   - Internet connection type

3. **Contact support:**
   - Provide the information above
   - Include steps to reproduce the issue
   - Mention solutions you've already tried

4. **Temporary workaround:**
   - Use "Normal" mode to disable hair processing
   - AR try-on will still work normally
   - Try again later after updates

## Prevention Tips

To avoid issues in the future:

- **Keep browser updated** - Enable automatic updates
- **Use good lighting** - Invest in a ring light or desk lamp
- **Maintain device** - Keep software and drivers updated
- **Clear cache regularly** - Prevents buildup of old data
- **Use recommended browsers** - Chrome or Firefox for best results
- **Check system requirements** - Ensure device meets minimum specs

---

**Need more help?** Contact our support team with details about your issue, and we'll assist you as quickly as possible.
