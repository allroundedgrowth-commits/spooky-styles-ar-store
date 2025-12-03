/**
 * Hair Flattening Analytics Integration Example
 * 
 * This example demonstrates how to integrate the HairFlatteningAnalyticsTracker
 * throughout the hair flattening feature to track user interactions, performance,
 * and errors.
 */

import React, { useEffect, useState } from 'react';
import hairFlatteningAnalytics from '../engine/HairFlatteningAnalyticsTracker';
import { AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * Example 1: Session Tracking in AR Component
 */
export const ARSessionExample: React.FC = () => {
  useEffect(() => {
    // Track session start when component mounts
    hairFlatteningAnalytics.trackSessionStart();

    // Track session end when component unmounts
    return () => {
      hairFlatteningAnalytics.trackSessionEnd();
    };
  }, []);

  return (
    <div className="ar-session">
      <h2>AR Try-On Session</h2>
      <p>Analytics tracking active</p>
    </div>
  );
};

/**
 * Example 2: Segmentation Completion Tracking
 */
export const SegmentationExample: React.FC = () => {
  const [isSegmenting, setIsSegmenting] = useState(false);

  const performSegmentation = async (imageData: ImageData) => {
    setIsSegmenting(true);
    const startTime = performance.now();

    try {
      // Simulate segmentation
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const duration = performance.now() - startTime;
      const volumeScore = 65;
      const confidence = 0.92;
      const autoFlatteningApplied = volumeScore > 40;

      // Track successful segmentation
      hairFlatteningAnalytics.trackSegmentationCompletion({
        duration,
        volumeScore,
        confidence,
        autoFlatteningApplied,
        imageWidth: imageData.width,
        imageHeight: imageData.height,
      });

      console.log('Segmentation tracked successfully');
    } catch (error) {
      // Track error
      hairFlatteningAnalytics.trackError({
        errorType: 'SEGMENTATION_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        context: {
          imageWidth: imageData.width,
          imageHeight: imageData.height,
        },
      });
    } finally {
      setIsSegmenting(false);
    }
  };

  return (
    <div className="segmentation-example">
      <h3>Segmentation Tracking</h3>
      <button
        onClick={() => performSegmentation(new ImageData(640, 480))}
        disabled={isSegmenting}
      >
        {isSegmenting ? 'Segmenting...' : 'Start Segmentation'}
      </button>
    </div>
  );
};

/**
 * Example 3: Mode Change Tracking
 */
export const ModeChangeExample: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AdjustmentMode>(AdjustmentMode.NORMAL);
  const volumeScore = 65;

  const handleModeChange = (newMode: AdjustmentMode) => {
    // Track mode change
    hairFlatteningAnalytics.trackModeChange({
      fromMode: currentMode,
      toMode: newMode,
      volumeScore,
      userInitiated: true,
    });

    setCurrentMode(newMode);
  };

  return (
    <div className="mode-change-example">
      <h3>Mode Change Tracking</h3>
      <p>Current Mode: {currentMode}</p>
      <div className="mode-buttons">
        <button onClick={() => handleModeChange(AdjustmentMode.NORMAL)}>
          Normal
        </button>
        <button onClick={() => handleModeChange(AdjustmentMode.FLATTENED)}>
          Flattened
        </button>
        <button onClick={() => handleModeChange(AdjustmentMode.BALD)}>
          Bald
        </button>
      </div>
    </div>
  );
};

/**
 * Example 4: Error Tracking
 */
