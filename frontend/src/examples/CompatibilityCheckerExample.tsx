/**
 * CompatibilityChecker Example
 * 
 * Demonstrates how to use the CompatibilityChecker to verify browser
 * and device compatibility for hair flattening features.
 */

import React, { useEffect, useState } from 'react';
import { CompatibilityChecker, CompatibilityResult } from '../engine/CompatibilityChecker';

export const CompatibilityCheckerExample: React.FC = () => {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [checking, setChecking] = useState(true);
  const [detailedReport, setDetailedReport] = useState<string>('');

  useEffect(() => {
    checkCompatibility();
  }, []);

  const checkCompatibility = async () => {
    setChecking(true);
    
    const checker = new CompatibilityChecker();
    
    // Perform compatibility check
    const compatResult = await checker.checkCompatibility();
    setResult(compatResult);
    
    // Get detailed report
    const report = await checker.getDetailedReport();
    setDetailedReport(report);
    
    setChecking(false);
  };

  const recheckCompatibility = () => {
    const checker = new CompatibilityChecker();
    checker.clearCache();
    checkCompatibility();
  };

  if (checking) {
    return (
      <div className="p-6 bg-halloween-darkPurple rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-halloween-purple"></div>
          <p className="text-white">Checking compatibility...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 bg-halloween-darkPurple rounded-lg">
        <p className="text-white">Failed to check compatibility</p>
        <button
          onClick={recheckCompatibility}
          className="mt-4 px-4 py-2 bg-halloween-purple text-white rounded hover:bg-purple-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const checker = new CompatibilityChecker();
  const message = checker.getCompatibilityMessage(result);
  const shouldFallback = checker.shouldFallbackToStandardAR(result);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-halloween-purple">
        Compatibility Check Results
      </h2>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg ${
        result.isCompatible 
          ? 'bg-green-900 border-2 border-green-500' 
          : 'bg-red-900 border-2 border-red-500'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`text-3xl ${result.isCompatible ? 'text-green-400' : 'text-red-400'}`}>
            {result.isCompatible ? '✓' : '✗'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {result.isCompatible ? 'Compatible' : 'Not Compatible'}
            </h3>
            <p className="text-gray-300 mt-1">{message}</p>
          </div>
        </div>
      </div>

      {/* Feature Support */}
      <div className="bg-halloween-darkPurple p-6 rounded-lg">
        <h3 className="text-xl font-bold text-halloween-purple mb-4">
          Feature Support
        </h3>
        <div className="space-y-3">
          <FeatureStatus
            name="WebGL"
            supported={result.features.webgl}
            description="Required for shader-based hair processing"
          />
          <FeatureStatus
            name="Camera Access"
            supported={result.features.camera}
            description="Required for AR try-on"
          />
          <FeatureStatus
            name="TensorFlow.js"
            supported={result.features.tensorflowjs}
            description="Required for hair segmentation"
          />
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-halloween-darkPurple p-6 rounded-lg">
        <h3 className="text-xl font-bold text-halloween-purple mb-4">
          Device Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="text-gray-400">Device Type</p>
            <p className="font-semibold">
              {result.deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Browser</p>
            <p className="font-semibold capitalize">{result.deviceInfo.browser}</p>
          </div>
          <div>
            <p className="text-gray-400">Operating System</p>
            <p className="font-semibold capitalize">{result.deviceInfo.os}</p>
          </div>
          <div>
            <p className="text-gray-400">GPU Tier</p>
            <p className="font-semibold capitalize">
              {result.deviceInfo.gpuTier || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Performance</p>
            <p className={`font-semibold ${
              result.deviceInfo.isLowEnd ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {result.deviceInfo.isLowEnd ? 'Low-End Device' : 'Good Performance'}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-yellow-900 border-2 border-yellow-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            ⚠️ Warnings
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-200 flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-red-900 border-2 border-red-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-red-400 mb-3">
            ❌ Errors
          </h3>
          <ul className="space-y-2">
            {result.errors.map((error, index) => (
              <li key={index} className="text-red-200 flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallback Notice */}
      {shouldFallback && (
        <div className="bg-blue-900 border-2 border-blue-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-400 mb-2">
            ℹ️ Fallback Mode
          </h3>
          <p className="text-blue-200">
            Hair flattening features are not available on your device. 
            You can still use standard AR try-on without hair adjustment.
          </p>
        </div>
      )}

      {/* Detailed Report */}
      <div className="bg-halloween-darkPurple p-6 rounded-lg">
        <h3 className="text-xl font-bold text-halloween-purple mb-4">
          Detailed Report
        </h3>
        <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-x-auto font-mono">
          {detailedReport}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={recheckCompatibility}
          className="px-6 py-3 bg-halloween-purple text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Recheck Compatibility
        </button>
        
        {result.isCompatible && (
          <button
            onClick={() => alert('Hair flattening features enabled!')}
            className="px-6 py-3 bg-halloween-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Enable Hair Flattening
          </button>
        )}
        
        {shouldFallback && (
          <button
            onClick={() => alert('Using standard AR mode')}
            className="px-6 py-3 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Use Standard AR
          </button>
        )}
      </div>
    </div>
  );
};

interface FeatureStatusProps {
  name: string;
  supported: boolean;
  description: string;
}

const FeatureStatus: React.FC<FeatureStatusProps> = ({ name, supported, description }) => {
  return (
    <div className="flex items-start space-x-3 p-3 bg-black bg-opacity-30 rounded">
      <div className={`text-2xl ${supported ? 'text-green-400' : 'text-red-400'}`}>
        {supported ? '✓' : '✗'}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{name}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default CompatibilityCheckerExample;
