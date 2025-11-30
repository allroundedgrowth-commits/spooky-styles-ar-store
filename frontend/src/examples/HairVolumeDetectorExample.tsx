/**
 * Hair Volume Detector Example
 * 
 * Demonstrates how to use the HairVolumeDetector class to analyze
 * hair segmentation masks and determine volume metrics.
 */

import React, { useState, useRef } from 'react';
import { HairVolumeDetector, VolumeMetrics, BoundingBox } from '../engine/HairVolumeDetector';

export const HairVolumeDetectorExample: React.FC = () => {
  const [volumeMetrics, setVolumeMetrics] = useState<VolumeMetrics | null>(null);
  const [shouldFlatten, setShouldFlatten] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<HairVolumeDetector>(new HairVolumeDetector());

  const analyzeTestImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a test mask with simulated hair pixels
    const width = 640;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Draw simulated hair region (upper portion of image)
    ctx.fillStyle = 'white';
    ctx.fillRect(100, 50, 440, 200); // Simulated hair region

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Define face region
    const faceRegion: BoundingBox = {
      x: 200,
      y: 150,
      width: 240,
      height: 280,
    };

    // Analyze volume
    const detector = detectorRef.current;
    const metrics = detector.calculateVolume(imageData, faceRegion);
    const flatten = detector.shouldAutoFlatten(metrics.score);

    setVolumeMetrics(metrics);
    setShouldFlatten(flatten);
  };

  const getVolumeCategory = () => {
    if (!volumeMetrics) return 'N/A';
    return detectorRef.current.getVolumeCategory(volumeMetrics.score);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-halloween-purple">
        Hair Volume Detector Example
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Canvas</h2>
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded mb-4"
          style={{ maxWidth: '100%' }}
        />
        <button
          onClick={analyzeTestImage}
          className="bg-halloween-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Analyze Test Image
        </button>
      </div>

      {volumeMetrics && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Volume Metrics</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Volume Score</div>
              <div className="text-3xl font-bold text-halloween-purple">
                {volumeMetrics.score}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Range: 0-100
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Category</div>
              <div className="text-2xl font-bold text-halloween-orange capitalize">
                {getVolumeCategory()}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Density</div>
              <div className="text-2xl font-bold">
                {volumeMetrics.density.toFixed(4)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Distribution</div>
              <div className="text-2xl font-bold capitalize">
                {volumeMetrics.distribution}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded mb-4">
            <div className="text-sm text-gray-600 mb-2">Bounding Box</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>X: {volumeMetrics.boundingBox.x}</div>
              <div>Y: {volumeMetrics.boundingBox.y}</div>
              <div>Width: {volumeMetrics.boundingBox.width}</div>
              <div>Height: {volumeMetrics.boundingBox.height}</div>
            </div>
          </div>

          <div className={`p-4 rounded ${shouldFlatten ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Auto-Flatten Decision</div>
                <div className="text-sm text-gray-600">
                  Threshold: Score &gt; 40
                </div>
              </div>
              <div className={`text-2xl font-bold ${shouldFlatten ? 'text-green-600' : 'text-yellow-600'}`}>
                {shouldFlatten ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Volume Score (0-100):</strong> Calculated based on hair pixel coverage (60% weight) 
            and density within the hair region (40% weight).
          </p>
          <p>
            <strong>Auto-Flatten Threshold:</strong> Flattening is automatically applied when the 
            volume score exceeds 40, indicating moderate to high hair volume.
          </p>
          <p>
            <strong>Distribution Analysis:</strong> Hair pixels are analyzed in a 3x3 grid to determine 
            if the distribution is even, concentrated, or sparse.
          </p>
          <p>
            <strong>Volume Categories:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Minimal (0-19): Very little or no visible hair</li>
            <li>Moderate (20-49): Moderate hair volume</li>
            <li>High (50-74): High hair volume</li>
            <li>Very High (75-100): Very high/voluminous hair</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HairVolumeDetectorExample;
