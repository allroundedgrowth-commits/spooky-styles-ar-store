/**
 * EdgeCaseHandler Usage Example
 * 
 * Demonstrates how to use the EdgeCaseHandler class to handle
 * edge cases in hair segmentation and flattening.
 */

import React, { useState, useRef, useEffect } from 'react';
import { EdgeCaseHandler, type EdgeCaseResult, type BoundingBox } from '../engine/EdgeCaseHandler';
import type { HairSegmentationData } from '../engine/Simple2DAREngine';

const EdgeCaseHandlerExample: React.FC = () => {
  const [edgeCaseResult, setEdgeCaseResult] = useState<EdgeCaseResult | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>('bald');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const edgeCaseHandlerRef = useRef(new EdgeCaseHandler());

  // Mock segmentation data for different scenarios
  const mockScenarios = {
    bald: {
      volumeScore: 3,
      confidence: 0.95,
      mask: createMockMask(640, 480, 0.05), // Very little hair
      boundingBox: { x: 200, y: 100, width: 240, height: 280 }
    },
    normal: {
      volumeScore: 65,
      confidence: 0.92,
      mask: createMockMask(640, 480, 0.6),
      boundingBox: { x: 200, y: 100, width: 240, height: 280 }
    },
    hat: {
      volumeScore: 85,
      confidence: 0.88,
      mask: createMockMaskWithHat(640, 480),
      boundingBox: { x: 150, y: 50, width: 340, height: 200 } // Wide, short box
    }
  };

  function createMockMask(width: number, height: number, density: number): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);
    
    // Fill with random hair pixels based on density
    for (let i = 0; i < imageData.data.length; i += 4) {
      const isHair = Math.random() < density;
      const value = isHair ? 255 : 0;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    
    return imageData;
  }

  function createMockMaskWithHat(width: number, height: number): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);
    
    // Create hat-like pattern: very dense in upper region
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Upper third is very dense (hat)
        const isUpperThird = y < height / 3;
        const density = isUpperThird ? 0.95 : 0.3;
        const isHair = Math.random() < density;
        const value = isHair ? 255 : 0;
        
        imageData.data[idx] = value;
        imageData.data[idx + 1] = value;
        imageData.data[idx + 2] = value;
        imageData.data[idx + 3] = 255;
      }
    }
    
    return imageData;
  }

  function createMockImage(width: number, height: number, quality: 'good' | 'dim' | 'bright' | 'blurry'): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);
    
    let baseBrightness = 128;
    let variance = 50;
    
    switch (quality) {
      case 'dim':
        baseBrightness = 20;
        variance = 10;
        break;
      case 'bright':
        baseBrightness = 240;
        variance = 10;
        break;
      case 'blurry':
        baseBrightness = 128;
        variance = 5; // Low variance = low contrast
        break;
    }
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const brightness = baseBrightness + (Math.random() - 0.5) * variance * 2;
      imageData.data[i] = brightness;
      imageData.data[i + 1] = brightness;
      imageData.data[i + 2] = brightness;
      imageData.data[i + 3] = 255;
    }
    
    return imageData;
  }

  const runTest = (testType: string) => {
    const handler = edgeCaseHandlerRef.current;
    let result: EdgeCaseResult;

    switch (testType) {
      case 'bald':
        result = handler.handleBaldUser(mockScenarios.bald as HairSegmentationData);
        break;
      
      case 'normal':
        result = handler.handleBaldUser(mockScenarios.normal as HairSegmentationData);
        break;
      
      case 'hat':
        result = handler.handleHatDetection(mockScenarios.hat as HairSegmentationData);
        break;
      
      case 'quality-dim':
        result = handler.handleLowQuality(createMockImage(640, 480, 'dim'));
        break;
      
      case 'quality-bright':
        result = handler.handleLowQuality(createMockImage(640, 480, 'bright'));
        break;
      
      case 'quality-blurry':
        result = handler.handleLowQuality(createMockImage(640, 480, 'blurry'));
        break;
      
      case 'quality-good':
        result = handler.handleLowQuality(createMockImage(640, 480, 'good'));
        break;
      
      case 'multiple-faces': {
        const faces: BoundingBox[] = [
          { x: 100, y: 100, width: 150, height: 180 }, // Left face
          { x: 400, y: 120, width: 200, height: 240 }, // Right face (larger)
          { x: 250, y: 300, width: 120, height: 140 }  // Bottom face
        ];
        const primaryFace = handler.handleMultipleFaces(faces, 640, 480);
        result = {
          shouldSkipFlattening: false,
          message: `Selected face at (${primaryFace.x}, ${primaryFace.y}) with size ${primaryFace.width}x${primaryFace.height}`,
          reason: 'multiple_faces'
        };
        break;
      }
        
        // Visualize faces
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')!;
          ctx.clearRect(0, 0, 640, 480);
          ctx.fillStyle = '#1a0033';
          ctx.fillRect(0, 0, 640, 480);
          
          // Draw all faces
          faces.forEach((face, idx) => {
            ctx.strokeStyle = face === primaryFace ? '#10b981' : '#f97316';
            ctx.lineWidth = 3;
            ctx.strokeRect(face.x, face.y, face.width, face.height);
            
            ctx.fillStyle = face === primaryFace ? '#10b981' : '#f97316';
            ctx.font = '16px sans-serif';
            ctx.fillText(
              face === primaryFace ? 'Primary' : `Face ${idx + 1}`,
              face.x + 5,
              face.y + 20
            );
          });
        }
        break;
      
      case 'comprehensive':
        result = handler.checkAllEdgeCases(
          mockScenarios.normal as HairSegmentationData,
          createMockImage(640, 480, 'good'),
          [{ x: 200, y: 100, width: 240, height: 280 }]
        );
        break;
      
      default:
        result = { shouldSkipFlattening: false, reason: 'none' };
    }

    setEdgeCaseResult(result);
  };

  useEffect(() => {
    runTest(selectedTest);
  }, [selectedTest]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-halloween-darkPurple rounded-lg">
      <h2 className="text-2xl font-bold text-halloween-orange mb-4">
        EdgeCaseHandler Example
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Select Test Scenario:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedTest('bald')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'bald'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Bald User
          </button>
          <button
            onClick={() => setSelectedTest('normal')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'normal'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Normal Hair
          </button>
          <button
            onClick={() => setSelectedTest('hat')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'hat'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Hat Detection
          </button>
          <button
            onClick={() => setSelectedTest('quality-dim')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'quality-dim'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Dim Lighting
          </button>
          <button
            onClick={() => setSelectedTest('quality-bright')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'quality-bright'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Bright Lighting
          </button>
          <button
            onClick={() => setSelectedTest('quality-blurry')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'quality-blurry'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Blurry Image
          </button>
          <button
            onClick={() => setSelectedTest('quality-good')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'quality-good'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Good Quality
          </button>
          <button
            onClick={() => setSelectedTest('multiple-faces')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'multiple-faces'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Multiple Faces
          </button>
          <button
            onClick={() => setSelectedTest('comprehensive')}
            className={`px-4 py-2 rounded ${
              selectedTest === 'comprehensive'
                ? 'bg-halloween-orange text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            All Checks
          </button>
        </div>
      </div>

      {selectedTest === 'multiple-faces' && (
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full border-2 border-halloween-purple rounded"
          />
        </div>
      )}

      {edgeCaseResult && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-halloween-green mb-2">Result:</h3>
          
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Should Skip Flattening:</span>
              <span className={edgeCaseResult.shouldSkipFlattening ? 'text-halloween-orange' : 'text-halloween-green'}>
                {edgeCaseResult.shouldSkipFlattening ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">Reason:</span>
              <span className="text-halloween-purple">{edgeCaseResult.reason}</span>
            </div>
            
            {edgeCaseResult.message && (
              <div className="mt-3 p-3 bg-halloween-darkPurple rounded border border-halloween-orange">
                <span className="font-semibold text-halloween-orange">Message:</span>
                <p className="mt-1 text-gray-300">{edgeCaseResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-halloween-green mb-2">About Edge Cases:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li><strong>Bald User:</strong> Skips flattening when volume score &lt; 5</li>
          <li><strong>Hat Detection:</strong> Detects unusual segmentation patterns</li>
          <li><strong>Quality Checks:</strong> Analyzes brightness, sharpness, and contrast</li>
          <li><strong>Multiple Faces:</strong> Selects largest or most centered face</li>
          <li><strong>Comprehensive:</strong> Runs all checks in sequence</li>
        </ul>
      </div>
    </div>
  );
};

export default EdgeCaseHandlerExample;
