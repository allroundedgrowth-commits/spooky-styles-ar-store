/**
 * Hair Segmentation Example
 * 
 * Demonstrates how to use the HairSegmentationModule for detecting
 * and segmenting hair in real-time camera feeds.
 */

import React, { useEffect, useRef, useState } from 'react';
import { HairSegmentationModule, SegmentationResult } from '../engine/HairSegmentationModule';
import { HairSegmentationLoader } from '../components/AR/HairSegmentationLoader';

/**
 * Example component showing hair segmentation in action
 */
export const HairSegmentationExample: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [segmentation] = useState(() => new HairSegmentationModule());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<SegmentationResult | null>(null);
  const [fps, setFps] = useState(0);

  // Initialize camera and segmentation
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;
    let frameCount = 0;
    let lastFpsUpdate = Date.now();

    const init = async () => {
      try {
        // Initialize segmentation model
        setIsLoading(true);
        await segmentation.initialize();
        setIsLoading(false);

        // Get camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Start processing loop
        processFrame();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setIsLoading(false);
      }
    };

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !maskCanvasRef.current) {
        animationId = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');

      if (!ctx || !maskCtx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(processFrame);
        return;
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      maskCanvas.width = video.videoWidth;
      maskCanvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Process segmentation (throttle to avoid overwhelming the system)
      if (!isProcessing) {
        setIsProcessing(true);
        
        try {
          const result = await segmentation.segmentHair(imageData);
          setLastResult(result);

          // Draw hair mask
          maskCtx.putImageData(result.hairMask, 0, 0);

          // Update FPS counter
          frameCount++;
          const now = Date.now();
          if (now - lastFpsUpdate >= 1000) {
            setFps(frameCount);
            frameCount = 0;
            lastFpsUpdate = now;
          }
        } catch (err) {
          console.error('Segmentation error:', err);
        } finally {
          setIsProcessing(false);
        }
      }

      animationId = requestAnimationFrame(processFrame);
    };

    init();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      segmentation.dispose();
    };
  }, [segmentation, isProcessing]);

  return (
    <div className="min-h-screen bg-halloween-black p-8">
      <HairSegmentationLoader isLoading={isLoading} error={error} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-halloween-purple mb-8 text-center">
          Hair Segmentation Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original Video */}
          <div className="bg-halloween-darkPurple rounded-lg p-4 border-2 border-halloween-purple">
            <h2 className="text-xl font-bold text-white mb-4">Original Video</h2>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
          </div>

          {/* Hair Mask */}
          <div className="bg-halloween-darkPurple rounded-lg p-4 border-2 border-halloween-orange">
            <h2 className="text-xl font-bold text-white mb-4">Hair Mask</h2>
            <canvas
              ref={maskCanvasRef}
              className="w-full rounded-lg bg-black"
            />
          </div>
        </div>

        {/* Stats */}
        {lastResult && (
          <div className="mt-8 bg-halloween-darkPurple rounded-lg p-6 border-2 border-halloween-green">
            <h2 className="text-2xl font-bold text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-halloween-black rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Processing Time</div>
                <div className="text-2xl font-bold text-halloween-purple">
                  {lastResult.processingTime.toFixed(1)} ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: &lt; 500ms
                </div>
              </div>

              <div className="bg-halloween-black rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Confidence</div>
                <div className="text-2xl font-bold text-halloween-orange">
                  {(lastResult.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Segmentation quality
                </div>
              </div>

              <div className="bg-halloween-black rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Frame Rate</div>
                <div className="text-2xl font-bold text-halloween-green">
                  {fps} FPS
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: 15+ FPS
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-halloween-darkPurple rounded-lg p-6 border-2 border-halloween-purple">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-halloween-purple mr-2">•</span>
              <span>The left panel shows your live camera feed</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-orange mr-2">•</span>
              <span>The right panel shows the detected hair mask (white = hair, black = background)</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-green mr-2">•</span>
              <span>Statistics show real-time performance metrics</span>
            </li>
            <li className="flex items-start">
              <span className="text-halloween-purple mr-2">•</span>
              <span>Processing time should stay under 500ms for optimal performance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HairSegmentationExample;