export const ErrorTrackingExample: React.FC = () => {
  const simulateError = (errorType: 'MODEL_LOAD_FAILED' | 'TIMEOUT' | 'LOW_CONFIDENCE') => {
    const errorMessages = {
      MODEL_LOAD_FAILED: 'Failed to load MediaPipe model',
      TIMEOUT: 'Segmentation exceeded 2 second timeout',
      LOW_CONFIDENCE: 'Segmentation confidence below 70%',
    };

    hairFlatteningAnalytics.trackError({
      errorType,
      errorMessage: errorMessages[errorType],
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
    });

    console.log(`Tracked error: ${errorType}`);
  };

  return (
    <div className="error-tracking-example">
      <h3>Error Tracking</h3>
      <div className="error-buttons">
        <button onClick={() => simulateError('MODEL_LOAD_FAILED')}>
          Simulate Model Load Error
        </button>
        <button onClick={() => simulateError('TIMEOUT')}>
          Simulate Timeout Error
        </button>
        <button onClick={() => simulateError('LOW_CONFIDENCE')}>
          Simulate Low Confidence
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: Performance Degradation Tracking
 */
export const PerformanceDegradationExample: React.FC = () => {
  const [currentFPS, setCurrentFPS] = useState(24);

  const simulateDegradation = () => {
    const degradedFPS = 18;
    setCurrentFPS(degradedFPS);

    hairFlatteningAnalytics.trackPerformanceDegradation({
      currentFPS: degradedFPS,
      targetFPS: 24,
      segmentationFPS: 12,
      degradationLevel: 'medium',
      qualityLevel: 'medium',
    });

    console.log('Performance degradation tracked');
  };

  return (
    <div className="performance-example">
      <h3>Performance Tracking</h3>
      <p>Current FPS: {currentFPS}</p>
      <button onClick={simulateDegradation}>
        Simulate Performance Degradation
      </button>
    </div>
  );
};

/**
 * Example 6: Comparison View Tracking
 */
export const ComparisonViewExample: React.FC = () => {
  const [isComparing, setIsComparing] = useState(false);
  const currentMode = AdjustmentMode.FLATTENED;

  const handleComparisonToggle = () => {
    if (!isComparing) {
      // Opening comparison view
      hairFlatteningAnalytics.trackComparisonView({
        action: 'open',
        currentMode,
      });
      setIsComparing(true);
    } else {
      // Closing comparison view
      hairFlatteningAnalytics.trackComparisonView({
        action: 'close',
        currentMode,
      });
      setIsComparing(false);
    }
  };

  const handleCapture = () => {
    hairFlatteningAnalytics.trackComparisonView({
      action: 'capture',
      currentMode,
    });
    console.log('Comparison capture tracked');
  };

  return (
    <div className="comparison-view-example">
      <h3>Comparison View Tracking</h3>
      <button onClick={handleComparisonToggle}>
        {isComparing ? 'Close Comparison' : 'Open Comparison'}
      </button>
      {isComparing && (
        <button onClick={handleCapture}>
          Capture Comparison
        </button>
      )}
    </div>
  );
};

/**
 * Example 7: Info Message Tracking
 */
export const InfoMessageExample: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    hairFlatteningAnalytics.trackInfoMessage('shown', false);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowMessage(false);
      hairFlatteningAnalytics.trackInfoMessage('dismissed', true);
    }, 4000);
  };

  const handleDismiss = () => {
    setShowMessage(false);
    hairFlatteningAnalytics.trackInfoMessage('dismissed', false);
  };

  return (
    <div className="info-message-example">
      <h3>Info Message Tracking</h3>
      <button onClick={handleShowMessage}>Show Info Message</button>
      {showMessage && (
        <div className="info-message">
          <p>For best results, your hair has been adjusted to fit under the wig.</p>
          <button onClick={handleDismiss}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

/**
 * Example 8: Edge Case Tracking
 */
export const EdgeCaseExample: React.FC = () => {
  const trackEdgeCase = (
    caseType: 'bald_user' | 'hat_detected' | 'low_quality' | 'multiple_faces'
  ) => {
    const details = {
      bald_user: { volumeScore: 2 },
      hat_detected: { confidence: 0.85 },
      low_quality: { brightness: 0.3, sharpness: 0.4 },
      multiple_faces: { faceCount: 3, primaryFaceIndex: 0 },
    };

    hairFlatteningAnalytics.trackEdgeCase(
      caseType,
      true,
      details[caseType]
    );

    console.log(`Edge case tracked: ${caseType}`);
  };

  return (
    <div className="edge-case-example">
      <h3>Edge Case Tracking</h3>
      <div className="edge-case-buttons">
        <button onClick={() => trackEdgeCase('bald_user')}>
          Track Bald User
        </button>
        <button onClick={() => trackEdgeCase('hat_detected')}>
          Track Hat Detected
        </button>
        <button onClick={() => trackEdgeCase('low_quality')}>
          Track Low Quality
        </button>
        <button onClick={() => trackEdgeCase('multiple_faces')}>
          Track Multiple Faces
        </button>
      </div>
    </div>
  );
};

/**
 * Example 9: Initialization Tracking
 */
export const InitializationExample: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeFeature = async () => {
    const startTime = performance.now();

    try {
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const loadTime = performance.now() - startTime;
      
      hairFlatteningAnalytics.trackInitialization(true, loadTime);
      setIsInitialized(true);
      console.log('Initialization tracked successfully');
    } catch (error) {
      hairFlatteningAnalytics.trackInitialization(
        false,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.error('Initialization failed');
    }
  };

  return (
    <div className="initialization-example">
      <h3>Initialization Tracking</h3>
      <button onClick={initializeFeature} disabled={isInitialized}>
        {isInitialized ? 'Initialized' : 'Initialize Feature'}
      </button>
    </div>
  );
};

/**
 * Example 10: Session Statistics
 */
export const SessionStatsExample: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  const getStats = () => {
    const sessionStats = hairFlatteningAnalytics.getSessionStats();
    setStats(sessionStats);
  };

  return (
    <div className="session-stats-example">
      <h3>Session Statistics</h3>
      <button onClick={getStats}>Get Current Stats</button>
      {stats && (
        <div className="stats-display">
          <p>Session Duration: {stats.sessionDuration}ms</p>
          <p>Total Segmentations: {stats.totalSegmentations}</p>
          <p>Total Mode Changes: {stats.totalModeChanges}</p>
          <p>Total Errors: {stats.totalErrors}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Complete Integration Example
 */
export const CompleteAnalyticsExample: React.FC = () => {
  return (
    <div className="complete-analytics-example p-8 space-y-8">
      <h1 className="text-3xl font-bold text-halloween-purple">
        Hair Flattening Analytics Examples
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <ARSessionExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <SegmentationExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <ModeChangeExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <ErrorTrackingExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <PerformanceDegradationExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <ComparisonViewExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <InfoMessageExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <EdgeCaseExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <InitializationExample />
        </div>
        
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <SessionStatsExample />
        </div>
      </div>
    </div>
  );
};

export default CompleteAnalyticsExample;
