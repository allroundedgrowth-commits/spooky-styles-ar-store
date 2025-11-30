/**
 * Wig Alignment Adjuster Example
 * 
 * Demonstrates how to use the WigAlignmentAdjuster class to position
 * and blend wigs with flattened hair backgrounds.
 */

import React, { useRef, useEffect, useState } from 'react';
import { WigAlignmentAdjuster, HeadPose, WigTransform, AlignmentQuality } from '../engine/WigAlignmentAdjuster';
import { HairFlatteningEngine, AdjustmentMode, Point } from '../engine/HairFlatteningEngine';
import { HairSegmentationModule } from '../engine/HairSegmentationModule';
import { HairVolumeDetector, BoundingBox } from '../engine/HairVolumeDetector';

const WigAlignmentExample: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alignmentQuality, setAlignmentQuality] = useState<AlignmentQuality | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [blendWidth, setBlendWidth] = useState<number>(10);

  // Engine instances
  const adjusterRef = useRef<WigAlignmentAdjuster | null>(null);
  const flatteningEngineRef = useRef<HairFlatteningEngine | null>(null);
  const segmentationRef = useRef<HairSegmentationModule | null>(null);
  const volumeDetectorRef = useRef<HairVolumeDetector | null>(null);
  const wigTransformRef = useRef<WigTransform | null>(null);

  useEffect(() => {
    // Initialize engines
    adjusterRef.current = new WigAlignmentAdjuster();
    flatteningEngineRef.current = new HairFlatteningEngine();
    segmentationRef.current = new HairSegmentationModule();
    volumeDetectorRef.current = new HairVolumeDetector();

    // Set blend width
    adjusterRef.current.setBlendWidth(blendWidth);

    return () => {
      // Cleanup
      if (flatteningEngineRef.current) {
        flatteningEngineRef.current.dispose();
      }
      if (segmentationRef.current) {
        segmentationRef.current.dispose();
      }
    };
  }, [blendWidth]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialize segmentation
      if (segmentationRef.current) {
        await segmentationRef.current.initialize();
      }

      // Initialize flattening engine
      if (flatteningEngineRef.current) {
        flatteningEngineRef.current.initialize(640, 480, true);
        flatteningEngineRef.current.setMode(AdjustmentMode.FLATTENED);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture frame
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      const startTime = performance.now();

      // 1. Segment hair
      const segmentationResult = await segmentationRef.current!.segmentHair(imageData);

      // 2. Detect volume
      const faceRegion: BoundingBox = {
        x: canvas.width * 0.25,
        y: canvas.height * 0.2,
        width: canvas.width * 0.5,
        height: canvas.height * 0.6
      };

      // Calculate volume (used for determining if flattening should be applied)
      volumeDetectorRef.current!.calculateVolume(
        segmentationResult.hairMask,
        faceRegion
      );

      // 3. Apply flattening
      const flattenedResult = await flatteningEngineRef.current!.applyFlattening(
        imageData,
        segmentationResult.hairMask,
        faceRegion
      );

      // 4. Create mock wig image (purple rectangle with alpha)
      const wigImage = createMockWigImage(300, 200);

      // 5. Create mock head pose
      const headPose: HeadPose = {
        rotation: {
          x: 0, // No pitch
          y: 0, // No yaw
          z: 0  // No roll
        },
        position: {
          x: canvas.width / 2,
          y: canvas.height / 2,
          z: 0
        }
      };

      // 6. Calculate or update wig position
      if (!wigTransformRef.current) {
        wigTransformRef.current = adjusterRef.current!.calculateWigPosition(
          flattenedResult.headContour,
          { width: wigImage.width, height: wigImage.height },
          headPose
        );
      } else {
        wigTransformRef.current = adjusterRef.current!.updateForHeadRotation(
          wigTransformRef.current,
          headPose
        );
      }

      // 7. Blend wig with background
      const blendedImage = adjusterRef.current!.blendWigEdges(
        wigImage,
        flattenedResult.flattenedImage,
        wigTransformRef.current
      );

      // 8. Validate alignment
      const quality = adjusterRef.current!.validateAlignment(
        wigImage,
        flattenedResult.flattenedImage,
        wigTransformRef.current
      );

      setAlignmentQuality(quality);

      // Display result
      ctx.putImageData(blendedImage, 0, 0);

      // Draw head contour for visualization
      drawHeadContour(ctx, flattenedResult.headContour);

      // Draw wig transform info
      drawTransformInfo(ctx, wigTransformRef.current, quality);

      const totalTime = performance.now() - startTime;
      setProcessingTime(totalTime);

    } catch (error) {
      console.error('Error processing frame:', error);
    }

    // Continue processing
    requestAnimationFrame(processFrame);
  };

  const createMockWigImage = (width: number, height: number): ImageData => {
    const wigData = new ImageData(width, height);
    const data = wigData.data;

    // Create a purple wig with gradient alpha
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Purple color
        data[index] = 139;     // R
        data[index + 1] = 92;  // G
        data[index + 2] = 246; // B

        // Gradient alpha (more transparent at edges)
        const distFromCenter = Math.sqrt(
          Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
        );
        const maxDist = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
        const alpha = Math.max(0, 255 * (1 - distFromCenter / maxDist));

        data[index + 3] = alpha; // A
      }
    }

    return wigData;
  };

  const drawHeadContour = (ctx: CanvasRenderingContext2D, contour: Point[]) => {
    if (contour.length === 0) return;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.moveTo(contour[0].x, contour[0].y);
    for (let i = 1; i < contour.length; i++) {
      ctx.lineTo(contour[i].x, contour[i].y);
    }

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#10b981';
    for (const point of contour) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawTransformInfo = (
    ctx: CanvasRenderingContext2D,
    transform: WigTransform,
    quality: AlignmentQuality
  ) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';

    ctx.fillText(`Position: (${transform.position.x.toFixed(1)}, ${transform.position.y.toFixed(1)})`, 20, 30);
    ctx.fillText(`Scale: ${transform.scale.toFixed(3)}`, 20, 50);
    ctx.fillText(`Rotation: ${(transform.rotation * 180 / Math.PI).toFixed(1)}°`, 20, 70);
    ctx.fillText(`Skew: (${transform.skew.x.toFixed(3)}, ${transform.skew.y.toFixed(3)})`, 20, 90);

    const gapStatus = quality.hasGaps ? '❌ Gaps Detected' : '✅ No Gaps';
    ctx.fillStyle = quality.hasGaps ? '#f97316' : '#10b981';
    ctx.fillText(gapStatus, 20, 110);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Blend Quality: ${(quality.blendQuality * 100).toFixed(1)}%`, 20, 130);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
    wigTransformRef.current = null; // Reset transform
    requestAnimationFrame(processFrame);
  };

  const handleStopProcessing = () => {
    setIsProcessing(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-halloween-purple">
        Wig Alignment Adjuster Example
      </h1>

      <div className="bg-halloween-darkPurple p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-halloween-orange">
          Controls
        </h2>

        <div className="space-y-4">
          <div>
            <button
              onClick={startCamera}
              className="bg-halloween-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-80 mr-4"
            >
              Start Camera
            </button>

            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="bg-halloween-green text-white px-6 py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50 mr-4"
            >
              Start Processing
            </button>

            <button
              onClick={handleStopProcessing}
              disabled={!isProcessing}
              className="bg-halloween-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50"
            >
              Stop Processing
            </button>
          </div>

          <div>
            <label className="block text-white mb-2">
              Blend Width: {blendWidth}px
            </label>
            <input
              type="range"
              min="10"
              max="30"
              value={blendWidth}
              onChange={(e) => setBlendWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">
            Camera Feed (Hidden)
          </h3>
          <video
            ref={videoRef}
            className="hidden"
            playsInline
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">
            Aligned Wig Result
          </h3>
          <canvas
            ref={canvasRef}
            className="w-full border-2 border-halloween-purple rounded-lg"
          />
        </div>
      </div>

      {alignmentQuality && (
        <div className="mt-6 bg-halloween-darkPurple p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-halloween-orange">
            Alignment Quality Metrics
          </h3>

          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="font-semibold">Gap Detection:</p>
              <p className={alignmentQuality.hasGaps ? 'text-halloween-orange' : 'text-halloween-green'}>
                {alignmentQuality.hasGaps ? '❌ Gaps Detected' : '✅ No Gaps'}
              </p>
            </div>

            <div>
              <p className="font-semibold">Blend Quality:</p>
              <p>{(alignmentQuality.blendQuality * 100).toFixed(1)}%</p>
            </div>

            <div>
              <p className="font-semibold">Edge Smoothness:</p>
              <p>{(alignmentQuality.edgeSmoothness * 100).toFixed(1)}%</p>
            </div>

            <div>
              <p className="font-semibold">Processing Time:</p>
              <p className={processingTime > 200 ? 'text-halloween-orange' : 'text-halloween-green'}>
                {processingTime.toFixed(1)}ms
                {processingTime > 200 && ' ⚠️ Exceeds 200ms target'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-halloween-darkPurple p-6 rounded-lg text-white">
        <h3 className="text-xl font-semibold mb-4 text-halloween-orange">
          How It Works
        </h3>

        <ol className="list-decimal list-inside space-y-2">
          <li>Camera captures video frame</li>
          <li>Hair segmentation identifies hair regions</li>
          <li>Volume detection calculates hair volume score</li>
          <li>Flattening engine reduces hair volume and extracts head contour</li>
          <li>Wig alignment adjuster calculates optimal wig position</li>
          <li>Wig edges are blended with flattened background</li>
          <li>Alignment quality is validated for gaps and smoothness</li>
          <li>Result is displayed with overlay information</li>
        </ol>

        <div className="mt-4 p-4 bg-halloween-black rounded">
          <p className="font-semibold mb-2">Performance Requirements:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Position calculation: &lt; 200ms ✓</li>
            <li>Rotation updates: &lt; 200ms ✓</li>
            <li>Minimum blend width: 10 pixels ✓</li>
            <li>Head rotation support: ±45 degrees ✓</li>
            <li>Gap detection: Automatic ✓</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WigAlignmentExample;
