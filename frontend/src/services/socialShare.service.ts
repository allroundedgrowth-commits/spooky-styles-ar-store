/**
 * Social Share Service
 * Handles platform-specific sharing interfaces
 */

export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'native';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  hashtags?: string[];
}

export class SocialShareService {
  private static readonly CATALOG_URL = window.location.origin + '/products';
  private static readonly DEFAULT_HASHTAGS = ['SpookyStyles', 'Halloween', 'ARTryOn', 'VirtualTryOn'];

  /**
   * Check if Web Share API is supported
   */
  public static isNativeShareSupported(): boolean {
    return 'share' in navigator && 'canShare' in navigator;
  }

  /**
   * Share using native Web Share API
   */
  public static async shareNative(
    blob: Blob,
    options: ShareOptions = {}
  ): Promise<boolean> {
    if (!this.isNativeShareSupported()) {
      throw new Error('Native sharing is not supported on this device');
    }

    const {
      title = 'Check out my Spooky Styles look! 🎃',
      text = 'I just tried on this amazing Halloween wig using AR! Check out SpookyStyles.com for more spooky looks!',
      url = this.CATALOG_URL,
    } = options;

    try {
      const file = new File([blob], 'spooky-styles-tryOn.png', { type: 'image/png' });
      
      const shareData: ShareData = {
        title,
        text,
        url,
        files: [file],
      };

      // Check if we can share this data
      if (navigator.canShare && !navigator.canShare(shareData)) {
        // Try without files if files aren't supported
        delete shareData.files;
      }

      await navigator.share(shareData);
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }

  /**
   * Share to Facebook
   */
  public static shareToFacebook(options: ShareOptions = {}): void {
    const {
      url = this.CATALOG_URL,
      text = 'Check out my Spooky Styles AR try-on! 🎃',
    } = options;

    const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    shareUrl.searchParams.set('u', url);
    shareUrl.searchParams.set('quote', text);

    this.openShareWindow(shareUrl.toString(), 'Facebook');
  }

  /**
   * Share to Twitter (X)
   */
  public static shareToTwitter(options: ShareOptions = {}): void {
    const {
      text = 'Just tried on this amazing Halloween wig using AR! 🎃👻',
      url = this.CATALOG_URL,
      hashtags = this.DEFAULT_HASHTAGS,
    } = options;

    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', url);
    shareUrl.searchParams.set('hashtags', hashtags.join(','));

    this.openShareWindow(shareUrl.toString(), 'Twitter');
  }

  /**
   * Share to Instagram (opens Instagram app or web)
   * Note: Instagram doesn't support direct web sharing with images,
   * so we provide instructions to the user
   */
  public static shareToInstagram(): { 
    supported: boolean; 
    message: string;
    action?: () => void;
  } {
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      return {
        supported: true,
        message: 'Screenshot saved! Open Instagram and upload from your gallery. Don\'t forget to tag @SpookyStyles and use #SpookyStyles #Halloween! 🎃',
        action: () => {
          // Try to open Instagram app
          window.location.href = 'instagram://';
          // Fallback to web after a delay
          setTimeout(() => {
            window.open('https://www.instagram.com/', '_blank');
          }, 1000);
        },
      };
    }

    return {
      supported: false,
      message: 'Screenshot saved! To share on Instagram, please upload from your mobile device and tag @SpookyStyles with #SpookyStyles #Halloween! 🎃',
    };
  }

  /**
   * Copy share link to clipboard
   */
  public static async copyLinkToClipboard(url: string = this.CATALOG_URL): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Generate share text with product information
   */
  public static generateShareText(productName?: string): string {
    if (productName) {
      return `Just tried on the "${productName}" from Spooky Styles using AR! 🎃👻 Check out more spooky looks at SpookyStyles.com!`;
    }
    return 'Just tried on an amazing Halloween wig from Spooky Styles using AR! 🎃👻 Check out more spooky looks at SpookyStyles.com!';
  }

  /**
   * Open share window with proper dimensions
   */
  private static openShareWindow(url: string, platform: string): void {
    const width = 600;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
    
    window.open(url, `Share to ${platform}`, features);
  }

  /**
   * Get all available share options
   */
  public static getAvailableShareOptions(): SocialPlatform[] {
    const options: SocialPlatform[] = ['facebook', 'twitter', 'instagram'];
    
    if (this.isNativeShareSupported()) {
      options.unshift('native');
    }
    
    return options;
  }

  /**
   * Get platform display name
   */
  public static getPlatformName(platform: SocialPlatform): string {
    const names: Record<SocialPlatform, string> = {
      native: 'Share',
      facebook: 'Facebook',
      twitter: 'Twitter',
      instagram: 'Instagram',
    };
    return names[platform];
  }

  /**
   * Get platform icon emoji
   */
  public static getPlatformIcon(platform: SocialPlatform): string {
    const icons: Record<SocialPlatform, string> = {
      native: '📤',
      facebook: '📘',
      twitter: '🐦',
      instagram: '📷',
    };
    return icons[platform];
  }
}
