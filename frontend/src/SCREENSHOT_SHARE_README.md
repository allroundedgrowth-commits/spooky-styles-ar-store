# Screenshot Capture and Social Sharing

## Quick Start

### Basic Usage in AR Try-On

The screenshot and social sharing functionality is already integrated into the AR Try-On page. Users can:

1. Click the **"📸 Screenshot"** button during an AR session
2. View the captured screenshot with watermark
3. Choose to share on social media or download
4. Share to Facebook, Twitter, Instagram, or use native sharing

### Code Example

```typescript
import { ScreenshotService } from '../services/screenshot.service';
import { SocialShareService } from '../services/socialShare.service';
import { SocialShareModal } from '../components/AR/SocialShareModal';

// Capture screenshot from canvas
const screenshot = await ScreenshotService.captureFromCanvas(canvas, {
  width: 1920,
  height: 1080,
  addWatermark: true,
  quality: 1.0,
});

// Store temporarily
await ScreenshotService.storeScreenshot(screenshot, productId);

// Show share modal
<SocialShareModal
  screenshot={screenshot}
  productName="Halloween Wig"
  isOpen={true}
  onClose={() => {}}
/>
```

## Services

### ScreenshotService

Handles screenshot capture, watermarking, and storage.

#### Methods

**`captureFromCanvas(canvas, options?)`**
- Captures screenshot at specified resolution
- Adds watermark if enabled
- Returns PNG blob

```typescript
const screenshot = await ScreenshotService.captureFromCanvas(canvas, {
  width: 1920,      // Width in pixels
  height: 1080,     // Height in pixels
  addWatermark: true, // Add SpookyStyles branding
  quality: 1.0,     // PNG quality (0-1)
});
```

**`storeScreenshot(blob, productId?)`**
- Stores screenshot in browser storage
- Maximum 5 screenshots
- 24-hour expiration
- Returns StoredScreenshot object

**`getStoredScreenshots()`**
- Retrieves all stored screenshots
- Filters out expired items
- Returns array of metadata

**`clearStoredScreenshots()`**
- Removes all stored screenshots
- Cleans up blob URLs

**`downloadScreenshot(blob, filename?)`**
- Downloads screenshot as file
- Default filename: `spooky-styles-{timestamp}.png`

### SocialShareService

Handles platform-specific social sharing.

#### Methods

**`isNativeShareSupported()`**
- Checks if Web Share API is available
- Returns boolean

**`shareNative(blob, options?)`**
- Uses native share sheet on mobile
- Shares image file directly
- Returns promise resolving to boolean

```typescript
const shared = await SocialShareService.shareNative(blob, {
  title: 'My Spooky Look',
  text: 'Check out my AR try-on!',
  url: 'https://spookystyles.com',
});
```

**`shareToFacebook(options?)`**
- Opens Facebook share dialog
- Includes product link

**`shareToTwitter(options?)`**
- Opens Twitter compose
- Includes hashtags and link

```typescript
SocialShareService.shareToTwitter({
  text: 'Just tried on this wig!',
  hashtags: ['SpookyStyles', 'Halloween'],
});
```

**`shareToInstagram()`**
- Provides Instagram sharing instructions
- Opens Instagram app on mobile
- Returns object with message and action

**`generateShareText(productName?)`**
- Generates share text with product info
- Includes emojis and branding

**`copyLinkToClipboard(url?)`**
- Copies link to clipboard
- Fallback for older browsers

## Components

### SocialShareModal

Modal component for screenshot preview and sharing.

#### Props

```typescript
interface SocialShareModalProps {
  screenshot: Blob | null;      // Screenshot blob to share
  productName?: string;         // Product name for share text
  isOpen: boolean;              // Modal visibility
  onClose: () => void;          // Close handler
}
```

#### Features

- Screenshot preview
- Platform selection buttons
- Download option
- Copy link option
- Success/error messages
- Responsive design

## Watermark

The watermark is automatically added to screenshots with:

- **Text**: "SpookyStyles.com 🎃"
- **Position**: Bottom-right corner
- **Style**: Halloween orange gradient
- **Background**: Semi-transparent black
- **Size**: Responsive (3% of canvas height, min 24px)

### Customization

