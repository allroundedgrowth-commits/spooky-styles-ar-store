/**
 * useHairFlattening Hook Example
 * 
 * Demonstrates how to use the useHairFlattening hook for managing
 * hair flattening state in AR try-on sessions.
 * 
 * Requirements: 1.1, 1.2, 4.1
 */

import React, { useEffect, useState } from 'react';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
import { useHairFlattening } from '../hooks/useHairFlattening';
import { AdjustmentMode } from '../engine/Simple2DAREngine';
import { AdjustmentModeToggle } from '../components/AR/AdjustmentModeToggle';
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';
// import { ComparisonView } from '../components/AR/ComparisonView';
import { HairAdjustmentMessage } from '../components/AR/HairAdjustmentMessage';

/**
 * Example 1: Basic Usage
 * Shows the simplest way to integrate hair flattening
 */
export const BasicHairFlatteningExample: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  const {
    volumeScore,
    currentMode,
    changeMode,
  } = useHairFlattening(hairProcessingState, setAdjustmentMode);

  const startAR = async () => {
    await initialize();
    await loadWig({
      wigImageUrl: '/wigs/purple-wig.png',
      enableHairFlattening: true,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Basic Hair Flattening</h2>
      
      <div className="relative">
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="w-full max-w-2xl" />
      </div>

      {!isInitialized ? (
        <button
          onClick={startAR}
          className="mt-4 px-6 py-2 bg-halloween-purple text-white rounded"
        >
          Start AR Try-On
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          {volumeScore !== null && (
            <div className="text-lg">
              Hair Volume: <strong>{volumeScore}/100</strong>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => changeMode(AdjustmentMode.NORMAL)}
              className={`px-4 py-2 rounded ${
                currentMode === AdjustmentMode.NORMAL
                  ? 'bg-halloween-purple text-white'
                  : 'bg-gray-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => changeMode(AdjustmentMode.FLATTENED)}
              className={`px-4 py-2 rounded ${
                currentMode === AdjustmentMode.FLATTENED
                  ? 'bg-halloween-purple text-white'
                  : 'bg-gray-200'
              }`}
            >
              Flattened
            </button>
            <button
              onClick={() => changeMode(AdjustmentMode.BALD)}
              className={`px-4 py-2 rounded ${
                currentMode === AdjustmentMode.BALD
                  ? 'bg-halloween-purple text-white'
                  : 'bg-gray-200'
              }`}
            >
              Bald
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 2: With UI Components
 * Shows integration with pre-built UI components
 */
export const ComponentIntegrationExample: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  const {
    volumeScore,
    volumeCategory,
    currentMode,
    isComparisonMode,
    changeMode,
    toggleComparison,
  } = useHairFlattening(hairProcessingState, setAdjustmentMode);

  const [showMessage, setShowMessage] = useState(false);

  // Show message when flattening is auto-applied
  useEffect(() => {
    if (currentMode === AdjustmentMode.FLATTENED && volumeScore && volumeScore > 40) {
      setShowMessage(true);
    }
  }, [currentMode, volumeScore]);

  const startAR = async () => {
    await initialize();
    await loadWig({
      wigImageUrl: '/wigs/purple-wig.png',
      enableHairFlattening: true,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Component Integration</h2>
      
      <div className="relative">
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="w-full max-w-2xl" />
        
        {/* Volume Score Indicator */}
        {isInitialized && volumeScore !== null && (
          <div className="absolute top-4 right-4">
            <VolumeScoreIndicator
              score={volumeScore}
              category={(volumeCategory ?? 'minimal') as 'minimal' | 'low' | 'medium' | 'high' | 'very-high'}
            />
          </div>
        )}
      </div>

      {!isInitialized ? (
        <button
          onClick={startAR}
          className="mt-4 px-6 py-2 bg-halloween-purple text-white rounded"
        >
          Start AR Try-On
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Info Message */}
          <HairAdjustmentMessage
            show={showMessage}
            onDismiss={() => setShowMessage(false)}
          />

          {/* Adjustment Mode Toggle */}
          <AdjustmentModeToggle
            currentMode={currentMode}
            onModeChange={changeMode}
            volumeScore={volumeScore ?? 0}
          />

          {/* Comparison Toggle */}
          <button
            onClick={toggleComparison}
            className="px-4 py-2 bg-halloween-orange text-white rounded"
          >
            {isComparisonMode ? 'Hide' : 'Show'} Comparison
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: With Callbacks and Analytics
 * Shows how to use callbacks for tracking and side effects
 */
export const CallbacksExample: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  const [analyticsEvents, setAnalyticsEvents] = useState<string[]>([]);

  const {
    volumeScore,
    currentMode,
    error,
    changeMode,
  } = useHairFlattening(
    hairProcessingState,
    setAdjustmentMode,
    {
      onStateChange: (state) => {
        // Track state changes
        const event = `State changed: ${JSON.stringify({
          isInitialized: state.isInitialized,
          volumeScore: state.segmentationData?.volumeScore,
          mode: state.currentMode,
        })}`;
        setAnalyticsEvents(prev => [...prev, event]);
      },
      onModeChange: (mode) => {
        // Track mode changes
        const event = `Mode changed to: ${mode}`;
        setAnalyticsEvents(prev => [...prev, event]);
        
        // Send to analytics service
        console.log('Analytics:', event);
      },
    }
  );

  const startAR = async () => {
    await initialize();
    await loadWig({
      wigImageUrl: '/wigs/purple-wig.png',
      enableHairFlattening: true,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Callbacks & Analytics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="w-full" />
          
          <button
            onClick={startAR}
            className="mt-4 px-6 py-2 bg-halloween-purple text-white rounded"
          >
            Start AR
          </button>

          {volumeScore !== null && (
            <div className="mt-4">
              <p>Volume: {volumeScore}</p>
              <p>Mode: {currentMode}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => changeMode(AdjustmentMode.NORMAL)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Normal
            </button>
            <button
              onClick={() => changeMode(AdjustmentMode.FLATTENED)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Flattened
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2">Analytics Events</h3>
          <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
            {analyticsEvents.map((event, index) => (
              <div key={index} className="text-sm mb-2 border-b pb-2">
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 4: Auto-initialization
 * Shows automatic initialization when the hook mounts
 */
export const AutoInitExample: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  const {
    isInitialized,
    error,
    volumeScore,
  } = useHairFlattening(
    hairProcessingState,
    setAdjustmentMode,
    {
      autoInitialize: true, // Automatically initialize
    }
  );

  useEffect(() => {
    const startAR = async () => {
      await initialize();
      await loadWig({
        wigImageUrl: '/wigs/purple-wig.png',
        enableHairFlattening: true,
      });
    };
    
    startAR();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Auto-initialization</h2>
      
      <div className="relative">
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="w-full max-w-2xl" />
      </div>

      <div className="mt-4">
        {!isInitialized && !error && (
          <div className="text-gray-600">
            Initializing hair detection...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <p className="font-bold">Initialization Error</p>
            <p>{error}</p>
          </div>
        )}

        {isInitialized && volumeScore !== null && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            <p className="font-bold">Hair Detection Active</p>
            <p>Volume Score: {volumeScore}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Example 5: Manual Control
 * Shows manual initialization and reset
 */
export const ManualControlExample: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    hairProcessingState,
    setAdjustmentMode,
    initialize,
    loadWig,
  } = useSimple2DAR();

  const {
    isInitialized,
    isProcessing,
    volumeScore,
    error,
    initializeSegmentation,
    reset,
  } = useHairFlattening(hairProcessingState, setAdjustmentMode);

  const [arStarted, setArStarted] = useState(false);

  const startAR = async () => {
    await initialize();
    await loadWig({
      wigImageUrl: '/wigs/purple-wig.png',
      enableHairFlattening: true,
    });
    setArStarted(true);
  };

  const handleInitSegmentation = async () => {
    try {
      await initializeSegmentation();
      console.log('Segmentation initialized successfully');
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  };

  const handleReset = () => {
    reset();
    console.log('Hair flattening state reset');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manual Control</h2>
      
      <div className="relative">
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="w-full max-w-2xl" />
      </div>

      <div className="mt-4 space-y-4">
        {!arStarted ? (
          <button
            onClick={startAR}
            className="px-6 py-2 bg-halloween-purple text-white rounded"
          >
            Start AR
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={handleInitSegmentation}
                disabled={isInitialized || isProcessing}
                className="px-4 py-2 bg-halloween-orange text-white rounded disabled:opacity-50"
              >
                {isProcessing ? 'Initializing...' : 'Initialize Segmentation'}
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Reset
              </button>
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <p><strong>Status:</strong></p>
              <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
              <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
              <p>Volume Score: {volumeScore ?? 'N/A'}</p>
              {error && <p className="text-red-600">Error: {error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Main Example Component
 * Renders all examples with tabs
 */
export const HairFlatteningHookExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const examples = [
    { name: 'Basic Usage', component: BasicHairFlatteningExample },
    { name: 'Component Integration', component: ComponentIntegrationExample },
    { name: 'Callbacks & Analytics', component: CallbacksExample },
    { name: 'Auto-initialization', component: AutoInitExample },
    { name: 'Manual Control', component: ManualControlExample },
  ];

  const ActiveExample = examples[activeTab].component;

  return (
    <div className="min-h-screen bg-halloween-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-halloween-purple">
        useHairFlattening Hook Examples
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded whitespace-nowrap ${
              activeTab === index
                ? 'bg-halloween-purple text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {example.name}
          </button>
        ))}
      </div>

      {/* Active Example */}
      <div className="bg-white text-black rounded-lg">
        <ActiveExample />
      </div>
    </div>
  );
};

export default HairFlatteningHookExample;
