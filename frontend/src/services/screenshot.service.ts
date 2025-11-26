/**
 * Screenshot Service
 * Handles screenshot capture, watermarking, and temporary storage
 */

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  addWatermark?: boolean;
  quality?: number;
}

export interface StoredScreenshot {
  id: string;
  blob: Blob;
  url: string;
  timestamp: number;
  productId?: string;
}

const STORAGE_KEY = 'spooky_styles_screenshots';
const MAX_STORED_SCREENSHOTS = 5;
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ScreenshotService {
  /**
   * Add watermark to a canvas
   */
  private static async addWatermarkToCanvas(
    canvas: HTMLCanvasElement,
    watermarkText: string = 'SpookyStyles.com 🎃'
  ): Promise<void> {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Calculate watermark position and size
    const padding = 20;
    const fontSize = Math.max(24, canvas.height * 0.03);
    
    // Set up text styling
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Measure text
    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    // Position at bottom-right
    const x = canvas.width - padding;
    const y = canvas.height - padding;
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      x - textWidth - 10,
      y - textHeight - 5,
      textWidth + 20,
      textHeight + 10
    );
    
    // Draw text with gradient
    const gradient = ctx.createLinearGradient(
      x - textWidth,
      y - textHeight,
      x,
      y
    );
    gradient.addColorStop(0, '#FF6B35'); // Halloween orange
    gradient.addColorStop(1, '#F7931E');
    
    ctx.fillStyle = gradient;
    ctx.fillText(watermarkText, x, y);
    
    // Add subtle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  /**
   * Capture screenshot from canvas with optional watermark
   */
  public static async captureFromCanvas(
    canvas: HTMLCanvasElement,
    options: ScreenshotOptions = {}
  ): Promise<Blob> {
    const {
      width = 1920,
      height = 1080,
      addWatermark = true,
      quality = 1.0,
    } = options;

    // Create a temporary canvas for high-res capture
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create temporary canvas context');
    }

    // Draw the original canvas content
    ctx.drawImage(canvas, 0, 0, width, height);

    // Add watermark if requested
    if (addWatermark) {
      await this.addWatermarkToCanvas(tempCanvas);
    }

    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
      tempCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create screenshot blob'));
          }
        },
        'image/png',
        quality
      );
    });
  }

  /**
   * Store screenshot temporarily in browser storage
   */
  public static async storeScreenshot(
    blob: Blob,
    productId?: string
  ): Promise<StoredScreenshot> {
    const id = `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = URL.createObjectURL(blob);
    const timestamp = Date.now();

    const screenshot: StoredScreenshot = {
      id,
      blob,
      url,
      timestamp,
      productId,
    };

    // Get existing screenshots
    const stored = this.getStoredScreenshots();
    
    // Add new screenshot
    stored.push(screenshot);
    
    // Keep only the most recent screenshots
    const recentScreenshots = stored
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_STORED_SCREENSHOTS);
    
    // Clean up old URLs
    stored
      .filter(s => !recentScreenshots.includes(s))
      .forEach(s => URL.revokeObjectURL(s.url));

    // Store metadata (without blob)
    const metadata = recentScreenshots.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      productId: s.productId,
    }));
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to store screenshot metadata:', error);
    }

    return screenshot;
  }

  /**
   * Get stored screenshots (metadata only)
   */
  public static getStoredScreenshots(): StoredScreenshot[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const metadata = JSON.parse(stored);
      const now = Date.now();
      
      // Filter out expired screenshots
      return metadata.filter(
        (item: any) => now - item.timestamp < STORAGE_EXPIRY_MS
      );
    } catch (error) {
      console.warn('Failed to retrieve stored screenshots:', error);
      return [];
    }
  }

  /**
   * Clear all stored screenshots
   */
  public static clearStoredScreenshots(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored screenshots:', error);
    }
  }

  /**
   * Download screenshot as file
   */
  public static downloadScreenshot(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `spooky-styles-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert blob to base64 data URL
   */
  public static async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
