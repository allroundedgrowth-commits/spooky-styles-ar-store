# Smart Hair Flattening User Guide

## Overview

The Smart Hair Flattening feature enhances your AR wig try-on experience by automatically detecting and adjusting for your existing hair volume. This creates a more realistic preview of how wigs would look when worn with a wig cap, without forcing you into an unrealistic bald appearance.

## What is Smart Hair Flattening?

When you try on a wig in real life, you typically wear a wig cap that compresses and contains your natural hair underneath. Smart Hair Flattening simulates this effect digitally, giving you a more accurate preview of how the wig will actually look when worn.

### Key Benefits

- **More Realistic Previews**: See how wigs look with your hair properly contained
- **Automatic Detection**: AI automatically detects your hair volume
- **User Control**: Choose from three adjustment modes to suit your preference
- **Respectful Approach**: Soft flattening instead of complete hair removal
- **Real-Time Updates**: Adjustments happen instantly as you move

## Getting Started

### Step 1: Start an AR Try-On Session

1. Navigate to any product page with AR try-on capability
2. Click the "Try with AR" button
3. Allow camera access when prompted
4. Position your face in the camera view

### Step 2: Automatic Hair Detection

The system will automatically:
- Detect your hair using AI segmentation
- Calculate your hair volume (0-100 score)
- Apply flattening if your volume score is above 40
- Show you an informational message explaining the adjustment

### Step 3: Choose Your Adjustment Mode

You'll see three options in the adjustment toggle:

1. **Normal**: Shows your original hair without any adjustment
2. **Flattened (recommended)**: Applies soft hair flattening (60-80% volume reduction)
3. **Bald (optional, preview only)**: Removes all visible hair for maximum wig visibility

The system automatically selects "Flattened" mode if your hair volume is high, but you can change this at any time.

## Understanding the Three Adjustment Modes

### Normal Mode

**When to use:**
- You want to see the wig with your natural hair volume
- You're curious about the difference flattening makes
- You prefer to see your original appearance

**What it does:**
- Displays your hair exactly as captured by the camera
- No volume reduction or processing
- Wig is rendered on top of your natural hair

**Best for:**
- Users with minimal hair volume
- Comparing before and after effects
- Personal preference for natural look

### Flattened Mode (Recommended)

**When to use:**
- You want the most realistic wig preview
- You have moderate to high hair volume
- You want to see how the wig looks with a wig cap

**What it does:**
- Reduces visible hair volume by 60-80%
- Preserves your natural scalp and head shape
- Creates smooth transitions between hair and scalp
- Maintains realistic lighting and shadows

**Best for:**
- Most users (automatically selected when volume > 40)
- Realistic wig cap simulation
- Accurate fit preview

### Bald Mode (Optional, Preview Only)

**When to use:**
- You want maximum wig visibility
- You're curious about the wig's full appearance
- You want to see the wig without any hair interference

**What it does:**
- Removes all visible hair pixels
- Preserves natural scalp appearance and skin tone
- Shows the wig as if worn on a bald head

**Best for:**
- Users who are bald or have very short hair
- Seeing the wig's complete design
- Maximum clarity preview

**Note:** This mode is labeled "preview only" because it may not represent how the wig looks on you in real life if you have hair.

## Understanding Your Volume Score

The volume score (0-100) indicates how much hair volume the system detected:

- **0-20 (Minimal)**: Very little hair detected
  - Flattening may not be necessary
  - System may skip automatic flattening
  
- **21-40 (Moderate)**: Some hair volume present
  - Flattening is optional
  - You can choose based on preference
  
- **41-70 (High)**: Significant hair volume
  - Flattening is recommended
  - Automatically applied for best results
  
- **71-100 (Very High)**: Maximum hair volume
  - Flattening is strongly recommended
  - Provides most realistic preview

The volume score is displayed as a visual indicator in the AR interface.

## Using the Comparison View

The comparison view lets you see before and after side-by-side:

1. Click the "Compare" button in the AR interface
2. View split-screen showing:
   - Left: Original (your natural hair)
   - Right: Current adjustment mode
