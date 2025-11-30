import React, { useCallback, useRef } from 'react';
import { AdjustmentMode } from '../../engine/HairFlatteningEngine';

interface AdjustmentModeToggleProps {
  currentMode: AdjustmentMode;
  onModeChange: (mode: AdjustmentMode) => void;
  volumeScore: number;
  disabled?: boolean;
}

/**
 * AdjustmentModeToggle Component
 * 
 * Three-option toggle for hair adjustment modes: Normal, Flattened (recommended), Bald (optional)
 * Highlights the recommended option and displays volume score indicator
 * 
 * Requirements: 4.1, 4.5
 */
export const AdjustmentModeToggle: React.FC<AdjustmentModeToggleProps> = ({
  currentMode,
  onModeChange,
  volumeScore,
  disabled = false,
}) => {
  const startTimeRef = useRef<number>(0);

  // Handle mode change with performance tracking
  const handleModeChange = useCallback((mode: AdjustmentMode) => {
    if (disabled || mode === currentMode) return;

    startTimeRef.current = performance.now();
    onModeChange(mode);

    // Verify response time requirement (< 250ms)
    requestAnimationFrame(() => {
      const duration = performance.now() - startTimeRef.current;
      if (duration > 250) {
        console.warn(`Mode change took ${duration.toFixed(2)}ms, exceeding 250ms requirement`);
      }
    });
  }, [currentMode, onModeChange, disabled]);

  // Determine if flattened mode should be recommended
  const isRecommended = volumeScore > 40;

  return (
    <div className="bg-black bg-opacity-70 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">
          Hair Adjustment
        </h3>
        {volumeScore > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Volume:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-halloween-green to-halloween-orange transition-all duration-300"
                  style={{ width: `${volumeScore}%` }}
                />
              </div>
              <span className="text-white text-xs font-medium min-w-[2rem]">
                {volumeScore}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {/* Normal Mode */}
        <button
          onClick={() => handleModeChange(AdjustmentMode.NORMAL)}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${currentMode === AdjustmentMode.NORMAL
              ? 'bg-halloween-purple text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label="Normal mode - show original hair"
          aria-pressed={currentMode === AdjustmentMode.NORMAL}
        >
          <div className="flex flex-col items-center gap-1">
            <span>Normal</span>
            {currentMode === AdjustmentMode.NORMAL && (
              <div className="w-1 h-1 bg-white rounded-full" />
            )}
          </div>
        </button>

        {/* Flattened Mode (Recommended) */}
        <button
          onClick={() => handleModeChange(AdjustmentMode.FLATTENED)}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all relative
            ${currentMode === AdjustmentMode.FLATTENED
              ? 'bg-halloween-orange text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label="Flattened mode - recommended for realistic wig preview"
          aria-pressed={currentMode === AdjustmentMode.FLATTENED}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span>Flattened</span>
              {isRecommended && (
                <svg
                  className="w-3 h-3 text-halloween-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="Recommended"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {isRecommended && (
              <span className="text-[10px] text-halloween-green font-semibold">
                Recommended
              </span>
            )}
            {currentMode === AdjustmentMode.FLATTENED && !isRecommended && (
              <div className="w-1 h-1 bg-white rounded-full" />
            )}
          </div>
        </button>

        {/* Bald Mode (Optional, Preview Only) */}
        <button
          onClick={() => handleModeChange(AdjustmentMode.BALD)}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${currentMode === AdjustmentMode.BALD
              ? 'bg-halloween-purple text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label="Bald mode - preview only, removes all hair"
          aria-pressed={currentMode === AdjustmentMode.BALD}
        >
          <div className="flex flex-col items-center gap-1">
            <span>Bald</span>
            <span className="text-[10px] text-gray-400">Preview</span>
            {currentMode === AdjustmentMode.BALD && (
              <div className="w-1 h-1 bg-white rounded-full absolute bottom-1" />
            )}
          </div>
        </button>
      </div>

      {/* Mode descriptions */}
      <div className="mt-3 text-xs text-gray-400">
        {currentMode === AdjustmentMode.NORMAL && (
          <p>Showing your natural hair without adjustments</p>
        )}
        {currentMode === AdjustmentMode.FLATTENED && (
          <p>Hair flattened to simulate wearing a wig cap</p>
        )}
        {currentMode === AdjustmentMode.BALD && (
          <p>Preview only - shows how the wig looks without hair</p>
        )}
      </div>

      {/* Disabled state message */}
      {disabled && (
        <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Hair segmentation unavailable</span>
        </div>
      )}
    </div>
  );
};

export default AdjustmentModeToggle;
