/**
 * Hair Flattening Engine Example
 * 
 * Demonstrates how to use the HairFlatteningEngine to apply
 * hair volume reduction effects for AR wig try-on.
 */

import React, { useRef, useEffect, useState } from 'react';
import { HairFlatteningEngine, AdjustmentMode } from '../engine/HairFlatteningEngine';
import { HairSegmentationModule } from '../engine/HairSegmentationModule';
import { HairVolumeDetector, BoundingBox } from '../engine/HairVolumeDetector';

export const HairFlatteningExample: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const flattenedCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [engine] = useState(() => new HairFlatteningEngine());
  const [segmentation] = useState(() => new HairSegmentationModule());
  const [volumeDetector] = useState(() => new HairVolumeDetector());
  
  const [mode, setMode] = useState<AdjustmentMode>(AdjustmentMode.FLATTENED);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [volumeScore, setVolumeScore] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [useWebGL, setUseWebGL] = useState(true);
  const [isWebGLActive, setIsWebGLActive] = useState(false);

  useEffect(() => {
    initializeCamera();
    initializeSegmentation();
    initializeEngine();

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      segmentation.dispose();
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    // Reinitialize engine when WebGL setting changes
    initializeEngine();
  }, [useWebGL]);

  useEffect(() => {
    engine.setMode(mode);
  }, [mode, engine]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Failed to access camera: ' + err);
    }
  };

  const initializeSegmentation = async () => {
    try {
      await segmentation.initialize();
    } catch (err) {
      setError('Failed to initialize segmentation: ' + err);
    }
  };

  const initializeEngine = () => {
    try {
      // Initialize with 640x480 resolution
      engine.initialize(640, 480, useWebGL);
      
      // Check if WebGL is actually being used
      // This is a simple check - in production you'd want more robust detection
      setIsWebGLActive(useWebGL);
    } catch (err) {
      setError('Failed to initialize engine: ' + err);
      setIsWebGLActive(false);
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !originalCanvasRef.current || !flattenedCanvasRef.current) {
      return;
    }

    if (isProcessing || !segmentation.isReady()) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const video = videoRef.current;
      const originalCanvas = originalCanvasRef.current;
      const flattenedCanvas = flattenedCanvasRef.current;

      // Set canvas dimensions
      originalCanvas.width = video.videoWidth;
      originalCanvas.height = video.videoHeight;
      flattenedCanvas.width = video.videoWidth;
      flattenedCanvas.height = video.videoHeight;

      const originalCtx = originalCanvas.getContext('2d');
      const flattenedCtx = flattenedCanvas.getContext('2d');

      if (!originalCtx || !flattenedCtx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw original frame
      originalCtx.drawImage(video, 0, 0);
      const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

      // Segment hair
      const segResult = await segmentation.segmentHair(imageData);

      // Calculate volume
      const faceRegion: BoundingBox = {
        x: Math.floor(originalCanvas.width * 0.25),
        y: Math.floor(originalCanvas.height * 0.2),
        width: Math.floor(originalCanvas.width * 0.5),
        height: Math.floor(originalCanvas.height * 0.6)
      };

      const volumeMetrics = volumeDetector.calculateVolume(segResult.hairMask, faceRegion);
      setVolumeScore(volumeMetrics.score);

      // Apply flattening
      const flatResult = await engine.applyFlattening(
        imageData,
        segResult.hairMask,
        faceRegion
      );

      setProcessingTime(flatResult.processingTime);

      // Draw flattened result
      flattenedCtx.putImageData(flatResult.flattenedImage, 0, 0);

      // Draw head contour
      if (flatResult.headContour.length > 0) {
        flattenedCtx.strokeStyle = '#8b5cf6';
        flattenedCtx.lineWidth = 2;
        flattenedCtx.beginPath();
        flattenedCtx.moveTo(flatResult.headContour[0].x, flatResult.headContour[0].y);
        
        for (let i = 1; i < flatResult.headContour.length; i++) {
          flattenedCtx.lineTo(flatResult.headContour[i].x, flatResult.headContour[i].y);
        }
        
        flattenedCtx.stroke();
      }

    } catch (err) {
      setError('Processing failed: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-halloween-purple">
        Hair Flattening Engine Example
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Original Video */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Camera Feed</h2>
          <video
            ref={videoRef}
            className="w-full border-2 border-gray-300 rounded"
            autoPlay
            playsInline
            muted
          />
        </div>

        {/* Original Canvas */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Original Frame</h2>
          <canvas
            ref={originalCanvasRef}
            className="w-full border-2 border-gray-300 rounded"
          />
        </div>

        {/* Flattened Canvas */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">
            Flattened Result (Mode: {mode})
          </h2>
          <canvas
            ref={flattenedCanvasRef}
            className="w-full border-2 border-halloween-purple rounded"
          />
          <p className="text-sm text-gray-600 mt-2">
            Purple line shows extracted head contour for wig positioning
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Adjustment Mode</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode(AdjustmentMode.NORMAL)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === AdjustmentMode.NORMAL
                ? 'bg-halloween-purple text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Normal
          </button>
          
          <button
            onClick={() => setMode(AdjustmentMode.FLATTENED)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === AdjustmentMode.FLATTENED
                ? 'bg-halloween-purple text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Flattened (Recommended)
          </button>
          
          <button
            onClick={() => setMode(AdjustmentMode.BALD)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              mode === AdjustmentMode.BALD
                ? 'bg-halloween-purple text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bald (Preview Only)
          </button>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useWebGL}
              onChange={(e) => setUseWebGL(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">
              Use WebGL Acceleration {isWebGLActive && '(Active)'}
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            GPU-accelerated processing for better performance
          </p>
        </div>

        <button
          onClick={processFrame}
          disabled={isProcessing || !segmentation.isReady()}
          className="w-full bg-halloween-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Process Frame'}
        </button>
      </div>

      {/* Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Processing Time</p>
            <p className={`text-2xl font-bold ${
              processingTime > 300 ? 'text-red-600' : 'text-green-600'
            }`}>
              {processingTime.toFixed(0)}ms
            </p>
            <p className="text-xs text-gray-500">Target: &lt; 300ms</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Hair Volume Score</p>
            <p className="text-2xl font-bold text-halloween-purple">
              {volumeScore.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">
              {volumeScore > 40 ? 'Auto-flatten recommended' : 'Normal mode OK'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Acceleration</p>
            <p className="text-2xl font-bold text-blue-600">
              {isWebGLActive ? 'WebGL' : 'CPU'}
            </p>
            <p className="text-xs text-gray-500">
              {isWebGLActive ? 'GPU accelerated' : 'Software rendering'}
            </p>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Camera captures video frame</li>
          <li>Hair segmentation identifies hair regions</li>
          <li>Volume detector calculates hair volume score (0-100)</li>
          <li>Flattening engine applies selected adjustment mode:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>Normal:</strong> Original image unchanged</li>
              <li><strong>Flattened:</strong> 60-80% volume reduction with edge smoothing</li>
              <li><strong>Bald:</strong> Complete hair removal with scalp preservation</li>
            </ul>
          </li>
          <li>Head contour extracted for wig positioning</li>
          <li>Result displayed with performance metrics</li>
        </ol>
      </div>
    </div>
  );
};

export default HairFlatteningExample;
