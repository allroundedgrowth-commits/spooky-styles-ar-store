import React, { useState } from 'react';
import { HairAdjustmentMessage } from '../components/AR/HairAdjustmentMessage';
import { AdjustmentModeToggle } from '../components/AR/AdjustmentModeToggle';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * Example usage of HairAdjustmentMessage component
 * 
 * Demonstrates:
 * - Auto-show when flattening is applied
 * - Auto-hide after 4 seconds
 * - Manual dismiss
 * - Integration with AdjustmentModeToggle
 * - Visual arrow indicator
 */
export const HairAdjustmentMessageExample: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMode, setCurrentMode] = useState<AdjustmentMode>(AdjustmentMode.NORMAL);
  const [volumeScore] = useState(65); // Simulated volume score

  // Handle mode change
  const handleModeChange = (mode: AdjustmentMode) => {
    setCurrentMode(mode);

    // Show message when switching to flattened mode
    if (mode === AdjustmentMode.FLATTENED) {
      setShowMessage(true);
    }
  };

  // Handle message dismiss
  const handleDismiss = () => {
    setShowMessage(false);
  };

  // Simulate auto-flattening on mount
  React.useEffect(() => {
    // Simulate hair detection and auto-flattening
    const timer = setTimeout(() => {
      if (volumeScore > 40) {
        setCurrentMode(AdjustmentMode.FLATTENED);
        setShowMessage(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [volumeScore]);

  return (
    <div className="min-h-screen bg-halloween-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Hair Adjustment Message Example
        </h1>

        {/* Simulated AR View */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          {/* Placeholder for AR view */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
              <p className="text-gray-400 text-sm">AR Try-On View</p>
            </div>
          </div>

          {/* Hair Adjustment Message */}
          <HairAdjustmentMessage
            show={showMessage}
            onDismiss={handleDismiss}
            autoHideDuration={4000}
          />

          {/* Adjustment Mode Toggle (positioned at bottom) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
            <AdjustmentModeToggle
              currentMode={currentMode}
              onModeChange={handleModeChange}
              volumeScore={volumeScore}
              disabled={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowMessage(true)}
                className="px-4 py-2 bg-halloween-purple text-white rounded-lg hover:bg-halloween-purple/80 transition-colors"
              >
                Show Message
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Manually trigger the message display
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowMessage(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hide Message
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Manually hide the message
              </p>
            </div>

            <div>
              <button
                onClick={() => {
                  setCurrentMode(AdjustmentMode.FLATTENED);
                  setShowMessage(true);
                }}
                className="px-4 py-2 bg-halloween-orange text-white rounded-lg hover:bg-halloween-orange/80 transition-colors"
              >
                Simulate Auto-Flattening
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Simulate automatic flattening with message
              </p>
            </div>
          </div>
        </div>

        {/* Feature Documentation */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
          
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Auto-show:</strong> Message appears within 200ms when flattening is applied
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Auto-hide:</strong> Message automatically dismisses after 4 seconds
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Manual dismiss:</strong> Users can close the message early using the X button
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Visual indicator:</strong> Animated arrow points to the adjustment toggle below
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Progress bar:</strong> Visual countdown showing time until auto-hide
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-halloween-green mt-1">✓</span>
              <div>
                <strong className="text-white">Halloween theme:</strong> Uses purple, orange, and black color scheme
              </div>
            </li>
          </ul>
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Usage</h2>
          
          <pre className="bg-black rounded p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">
{`import { HairAdjustmentMessage } from './components/AR/HairAdjustmentMessage';

function ARTryOn() {
  const [showMessage, setShowMessage] = useState(false);

  // Show message when flattening is applied
  useEffect(() => {
    if (volumeScore > 40) {
      setShowMessage(true);
    }
  }, [volumeScore]);

  return (
    <div className="relative">
      <HairAdjustmentMessage
        show={showMessage}
        onDismiss={() => setShowMessage(false)}
        autoHideDuration={4000} // Optional, defaults to 4000ms
      />
      
      {/* Your AR content */}
    </div>
  );
}`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HairAdjustmentMessageExample;
