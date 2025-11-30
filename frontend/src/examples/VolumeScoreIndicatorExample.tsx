/**
 * Volume Score Indicator Example
 * 
 * Demonstrates the VolumeScoreIndicator component with different scores and categories.
 */

import React, { useState, useEffect } from 'react';
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';
import { VolumeCategory } from '../engine/HairVolumeDetector';

export const VolumeScoreIndicatorExample: React.FC = () => {
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState<VolumeCategory>('minimal');
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-update category based on score
  useEffect(() => {
    if (score < 20) {
      setCategory('minimal');
    } else if (score < 50) {
      setCategory('moderate');
    } else if (score < 75) {
      setCategory('high');
    } else {
      setCategory('very-high');
    }
  }, [score]);

  // Simulate automatic score changes
  const simulateDetection = () => {
    setIsAnimating(true);
    const targetScore = Math.floor(Math.random() * 101);
    
    setTimeout(() => {
      setScore(targetScore);
      setIsAnimating(false);
    }, 100);
  };

  // Preset score examples
  const presetScores = [
    { score: 5, label: 'Minimal (5)' },
    { score: 35, label: 'Moderate (35)' },
    { score: 40, label: 'Threshold (40)' },
    { score: 60, label: 'High (60)' },
    { score: 85, label: 'Very High (85)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Volume Score Indicator</h1>
          <p className="text-gray-400">
            Displays hair volume score with visual gauge and category label
          </p>
        </div>

        {/* Live Example */}
        <div className="bg-purple-900/30 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Live Example</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Indicator Display */}
            <div className="bg-black/50 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
              <VolumeScoreIndicator
                score={score}
                category={category}
                isVisible={true}
                className="w-full max-w-sm"
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Score: {score}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preset Scores
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetScores.map((preset) => (
                    <button
                      key={preset.score}
                      onClick={() => setScore(preset.score)}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={simulateDetection}
                disabled={isAnimating}
                className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {isAnimating ? 'Detecting...' : '🔄 Simulate Detection'}
              </button>

              <div className="bg-blue-900/30 rounded-lg p-4 text-sm">
                <h3 className="font-semibold mb-2">Current State</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>Score: {score}/100</li>
                  <li>Category: {category}</li>
                  <li>Auto-flatten: {score > 40 ? 'Yes ✓' : 'No ✗'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Category Examples */}
        <div className="bg-purple-900/30 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">All Categories</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <VolumeScoreIndicator
              score={10}
              category="minimal"
              isVisible={true}
            />
            <VolumeScoreIndicator
              score={35}
              category="moderate"
              isVisible={true}
            />
            <VolumeScoreIndicator
              score={60}
              category="high"
              isVisible={true}
            />
            <VolumeScoreIndicator
              score={85}
              category="very-high"
              isVisible={true}
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-purple-900/30 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Visual Gauge</h3>
              <p className="text-gray-400">
                Animated progress bar showing score from 0-100 with color-coded segments
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Category Label</h3>
              <p className="text-gray-400">
                Shows volume category with icon (minimal/moderate/high/very-high)
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Fast Updates</h3>
              <p className="text-gray-400">
                Updates within 200ms with smooth ease-out animation
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Threshold Marker</h3>
              <p className="text-gray-400">
                Shows auto-flatten threshold at 40 with visual indicator
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Halloween Theme</h3>
              <p className="text-gray-400">
                Styled with purple, orange, and green colors matching the app theme
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">✓ Info Text</h3>
              <p className="text-gray-400">
                Explains whether flattening is recommended based on score
              </p>
            </div>
          </div>
        </div>

        {/* Usage Code */}
        <div className="bg-purple-900/30 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Usage</h2>
          
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{`import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';
import { useSimple2DAR } from '../hooks/useSimple2DAR';

function MyComponent() {
  const { hairProcessingState } = useSimple2DAR();

  return (
    <VolumeScoreIndicator
      score={hairProcessingState?.segmentationData?.volumeScore || 0}
      category={hairProcessingState?.segmentationData?.volumeCategory || 'minimal'}
      isVisible={true}
    />
  );
}`}</code>
          </pre>
        </div>

        {/* Performance Notes */}
        <div className="bg-blue-900/30 rounded-lg p-4">
          <h3 className="font-semibold mb-2">⚡ Performance</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Updates complete within 200ms (requirement met)</li>
            <li>• Uses requestAnimationFrame for smooth 60fps animation</li>
            <li>• Minimal re-renders with React optimization</li>
            <li>• Lightweight component with no heavy dependencies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VolumeScoreIndicatorExample;