3. Switch between modes to see different effects
4. Capture screenshots showing both views

**Tips:**
- Use comparison to understand the flattening effect
- Share comparison screenshots with friends
- Help decide which mode looks best for you

## Informational Messages

### Hair Adjustment Message

When flattening is automatically applied, you'll see:

> "For best results, your hair has been adjusted to fit under the wig. You can change this below."

This message:
- Appears within 200ms of flattening being applied
- Stays visible for 4 seconds (or until you dismiss it)
- Includes an arrow pointing to the adjustment toggle
- Can be dismissed by clicking the X button

### Low Confidence Warning

If the system has trouble detecting your hair clearly:

> "Hair detection confidence is low. Try better lighting or camera positioning."

**What to do:**
- Move to a brighter area
- Ensure your face is well-lit from the front
- Avoid backlighting (light behind you)
- Clean your camera lens
- Hold your device steady

## Tips for Best Results

### Lighting

**Good Lighting:**
- Bright, even lighting from the front
- Natural daylight (not direct sunlight)
- Well-lit indoor spaces
- Multiple light sources to reduce shadows

**Avoid:**
- Backlighting (light behind you)
- Very dim environments
- Harsh shadows on your face
- Colored lighting that distorts appearance

### Camera Position

**Optimal Position:**
- Face centered in the frame
- Camera at eye level
- 1-2 feet distance from camera
- Face fully visible

**Avoid:**
- Extreme angles (looking up or down)
- Face too close or too far
- Partial face visibility
- Multiple people in frame

### Hair Preparation

**For Best Detection:**
- Hair should be visible and not covered
- Remove hats or head coverings
- Ensure hair is in its natural state
- Avoid hair accessories that obscure volume

**Note:** If you're wearing a hat, the system will suggest removing it for best results.

### Movement

**During AR Session:**
- Move your head slowly and naturally
- Avoid sudden movements
- Stay within the camera frame
- Allow the system to track your face

**Performance:**
- System updates at 15+ frames per second
- Flattening adjusts in real-time
- Wig alignment updates automatically

## Troubleshooting

See the [Troubleshooting Guide](./SMART_HAIR_FLATTENING_TROUBLESHOOTING.md) for detailed solutions to common issues.

## Privacy and Security

Your privacy is important:

- **All processing happens on your device** - no images are uploaded to servers
- **No data storage** - camera frames are processed and immediately discarded
- **Session cleanup** - all data is cleared when you close the AR session
- **Secure model loading** - AI models are loaded with integrity verification

## Browser Compatibility

See the [Browser Compatibility Guide](./SMART_HAIR_FLATTENING_COMPATIBILITY.md) for detailed requirements.

**Minimum Requirements:**
- WebGL support
- Camera access
- TensorFlow.js compatibility
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Performance

The system is optimized for smooth performance:

- **Segmentation**: < 500ms initial detection
- **Flattening**: < 300ms processing
- **Frame Rate**: 24+ FPS overall, 15+ FPS for segmentation
- **Memory**: < 100MB additional usage

On lower-end devices, the system automatically adjusts quality to maintain performance.

## Frequently Asked Questions

See the [FAQ](./SMART_HAIR_FLATTENING_FAQ.md) for answers to common questions.

## Need Help?

If you encounter issues:

1. Check the [Troubleshooting Guide](./SMART_HAIR_FLATTENING_TROUBLESHOOTING.md)
2. Review the [FAQ](./SMART_HAIR_FLATTENING_FAQ.md)
3. Ensure your browser meets [compatibility requirements](./SMART_HAIR_FLATTENING_COMPATIBILITY.md)
4. Contact support with details about your issue

## Technical Details

For developers and technical users, see:
- [Technical Architecture](./SMART_HAIR_FLATTENING_TECHNICAL.md)
- [API Documentation](./HAIR_FLATTENING_ENGINE_README.md)
- [Integration Guide](./SIMPLE2DAR_HAIR_FLATTENING_INTEGRATION.md)
