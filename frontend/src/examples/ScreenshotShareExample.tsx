/**
 * Screenshot and Social Share Example
 * Demonstrates the screenshot capture and social sharing functionality
 */

import React, { useRef, useState } from 'react';
import { ScreenshotService } from '../services/screenshot.service';
import { SocialShareService } from '../services/socialShare.service';
import { SocialShareModal } from '../components/AR/SocialShareModal';

const ScreenshotShareExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Draw a sample scene on the canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a Halloween-themed sample
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some spooky elements
    ctx.fillStyle = '#FF6B35';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎃 Spooky Styles AR 👻', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#F7931E';
    ctx.font = '24px Arial';
    ctx.fillText('Virtual Try-On Experience', canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#9D4EDD';
    ctx.font = '18px Arial';
    ctx.fillText('Click "Capture Screenshot" to test!', canvas.width / 2, canvas.height / 2 + 60);
  }, []);

  const handleCaptureScreenshot = async () => {
    if (!canvasRef.current) return;

    try {
      setMessage('Capturing screenshot...');
      
      const blob = await ScreenshotService.captureFromCanvas(canvasRef.current, {
        width: 1920,
        height: 1080,
        addWatermark: true,
        quality: 1.0,
      });

      await ScreenshotService.storeScreenshot(blob, 'example-product-123');
      setScreenshot(blob);
      setShowShareModal(true);
      setMessage('Screenshot captured successfully! ✅');
    } catch (error) {
      console.error('Capture error:', error);
      setMessage('Failed to capture screenshot ❌');
    }
  };

  const handleDownloadOnly = async () => {
    if (!canvasRef.current) return;

    try {
      setMessage('Capturing and downloading...');
      
      const blob = await ScreenshotService.captureFromCanvas(canvasRef.current, {
        width: 1920,
        height: 1080,
        addWatermark: true,
      });

      ScreenshotService.downloadScreenshot(blob, 'spooky-styles-example.png');
      setMessage('Screenshot downloaded! 📥');
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Failed to download screenshot ❌');
    }
  };

  const handleTestNativeShare = async () => {
    if (!canvasRef.current) return;

    try {
      if (!SocialShareService.isNativeShareSupported()) {
        setMessage('Native sharing not supported on this device ⚠️');
        return;
      }

      setMessage('Preparing to share...');
      
      const blob = await ScreenshotService.captureFromCanvas(canvasRef.current);
      
      const shared = await SocialShareService.shareNative(blob, {
        title: 'Spooky Styles Example',
        text: 'Testing the screenshot share functionality!',
      });

      if (shared) {
        setMessage('Shared successfully! 🎉');
      } else {
        setMessage('Share cancelled');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      setMessage(`Share failed: ${error.message} ❌`);
    }
  };

  const handleCopyLink = async () => {
    try {
      await SocialShareService.copyLinkToClipboard();
      setMessage('Link copied to clipboard! 📋');
    } catch (error) {
      setMessage('Failed to copy link ❌');
    }
  };

  const handleClearStorage = () => {
    ScreenshotService.clearStoredScreenshots();
    setMessage('Storage cleared! 🗑️');
  };

  const storedCount = ScreenshotService.getStoredScreenshots().length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <SocialShareModal
        screenshot={screenshot}
        productName="Example Halloween Wig"
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-halloween-orange mb-4">
          Screenshot & Share Example 🎃
        </h1>
        <p className="text-gray-400 mb-8">
          Test the screenshot capture and social sharing functionality
        </p>

        {/* Canvas */}
        <div className="mb-8 bg-gray-800 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 bg-purple-900/50 border border-purple-500 rounded-lg">
            <p className="text-white text-center">{message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleCaptureScreenshot}
            className="px-6 py-3 bg-halloween-orange hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            📸 Capture Screenshot (with modal)
          </button>

          <button
            onClick={handleDownloadOnly}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            💾 Download Screenshot
          </button>

          <button
            onClick={handleTestNativeShare}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            disabled={!SocialShareService.isNativeShareSupported()}
          >
            📤 Test Native Share
          </button>

          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            🔗 Copy Product Link
          </button>
        </div>

        {/* Platform Share Buttons */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-halloween-orange mb-4">
            Direct Platform Sharing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => SocialShareService.shareToFacebook()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              📘 Share to Facebook
            </button>

            <button
              onClick={() => SocialShareService.shareToTwitter()}
              className="px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
            >
              🐦 Share to Twitter
            </button>

            <button
              onClick={() => {
                const result = SocialShareService.shareToInstagram();
                setMessage(result.message);
                if (result.action) result.action();
              }}
              className="px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
            >
              📷 Share to Instagram
            </button>
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-halloween-orange mb-4">
            Storage Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Stored Screenshots:</span>
              <span className="text-white font-semibold">{storedCount} / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Storage Expiry:</span>
              <span className="text-white font-semibold">24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Native Share Support:</span>
              <span className={`font-semibold ${
                SocialShareService.isNativeShareSupported() 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {SocialShareService.isNativeShareSupported() ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <button
              onClick={handleClearStorage}
              className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              🗑️ Clear Storage
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-halloween-orange mb-4">
            Implemented Features ✅
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Screenshot capture at 1080p minimum resolution</li>
            <li>✅ Automatic watermark with SpookyStyles branding</li>
            <li>✅ Social sharing UI with platform options</li>
            <li>✅ Platform-specific sharing (Facebook, Twitter, Instagram)</li>
            <li>✅ Native Web Share API integration</li>
            <li>✅ Product catalog link in shared content</li>
            <li>✅ Temporary browser storage (up to 5 screenshots, 24h expiry)</li>
            <li>✅ Download functionality</li>
            <li>✅ Copy link to clipboard</li>
            <li>✅ Mobile and desktop support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotShareExample;
