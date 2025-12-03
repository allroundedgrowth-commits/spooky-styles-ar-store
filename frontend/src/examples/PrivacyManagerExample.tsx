import React, { useEffect, useState } from 'react';
import { PrivacyManager, PrivacyMetrics } from '../engine/PrivacyManager';

/**
 * Example component demonstrating PrivacyManager usage
 * 
 * This shows how to:
 * - Start and end privacy-tracked sessions
 * - Track camera frames
 * - Verify model integrity
 * - Monitor privacy metrics
 * - Clear data manually
 */
const PrivacyManagerExample: React.FC = () => {
  const [privacyManager] = useState(() => new PrivacyManager());
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      if (privacyManager.isSessionActive()) {
        setMetrics(privacyManager.getMetrics());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      privacyManager.dispose();
    };
  }, [privacyManager]);

  const handleStartSession = () => {
    privacyManager.startSession();
    setSessionActive(true);
    setMetrics(privacyManager.getMetrics());
  };

  const handleEndSession = () => {
    privacyManager.handleSessionEnd();
    setSessionActive(false);
    setMetrics(privacyManager.getMetrics());
  };

  const handleSimulateFrames = () => {
    // Simulate processing 10 frames
    for (let i = 0; i < 10; i++) {
      const frame = createMockFrame(640, 480);
      privacyManager.trackCameraFrame(frame);
      
      // Simulate processed frame
      const processed = createMockFrame(640, 480);
      privacyManager.trackProcessedFrame(processed);
    }
    setMetrics(privacyManager.getMetrics());
  };

  const handleClearData = () => {
    privacyManager.clearCameraData();
    setMetrics(privacyManager.getMetrics());
  };

  const handleVerifyModel = async () => {
    setVerificationStatus('Verifying...');
    
    // Example: Verify a model with checksum
    const config = {
      url: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      checksum: 'example-checksum-here',
      algorithm: 'SHA-256' as const,
    };

    try {
      const isValid = await privacyManager.verifyModelIntegrity(config);
      setVerificationStatus(isValid ? '✓ Model verified' : '✗ Verification failed');
    } catch (error) {
      setVerificationStatus(`✗ Error: ${error}`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-halloween-purple">
        PrivacyManager Example
      </h1>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Session Control
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleStartSession}
            disabled={sessionActive}
            className="px-4 py-2 bg-halloween-green text-white rounded disabled:opacity-50"
          >
            Start Session
          </button>
          
          <button
            onClick={handleEndSession}
            disabled={!sessionActive}
            className="px-4 py-2 bg-halloween-orange text-white rounded disabled:opacity-50"
          >
            End Session
          </button>
        </div>

        <div className="text-white">
          <p>
            Session Status:{' '}
            <span className={sessionActive ? 'text-halloween-green' : 'text-gray-400'}>
              {sessionActive ? '● Active' : '○ Inactive'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Frame Processing
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSimulateFrames}
            disabled={!sessionActive}
            className="px-4 py-2 bg-halloween-purple text-white rounded disabled:opacity-50"
          >
            Simulate 10 Frames
          </button>
          
          <button
            onClick={handleClearData}
            disabled={!sessionActive}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Clear All Data
          </button>
        </div>
      </div>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Model Integrity
        </h2>
        
        <button
          onClick={handleVerifyModel}
          className="px-4 py-2 bg-halloween-purple text-white rounded mb-4"
        >
          Verify Model Integrity
        </button>
        
        {verificationStatus && (
          <p className="text-white">{verificationStatus}</p>
        )}
      </div>

      {metrics && (
        <div className="bg-halloween-darkPurple p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
            Privacy Metrics
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-gray-400">Frames Processed</p>
              <p className="text-2xl font-bold text-halloween-green">
                {metrics.framesProcessed}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400">Frames Cleared</p>
              <p className="text-2xl font-bold text-halloween-orange">
                {metrics.framesCleared}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400">Memory Freed</p>
              <p className="text-2xl font-bold text-halloween-purple">
                {formatBytes(metrics.memoryFreed)}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400">Current Memory Usage</p>
              <p className="text-2xl font-bold text-halloween-purple">
                {formatBytes(privacyManager.getMemoryUsage())}
              </p>
            </div>
            
            <div className="col-span-2">
              <p className="text-gray-400">Last Cleanup</p>
              <p className="text-lg">
                {new Date(metrics.lastCleanup).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-halloween-darkPurple rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-halloween-orange">
          Privacy Guarantees
        </h3>
        <ul className="text-white space-y-2">
          <li>✓ All processing happens client-side</li>
          <li>✓ No server uploads of camera frames</li>
          <li>✓ Automatic data cleanup on session end</li>
          <li>✓ Model integrity verification</li>
          <li>✓ Memory usage limits enforced</li>
          <li>✓ Periodic automatic cleanup</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to create mock ImageData
function createMockFrame(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with random data to simulate a real frame
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  return new ImageData(data, width, height);
}

export default PrivacyManagerExample;
