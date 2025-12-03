# Smart Hair Flattening - Frequently Asked Questions

## General Questions

### What is Smart Hair Flattening?

Smart Hair Flattening is an AI-powered feature that automatically detects your hair volume and adjusts it to simulate how a wig would look when worn with a wig cap. This provides a more realistic preview of the wig's appearance.

### Why do I need hair flattening?

When you wear a wig in real life, you typically use a wig cap that compresses and contains your natural hair. Without flattening, the AR preview would show the wig sitting on top of your full hair volume, which isn't realistic. Hair flattening simulates the wig cap effect digitally.

### Is this feature required to use AR try-on?

No, it's optional. The AR try-on works perfectly fine without hair flattening. However, if you have voluminous hair, flattening provides a more accurate preview of how the wig will actually look when worn.

### Does it work for all hair types?

Yes! The AI is trained to detect hair across:
- 10+ hair colors (black, brown, blonde, red, gray, white, and fashion colors)
- 5+ hair textures (straight, wavy, curly, coily, kinky)
- Various hairstyles (loose, tied back, braided, etc.)
- All skin tones (Fitzpatrick scale types I-VI)

## Using the Feature

### How do I turn hair flattening on or off?

Use the adjustment mode toggle in the AR interface. You have three options:
1. **Normal** - No flattening (original hair)
2. **Flattened** - Soft flattening (recommended)
3. **Bald** - Complete hair removal (preview only)

Simply click the mode you prefer, and the change applies instantly.

### Why was flattening automatically applied?

If your hair volume score is above 40, the system automatically applies flattening because it provides a more realistic preview. You can always change this by selecting "Normal" mode if you prefer to see your original hair.

### What's the difference between Flattened and Bald modes?

- **Flattened Mode**: Reduces hair volume by 60-80% while preserving your natural head shape and scalp. This simulates wearing a wig cap.
- **Bald Mode**: Removes all visible hair to show the wig as if worn on a bald head. This is useful for seeing the wig's full design but may not represent how it looks on you in real life if you have hair.

### Can I see before and after comparisons?

Yes! Click the "Compare" button to see a split-screen view showing your original hair on one side and the adjusted version on the other. You can also capture screenshots of the comparison.

### How accurate is the hair detection?

The AI model achieves 85%+ accuracy for hair region identification across diverse hair types and colors. Accuracy is highest with:
- Good lighting conditions
- Clear camera view
- Face centered in frame
- No obstructions (hats, hands, etc.)

## Technical Questions

### Does this upload my photos anywhere?

No! All processing happens entirely on your device. Your camera feed is processed locally using AI models that run in your browser. No images are ever uploaded to servers.

### What happens to my camera data?

Camera frames are processed in real-time and immediately discarded. When you close the AR session, all data is automatically cleared from memory. Nothing is stored or saved.

### Why is it slow on my device?

The feature requires significant processing power for real-time AI segmentation. On lower-end devices, the system automatically:
- Reduces segmentation resolution
- Lowers frame rate
- Disables some visual effects
- Prioritizes wig rendering over hair processing

You can also manually select "Normal" mode to disable hair processing entirely.

### What are the system requirements?

**Minimum Requirements:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- WebGL support
- Camera access
- JavaScript enabled
- 2GB+ RAM recommended

**Optimal Performance:**
- Desktop or recent mobile device (2020+)
- Good lighting conditions
- Stable internet for initial model download (~3MB)

### Does it work on mobile devices?

Yes! The feature is optimized for mobile devices. However, performance varies based on device capabilities. Newer devices (2020+) provide the best experience.

## Troubleshooting

### The hair detection isn't working. What should I do?

**Try these steps:**
1. Ensure good lighting (bright, even, from the front)
2. Remove hats or head coverings
3. Center your face in the camera view
4. Clean your camera lens
5. Refresh the page and try again
6. Check that your browser supports WebGL

### The flattening looks unnatural. How can I improve it?

**Tips for better results:**
- Ensure good lighting without harsh shadows
- Keep your face centered and at eye level
- Avoid extreme head angles
- Try different adjustment modes
- Use the comparison view to see the difference

### I see a "low confidence" warning. What does this mean?

This means the AI isn't confident about the hair detection, usually due to:
- Poor lighting conditions
- Blurry camera feed
- Obstructions (hands, hats, etc.)
- Extreme angles or distance

**Solutions:**
- Move to a brighter area
- Ensure your face is clearly visible
- Remove any obstructions
- Hold your device steady

### The feature isn't loading. What's wrong?

**Common causes:**
1. **Browser compatibility** - Update to the latest browser version
2. **Network issues** - Check your internet connection (needed for initial model download)
3. **WebGL disabled** - Enable WebGL in browser settings
4. **Camera blocked** - Allow camera access when prompted

**Fallback:** If the feature fails to load, the AR try-on will work normally without hair flattening.

### Why does my volume score seem wrong?

The volume score is calculated based on:
- Amount of hair visible in the frame
- Hair density and distribution
- Distance from camera

**If the score seems incorrect:**
- Ensure your full head is visible in frame
- Check that lighting isn't creating shadows that look like hair
- Remove any hats or accessories
- Try adjusting your distance from the camera

