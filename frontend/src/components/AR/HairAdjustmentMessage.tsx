import React, { useEffect, useState, useCallback } from 'react';

interface HairAdjustmentMessageProps {
  show: boolean;
  onDismiss: () => void;
  autoHideDuration?: number; // default 4000ms
}

/**
 * HairAdjustmentMessage Component
 * 
 * Displays an informational message when hair flattening is automatically applied.
 * Includes a visual indicator pointing to the adjustment toggle and auto-hides after a duration.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * 
 * Features:
 * - Auto-show when flattening is applied (< 200ms)
 * - Auto-hide after 4 seconds (configurable)
 * - Manual dismiss option
 * - Visual arrow indicator pointing to adjustment toggle
 * - Halloween theme styling
 */
export const HairAdjustmentMessage: React.FC<HairAdjustmentMessageProps> = ({
  show,
  onDismiss,
  autoHideDuration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle show/hide with timing tracking
  useEffect(() => {
    if (show && !isVisible) {
      const startTime = performance.now();
      setIsVisible(true);

      // Verify show timing requirement (< 200ms)
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        if (duration > 200) {
          console.warn(`Message display took ${duration.toFixed(2)}ms, exceeding 200ms requirement`);
        }
      });
    } else if (!show && isVisible) {
      setIsVisible(false);
    }
  }, [show, isVisible]);

  // Auto-hide after duration
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [isVisible, autoHideDuration]);

  // Handle manual dismiss
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss();
  }, [onDismiss]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-md w-full px-4 animate-fade-in">
      <div className="bg-halloween-purple/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-halloween-orange/30 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-halloween-orange/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-halloween-orange"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Message content */}
          <div className="flex-1 pr-6">
            <h3 className="text-white font-semibold text-base mb-2">
              Hair Adjusted for Best Results
            </h3>
            <p className="text-white/90 text-sm leading-relaxed">
              For best results, your hair has been adjusted to fit under the wig. You can change this below.
            </p>
          </div>
        </div>

        {/* Arrow indicator pointing down */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            {/* Arrow */}
            <svg
              className="w-6 h-6 text-halloween-purple animate-bounce"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
            {/* Glow effect */}
            <div className="absolute inset-0 blur-sm">
              <svg
                className="w-6 h-6 text-halloween-orange opacity-50"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-hide */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-halloween-orange transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${autoHideDuration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HairAdjustmentMessage;
