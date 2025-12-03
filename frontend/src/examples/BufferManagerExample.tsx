/**
 * Buffer Manager Usage Example
 * 
 * Demonstrates how to use BufferManager for efficient memory management
 * during hair segmentation and flattening operations.
 */

import React, { useEffect, useRef, useState } from 'react';
import { BufferManager } from '../engine/BufferManager';
import { HairSegmentationModule } from '../engine/HairSegmentationModule';
import { HairFlatteningEngine, AdjustmentMode } from '../engine/HairFlatteningEngine';

/**
 * Example component showing BufferManager integration
 */
export const BufferManagerExample: React.FC = () => {
  const [memoryStats, setMemoryStats] = useState({
    bufferCount: 0,
    memoryUsageMB: 0,
    isHealthy: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const bufferManagerRef = useRef<BufferManager | null>(null);
  const segmentationRef = useRef<HairSegmentationModule | null>(null);
  const flatteningRef = useRef<HairFlatteningEngine | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize buffer manager and modules
    bufferManagerRef.current = new BufferManager();
    segmentationRef.current = new HairSegmentationModule();
    flatteningRef.current = new HairFlatteningEngine();

    // Initialize segmentation
    segmentationRef.current.initialize().catch(console.error);

    // Update memory stats periodically
    const statsInterval = setInterval(() => {
      if (bufferManagerRef.current) {
        const stats = bufferManagerRef.current.getStats();
        setMemoryStats({
          bufferCount: stats.bufferCount,
          memoryUsageMB: stats.memoryUsageMB,
          isHealthy: bufferManagerRef.current.isMemoryHealthy()
        });
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(statsInterval);
      
      if (bufferManagerRef.current) {
        bufferManagerRef.current.clearBuffers();
      }
      
      if (segmentationRef.current) {
        segmentationRef.current.dispose();
      }
      
      if (flatteningRef.current) {
        flatteningRef.current.dispose();
      }
    };
  }, []);

  /**
   * Start camera and begin processing
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Initialize flattening engine with video dimensions
        if (flatteningRef.current) {
          flatteningRef.current.initialize(1280, 720, true);
          flatteningRef.current.setMode(AdjustmentMode.FLATTENED);
        }
        
        setIsProcessing(true);
        processFrame();
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  /**
   * Process a single frame using BufferManager
   */
  const processFrame = async () => {
    if (!isProcessing || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || !bufferManagerRef.current || !segmentationRef.current || !flatteningRef.current) {
      return;
    }

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Get a buffer from the pool for the video frame
      const frameBuffer = bufferManagerRef.current.getBuffer(
        video.videoWidth,
        video.videoHeight
      );

      // Draw video frame to canvas and get ImageData
      ctx.drawImage(video, 0, 0);
      const videoFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Copy to our pooled buffer
      frameBuffer.data.set(videoFrame.data);

      // Perform segmentation using the pooled buffer
      const segmentationResult = await segmentationRef.current.segmentHair(frameBuffer);

      // Get another buffer for the flattening result
      const resultBuffer = bufferManagerRef.current.getBuffer(
        canvas.width,
        canvas.height
      );

      // Apply flattening
      const flatteningResult = await flatteningRef.current.applyFlattening(
        frameBuffer,
        segmentationResult.hairMask,
        { x: 0, y: 0, width: canvas.width, height: canvas.height }
      );

      // Display the result
      ctx.putImageData(flatteningResult.flattenedImage, 0, 0);

      // Return buffers to pool
      bufferManagerRef.current.returnBuffer(frameBuffer);
      bufferManagerRef.current.returnBuffer(resultBuffer);

      // Continue processing
      if (isProcessing) {
        requestAnimationFrame(processFrame);
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  };

  /**
   * Stop processing and cleanup
   */
  const stopProcessing = () => {
    setIsProcessing(false);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear buffers
    if (bufferManagerRef.current) {
      bufferManagerRef.current.clearBuffers();
    }
  };

  /**
   * Force cleanup of old buffers
   */
  const forceCleanup = () => {
    if (bufferManagerRef.current) {
      bufferManagerRef.current.forceCleanup();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-halloween-purple">
        Buffer Manager Example
      </h1>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Memory Statistics
        </h2>
        
        <div className="grid grid-cols-3 gap-4 text-white">
          <div>
            <div className="text-sm text-gray-400">Buffer Count</div>
            <div className="text-2xl font-bold">{memoryStats.bufferCount}</div>
            <div className="text-xs text-gray-500">Max: 5</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Memory Usage</div>
            <div className="text-2xl font-bold">
              {memoryStats.memoryUsageMB.toFixed(2)} MB
            </div>
            <div className="text-xs text-gray-500">Max: 100 MB</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Health Status</div>
            <div className={`text-2xl font-bold ${
              memoryStats.isHealthy ? 'text-halloween-green' : 'text-red-500'
            }`}>
              {memoryStats.isHealthy ? 'Healthy' : 'Warning'}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-halloween-black rounded">
          <div className="text-xs text-gray-400 mb-2">Memory Usage Bar</div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                memoryStats.memoryUsageMB < 50
                  ? 'bg-halloween-green'
                  : memoryStats.memoryUsageMB < 80
                  ? 'bg-halloween-orange'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(memoryStats.memoryUsageMB, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Video Processing
        </h2>
        
        <div className="mb-4">
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            muted
          />
          
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border-2 border-halloween-purple"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={startCamera}
            disabled={isProcessing}
            className="px-6 py-2 bg-halloween-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Camera
          </button>
          
          <button
            onClick={stopProcessing}
            disabled={!isProcessing}
            className="px-6 py-2 bg-halloween-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop Processing
          </button>
          
          <button
            onClick={forceCleanup}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Force Cleanup
          </button>
        </div>
      </div>

      <div className="bg-halloween-darkPurple p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          How It Works
        </h2>
        
        <div className="text-white space-y-3 text-sm">
          <p>
            <strong className="text-halloween-purple">Buffer Pooling:</strong>{' '}
            The BufferManager maintains a pool of ImageData buffers that are reused
            across frames, eliminating the need to allocate new buffers for each frame.
          </p>
          
          <p>
            <strong className="text-halloween-purple">Memory Limit:</strong>{' '}
            The manager enforces a 100MB memory limit by automatically removing the
            oldest buffers when the limit is approached.
          </p>
          
          <p>
            <strong className="text-halloween-purple">Automatic Cleanup:</strong>{' '}
            When the pool reaches 5 buffers, the least recently used buffer is
            automatically removed to make room for new allocations.
          </p>
          
          <p>
            <strong className="text-halloween-purple">Performance:</strong>{' '}
            By reusing buffers, we reduce garbage collection overhead and maintain
            smooth 24+ FPS performance during real-time processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BufferManagerExample;
