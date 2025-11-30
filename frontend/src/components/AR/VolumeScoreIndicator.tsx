/**
 * Volume Score Indicator Component
 * 
 * Displays the hair volume score as a visual gauge (0-100) with category label.
 * Updates within 200ms of detection completion.
 * Styled with Halloween theme colors.
 * 
 * Requirements: 1.4
 */

import React, { useEffect, useState } from 'react';
import { VolumeCategory } from '../../engine/HairVolumeDetector';

interface VolumeScoreIndicatorProps {
  score: number; // 0-100
  category: VolumeCategory;
  isVisible?: boolean;
  className?: string;
}

export const VolumeScoreIndicator: React.FC<VolumeScoreIndicatorProps> = ({
  score,
  category,
  isVisible = true,
  className = '',
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate score changes within 200ms
  useEffect(() => {
    setIsAnimating(true);
    const startTime = performance.now();
    const startScore = displayScore;
    const targetScore = score;
    const duration = 200; // 200ms as per requirement

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = startScore + (targetScore - startScore) * easeProgress;
      
      setDisplayScore(Math.round(currentScore));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Get color based on volume score (Halloween theme)
  const getScoreColor = (score: number): string => {
    if (score < 20) return '#10b981'; // halloween-green (minimal)
    if (score < 50) return '#f97316'; // halloween-orange (moderate)
    if (score < 75) return '#8b5cf6'; // halloween-purple (high)
    return '#dc2626'; // red (very-high)
  };

  // Get category display text
  const getCategoryText = (category: VolumeCategory): string => {
    const categoryMap: Record<VolumeCategory, string> = {
      'minimal': 'Minimal',
      'moderate': 'Moderate',
      'high': 'High',
      'very-high': 'Very High',
    };
    return categoryMap[category];
  };

  // Get category icon
  const getCategoryIcon = (category: VolumeCategory): string => {
    const iconMap: Record<VolumeCategory, string> = {
      'minimal': '▁',
      'moderate': '▃',
      'high': '▅',
      'very-high': '▇',
    };
    return iconMap[category];
  };

  if (!isVisible) {
    return null;
  }

  const scoreColor = getScoreColor(displayScore);
  const categoryText = getCategoryText(category);
  const categoryIcon = getCategoryIcon(category);

  return (
    <div
      className={`bg-halloween-darkPurple/90 backdrop-blur-sm rounded-lg p-4 border-2 border-halloween-purple/50 shadow-lg ${className}`}
      style={{
        transition: 'all 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">💇</span>
          Hair Volume
        </h4>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
            border: `1px solid ${scoreColor}`,
          }}
        >
          {categoryIcon} {categoryText}
        </span>
      </div>

      {/* Score Display */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-white">
            {displayScore}
          </span>
          <span className="text-sm text-gray-400">/100</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-black/50 rounded-full overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-halloween-green via-halloween-orange to-halloween-purple opacity-20" />
          
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${displayScore}%`,
              backgroundColor: scoreColor,
              boxShadow: `0 0 10px ${scoreColor}80`,
            }}
          >
            {/* Animated shimmer effect */}
            {isAnimating && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'shimmer 0.6s ease-out',
                }}
              />
            )}
          </div>

          {/* Threshold marker at 40 */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: '40%' }}
            title="Auto-flatten threshold"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* Threshold label */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0</span>
          <span className="text-white/70">Auto-flatten at 40+</span>
          <span>100</span>
        </div>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {displayScore > 40 ? (
          <>
            <span className="text-halloween-orange">●</span> Hair flattening recommended for best wig fit
          </>
        ) : (
          <>
            <span className="text-halloween-green">●</span> Hair volume is low, flattening not needed
          </>
        )}
      </p>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default VolumeScoreIndicator;
