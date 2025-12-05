import React, { useState } from 'react';
import { SocialShareService, SocialPlatform } from '../../services/socialShare.service';
import { ScreenshotService } from '../../services/screenshot.service';

interface SocialShareModalProps {
  screenshot: Blob | null;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  screenshot,
  productName,
  isOpen,
  onClose,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (screenshot && isOpen) {
      const url = URL.createObjectURL(screenshot);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [screenshot, isOpen]);

  if (!isOpen || !screenshot) return null;

  const handleShare = async (platform: SocialPlatform) => {
    setIsSharing(true);
    setShareMessage(null);

    try {
      const shareText = SocialShareService.generateShareText(productName);
      const shareOptions = {
        text: shareText,
        title: 'My Spooky Styles Look 🎃',
      };

      switch (platform) {
        case 'native': {
          const shared = await SocialShareService.shareNative(screenshot, shareOptions);
          if (shared) {
            setShareMessage('Shared successfully! 🎉');
          }
          break;
        }

        case 'facebook':
          // Download first, then open Facebook
          ScreenshotService.downloadScreenshot(screenshot, 'spooky-styles-tryOn.png');
          SocialShareService.shareToFacebook(shareOptions);
          setShareMessage('Screenshot downloaded! Upload it to your Facebook post. 📘');
          break;

        case 'twitter':
          // Download first, then open Twitter
          ScreenshotService.downloadScreenshot(screenshot, 'spooky-styles-tryOn.png');
          SocialShareService.shareToTwitter(shareOptions);
          setShareMessage('Screenshot downloaded! Attach it to your tweet. 🐦');
          break;

        case 'instagram': {
          const instagramResult = SocialShareService.shareToInstagram();
          ScreenshotService.downloadScreenshot(screenshot, 'spooky-styles-tryOn.png');
          setShareMessage(instagramResult.message);
          if (instagramResult.action) {
            setTimeout(instagramResult.action, 1000);
          }
          break;
        }
      }
    } catch (error: any) {
      console.error('Share error:', error);
      if (error.message.includes('not supported')) {
        setShareMessage('Sharing is not supported on this device. Screenshot has been downloaded! 📥');
        ScreenshotService.downloadScreenshot(screenshot, 'spooky-styles-tryOn.png');
      } else {
        setShareMessage('Failed to share. Please try again. ❌');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (screenshot) {
      ScreenshotService.downloadScreenshot(screenshot, 'spooky-styles-tryOn.png');
      setShareMessage('Screenshot downloaded! 📥');
    }
  };

  const handleCopyLink = async () => {
    try {
      await SocialShareService.copyLinkToClipboard();
      setShareMessage('Link copied to clipboard! 📋');
    } catch (error) {
      setShareMessage('Failed to copy link. ❌');
    }
  };

  const availablePlatforms = SocialShareService.getAvailableShareOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-halloween-orange">
            Share Your Spooky Look! 🎃
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview */}
          {previewUrl && (
            <div className="mb-6">
              <img
                src={previewUrl}
                alt="Screenshot preview"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Share Message */}
          {shareMessage && (
            <div className="mb-6 p-4 bg-purple-900/50 border border-purple-500 rounded-lg">
              <p className="text-white text-center">{shareMessage}</p>
            </div>
          )}

          {/* Share Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Share to Social Media
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={isSharing}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  <span className="text-xl">
                    {SocialShareService.getPlatformIcon(platform)}
                  </span>
                  <span>{SocialShareService.getPlatformName(platform)}</span>
                </button>
              ))}
            </div>

            {/* Additional Actions */}
            <div className="pt-4 border-t border-gray-700 space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <span className="text-xl">💾</span>
                <span>Download Screenshot</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                <span className="text-xl">🔗</span>
                <span>Copy Product Link</span>
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300 text-sm text-center">
                💡 <strong>Tip:</strong> Tag us @SpookyStyles and use #SpookyStyles #Halloween 
                to be featured on our page!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