To customize the watermark, modify the `addWatermarkToCanvas` method in `ScreenshotService`:

```typescript
private static async addWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  watermarkText: string = 'SpookyStyles.com 🎃'
): Promise<void> {
  // Customize text, position, colors, etc.
}
```

## Storage

Screenshots are stored temporarily in browser storage:

- **Location**: localStorage (metadata) + Blob URLs (images)
- **Capacity**: Maximum 5 screenshots
- **Expiration**: 24 hours
- **Cleanup**: Automatic on new screenshot or expiration

### Storage Structure

```typescript
interface StoredScreenshot {
  id: string;           // Unique identifier
  blob: Blob;           // Image blob
  url: string;          // Blob URL for display
  timestamp: number;    // Creation timestamp
  productId?: string;   // Associated product ID
}
```

## Platform Support

### Native Share (Mobile)
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Android Firefox
- ❌ Desktop browsers (fallback to platform-specific)

### Facebook
- ✅ All browsers
- Opens share dialog
- Manual image upload required

### Twitter
- ✅ All browsers
- Opens tweet composer
- Manual image upload required
- Pre-filled hashtags

### Instagram
- ✅ Mobile browsers (app opening)
- ⚠️ Desktop (instructions only)
- Manual upload required

## Error Handling

All errors are handled gracefully with user-friendly messages:

```typescript
try {
  const screenshot = await ScreenshotService.captureFromCanvas(canvas);
  // Success
} catch (error) {
  // Error message displayed to user
  // Fallback options provided
}
```

### Common Errors

- **Canvas not available**: Check canvas reference
- **Blob creation failed**: Browser compatibility issue
- **Storage quota exceeded**: Automatic cleanup triggered
- **Share cancelled**: User cancelled share (not an error)
- **Platform not supported**: Fallback to download

## Testing

### Manual Testing

Run the example page to test all features:

```bash
# The example is at: frontend/src/examples/ScreenshotShareExample.tsx
# Add it to your router to test
```

### Test Checklist

- [ ] Screenshot captures at 1080p
- [ ] Watermark appears correctly
- [ ] Share modal opens
- [ ] Native share works (mobile)
- [ ] Facebook share opens
- [ ] Twitter share opens
- [ ] Instagram instructions shown
- [ ] Download works
- [ ] Copy link works
- [ ] Storage limits enforced
- [ ] Expiration works

## Performance

- **Screenshot Capture**: ~100-200ms
- **Watermark Rendering**: ~50ms
- **Storage Operations**: <10ms
- **Modal Rendering**: Instant

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Screenshot | ✅ | ✅ | ✅ | ✅ |
| Watermark | ✅ | ✅ | ✅ | ✅ |
| Storage | ✅ | ✅ | ✅ | ✅ |
| Native Share | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Clipboard | ✅ | ✅ | ✅ | ✅ |

✅ Full support | ⚠️ Partial support (mobile only) | ❌ Not supported

## Troubleshooting

### Screenshot is blank
- Ensure canvas has content rendered
- Check if WebGL context is active
- Verify canvas is not hidden

### Watermark not showing
- Check `addWatermark: true` in options
- Verify canvas context is available
- Check browser console for errors

### Share not working
- Check browser compatibility
- Verify blob is valid
- Check network connectivity
- Try fallback download option

### Storage full
- Clear old screenshots manually
- Check localStorage quota
- Verify automatic cleanup is working

## Future Enhancements

Potential improvements for future versions:

1. **Multiple Screenshot Gallery**
   - View all stored screenshots
   - Compare different looks
   - Batch sharing

2. **Custom Watermarks**
   - User-configurable text
   - Position options
   - Style customization

3. **Additional Platforms**
   - Pinterest
   - TikTok
   - WhatsApp
   - Email

4. **Screenshot Editing**
   - Filters and effects
   - Crop and resize
   - Text overlays

5. **Cloud Storage**
   - Save to user account
   - Cross-device access
   - Permanent storage

## Support

For issues or questions:
- Check the implementation documentation: `SCREENSHOT_SHARE_IMPLEMENTATION.md`
- Review the example: `examples/ScreenshotShareExample.tsx`
- Check browser console for errors
- Verify browser compatibility

## License

Part of the Spooky Styles AR Store project.