### The wig doesn't align properly with flattening. What should I do?

**Try these steps:**
1. Ensure your face is centered and at eye level
2. Avoid extreme head angles (> 45 degrees)
3. Check that lighting is even
4. Try switching modes and back
5. Refresh the page if the issue persists

### Performance is poor. How can I improve it?

**Performance tips:**
1. Close other browser tabs and applications
2. Use "Normal" mode to disable hair processing
3. Ensure good lighting (reduces processing complexity)
4. Use a desktop or newer mobile device
5. Clear browser cache and refresh

The system automatically adjusts quality on lower-end devices, but you can also manually disable features for better performance.

## Hair-Specific Questions

### I'm bald. Will this feature work for me?

Yes! If the system detects minimal hair (volume score < 5), it automatically skips flattening and proceeds with standard wig rendering. You can also manually select "Bald" mode for the most accurate preview.

### I have very short hair. Should I use flattening?

It depends on your preference. With very short hair (volume score < 20), flattening may not make a significant difference. Try the comparison view to see if flattening improves the preview for you.

### I have very long/thick hair. Will flattening work?

Yes! The system is designed to handle high hair volumes (scores up to 100). With very thick hair, flattening is especially important for a realistic preview. The system automatically applies flattening for volume scores above 40.

### I'm wearing a hat. Can I still use the feature?

The system will detect the hat and suggest removing it for best results. Hats interfere with hair detection and wig alignment. For the most accurate preview, remove any head coverings before starting the AR session.

### My hair is dyed an unusual color. Will it be detected?

Yes! The AI is trained on diverse hair colors including fashion colors (blue, green, pink, purple, etc.). As long as there's contrast between your hair and background, it should be detected accurately.

### I have braids/locs/extensions. Will this work?

Yes! The system detects various hairstyles including braids, locs, and extensions. However, very complex hairstyles may affect detection accuracy. Try the feature and use the comparison view to see if the results look realistic.

## Privacy and Security

### Is my data being collected?

No. All processing happens on your device. No images, camera data, or personal information is collected, stored, or transmitted to servers.

### Can I use this feature offline?

After the initial model download (~3MB), the feature works offline. However, you need an internet connection the first time you use it to download the AI models.

### Is this feature secure?

Yes. The feature uses:
- Client-side processing only
- Secure model loading with integrity verification
- No data transmission to servers
- Automatic data cleanup when sessions end

### What data is stored on my device?

Only the AI models (~3MB) are cached in your browser for faster loading on subsequent uses. No camera data, images, or personal information is stored.

## Feature Limitations

### What are the current limitations?

- **Lighting dependency**: Requires good lighting for accurate detection
- **Processing power**: May be slow on older devices
- **Hair coverage**: Works best when hair is fully visible
- **Single face**: Designed for one person at a time
- **Head rotation**: Optimal within ±45 degrees

### Will this feature improve over time?

Yes! We continuously improve the AI models and algorithms based on user feedback and new research. Updates are delivered automatically through your browser.

### Can I suggest improvements?

Absolutely! We welcome feedback. Contact support with your suggestions, and let us know about any issues you encounter.

## Comparison with Real Wigs

### How accurate is the preview compared to wearing a real wig?

The preview is designed to be as realistic as possible, but there are some differences:

**What's accurate:**
- Overall wig appearance and color
- Approximate fit and positioning
- General style and length

**What may differ:**
- Exact texture and shine
- Weight and feel
- Precise fit (everyone's head is unique)
- Hair movement and flow

**Recommendation:** Use the AR preview as a guide, but remember that the actual wig may look slightly different when worn.

### Should I trust the flattened or normal view more?

For most users, the **flattened view** is more accurate because it simulates wearing a wig cap. However, if you plan to wear the wig without a wig cap (not recommended for most wigs), the normal view may be more relevant.

### Can this replace trying on wigs in person?

No. While AR try-on with hair flattening provides a realistic preview, it's not a perfect substitute for trying on physical wigs. We recommend:
1. Use AR to narrow down your choices
2. Order samples or visit a store to try on finalists
3. Make your final decision after seeing the wig in person

## Getting Help

### Where can I find more information?

- [User Guide](./SMART_HAIR_FLATTENING_USER_GUIDE.md) - Complete feature documentation
- [Troubleshooting Guide](./SMART_HAIR_FLATTENING_TROUBLESHOOTING.md) - Solutions to common issues
- [Browser Compatibility](./SMART_HAIR_FLATTENING_COMPATIBILITY.md) - System requirements

### How do I report a bug or issue?

Contact our support team with:
- Description of the issue
- Browser and device information
- Screenshots if possible
- Steps to reproduce the problem

### Can I disable this feature permanently?

Yes. Simply select "Normal" mode in the adjustment toggle. Your preference is saved and will be remembered for future sessions.

### Is there a tutorial or demo?

Yes! When you first use the feature, you'll see informational messages explaining how it works. You can also use the comparison view to understand the effects of different modes.

---

**Still have questions?** Contact our support team or check the [User Guide](./SMART_HAIR_FLATTENING_USER_GUIDE.md) for more detailed information.
