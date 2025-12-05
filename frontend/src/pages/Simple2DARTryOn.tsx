import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
import { productService } from '../services/product.service';
import { Product } from '../types/product';
import { useCartStore } from '../store/cartStore';
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';
import { AdjustmentModeToggle } from '../components/AR/AdjustmentModeToggle';
import { HairAdjustmentMessage } from '../components/AR/HairAdjustmentMessage';
import { ComparisonView } from '../components/AR/ComparisonView';
import { AdjustmentMode } from '../engine/Simple2DAREngine';

export const Simple2DARTryOn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [scale, setScale] = useState(0.8);  // Smaller default - easier to see
  const [offsetY, setOffsetY] = useState(-0.3);  // Higher up - on top of head
  const [offsetX, setOffsetX] = useState(0);
  const [opacity, setOpacity] = useState(0.9);  // More visible
  const [useUploadedImage, setUseUploadedImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFaceGuide, setShowFaceGuide] = useState(false);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [currentAdjustmentMode, setCurrentAdjustmentMode] = useState<AdjustmentMode>(AdjustmentMode.NORMAL);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [adjustedImage, setAdjustedImage] = useState<ImageData | null>(null);
  const addToCart = useCartStore((state) => state.addItem);

  const {
    videoRef,
    canvasRef,
    isInitialized,
    isLoading,
    error,
    cameraPermission,
    hairProcessingState,
    isUsingMediaPipe,
    initialize,
    loadWig,
    loadUserImage,
    switchToCamera,
    updateConfig,
    takeScreenshot,
    setAdjustmentMode,
    isHairFlatteningEnabled,
    stop,
  } = useSimple2DAR();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        // No product ID - use demo mode with placeholder
        setProduct({
          id: 'demo',
          name: 'Demo Wig (Testing Mode)',
          description: 'Testing AR without a specific product',
          price: 0,
          category: 'costume',
          theme: 'party',
          model_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          thumbnail_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          image_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          ar_image_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          stock_quantity: 999,
          is_accessory: false,
          colors: [{ 
            id: 'demo-color',
            product_id: 'demo',
            color_name: 'Purple', 
            color_hex: '#8b5cf6',
            created_at: new Date().toISOString()
          }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setSelectedColor('#8b5cf6');
        return;
      }
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].color_hex);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleStartAR = async () => {
    await initialize();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    try {
      // Initialize engine if not already done
      if (!isInitialized) {
        await initialize();
      }

      // Load the user's image
      await loadUserImage(file);
      setUseUploadedImage(true);

      // Load wig on top of the image with natural positioning
      if (product) {
        await loadWig({
          wigImageUrl: product.ar_image_url || product.image_url || product.thumbnail_url || '/placeholder-wig.png',
          wigColor: selectedColor,
          scale,
          offsetY,
          offsetX,
          opacity,
          enableHairFlattening: true, // Enable smart hair adjustment
        });
      }
    } catch (err) {
      console.error('Failed to load image:', err);
      alert('Failed to load image. Please try another one.');
    }
  };

  const handleSwitchToCamera = async () => {
    switchToCamera();
    setUseUploadedImage(false);
    await handleStartAR();
  };

  useEffect(() => {
    if (isInitialized && product && !useUploadedImage) {
      loadWig({
        wigImageUrl: product.ar_image_url || product.image_url || product.thumbnail_url || '/placeholder-wig.png',
        wigColor: selectedColor,
        scale,
        offsetY,
        offsetX,
        opacity,
        enableHairFlattening: false, // DISABLED - causing performance issues
      });
    }
  }, [isInitialized, product, selectedColor, scale, offsetY, offsetX, opacity]);

  // Monitor hair processing state and show info message when auto-flattening is applied
  useEffect(() => {
    if (!hairProcessingState) return;

    const { segmentationData, currentMode } = hairProcessingState;
    
    // Update current mode
    if (currentMode) {
      setCurrentAdjustmentMode(currentMode);
    }

    // Show info message when flattening is automatically applied
    if (segmentationData && segmentationData.volumeScore > 40 && currentMode === AdjustmentMode.FLATTENED) {
      setShowInfoMessage(true);
    }
  }, [hairProcessingState]);

  // Handle mouse/touch drag for wig positioning - IMPROVED
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInitialized) return;
    e.preventDefault(); // Prevent text selection while dragging
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Calculate delta as percentage of canvas size
    const deltaX = (currentX - dragStart.x) / rect.width;
    const deltaY = (currentY - dragStart.y) / rect.height;
    
    // Update offsets - this moves the wig
    setOffsetX(prev => prev + deltaX);
    setOffsetY(prev => prev + deltaY);
    
    // Update drag start for next move
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isInitialized || e.touches.length === 0) return;
    e.preventDefault(); // Prevent scrolling while dragging
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || e.touches.length === 0) return;
    e.preventDefault(); // Prevent scrolling
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.touches[0].clientX - rect.left;
    const currentY = e.touches[0].clientY - rect.top;
    
    // Calculate delta as percentage of canvas size
    const deltaX = (currentX - dragStart.x) / rect.width;
    const deltaY = (currentY - dragStart.y) / rect.height;
    
    // Update offsets - this moves the wig
    setOffsetX(prev => prev + deltaX);
    setOffsetY(prev => prev + deltaY);
    
    // Update drag start for next move
    setDragStart({ x: currentX, y: currentY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    updateConfig({ wigColor: color });
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    updateConfig({ scale: newScale });
  };

  const handleOffsetYChange = (newOffset: number) => {
    setOffsetY(newOffset);
    updateConfig({ offsetY: newOffset });
  };

  const handleOffsetXChange = (newOffset: number) => {
    setOffsetX(newOffset);
    updateConfig({ offsetX: newOffset });
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    updateConfig({ opacity: newOpacity });
  };

  const handleAutoFit = () => {
    // Auto-fit positions wig on top of head
    setScale(0.8);
    setOffsetY(-0.3);
    setOffsetX(0);
    setOpacity(0.9);
    updateConfig({ scale: 0.8, offsetY: -0.3, offsetX: 0, opacity: 0.9 });
  };

  const handleResetPosition = () => {
    // Reset to default position
    setScale(0.8);
    setOffsetY(-0.3);
    setOffsetX(0);
    setOpacity(0.9);
    updateConfig({ scale: 0.8, offsetY: -0.3, offsetX: 0, opacity: 0.9 });
  };

  const handleScreenshot = () => {
    const screenshot = takeScreenshot();
    if (screenshot) {
      const link = document.createElement('a');
      link.download = `${product?.name}-tryon.png`;
      link.href = screenshot;
      link.click();
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        quantity: 1,
        customizations: {
          color: selectedColor,
        },
      });
      navigate('/cart');
    }
  };

  // Handle adjustment mode change
  const handleAdjustmentModeChange = (mode: AdjustmentMode) => {
    setAdjustmentMode(mode);
    setCurrentAdjustmentMode(mode);
  };

  // Handle info message dismiss
  const handleDismissInfoMessage = () => {
    setShowInfoMessage(false);
  };

  // Handle comparison view toggle
  const handleToggleComparison = () => {
    if (!showComparison && canvasRef.current) {
      // Capture current images before showing comparison
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Store current adjusted image
        const currentImage = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setAdjustedImage(currentImage);
        
        // For original, we'd need to temporarily switch to normal mode
        // For now, we'll use the current image as a placeholder
        setOriginalImage(currentImage);
      }
    }
    setShowComparison(!showComparison);
  };

  // Handle comparison capture
  const handleComparisonCapture = (compositeImage: ImageData) => {
    // Create a temporary canvas to convert ImageData to data URL
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = compositeImage.width;
    tempCanvas.height = compositeImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(compositeImage, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/png');
      
      // Download the comparison image
      const link = document.createElement('a');
      link.download = `${product?.name}-comparison.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition"
          >
            <span>←</span> Back
          </button>
          <h1 className="text-2xl font-bold">{product.name} - Try On</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AR View */}
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-h-[700px]">
              {/* Hair Adjustment Info Message */}
              {isInitialized && showInfoMessage && (
                <HairAdjustmentMessage
                  show={showInfoMessage}
                  onDismiss={handleDismissInfoMessage}
                  autoHideDuration={4000}
                />
              )}

              {/* Comparison View Overlay */}
              {showComparison && (
                <ComparisonView
                  originalImage={originalImage}
                  adjustedImage={adjustedImage}
                  currentMode={currentAdjustmentMode}
                  onCapture={handleComparisonCapture}
                  isActive={showComparison}
                />
              )}
              {/* Video and Canvas - always rendered but hidden when not initialized */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: isInitialized && !useUploadedImage ? 'none' : 'none' }}
                playsInline
                muted
                autoPlay
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                style={{ display: isInitialized ? 'block' : 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              {/* MediaPipe Status Indicator */}
              {isInitialized && (
                <div className="absolute top-4 left-4 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isUsingMediaPipe 
                      ? 'bg-green-500/80 text-white' 
                      : 'bg-yellow-500/80 text-black'
                  }`}>
                    {isUsingMediaPipe ? '✓ MediaPipe Active' : '⚠ Basic Tracking'}
                  </div>
                </div>
              )}

              {/* Volume Score Indicator - overlays on canvas when hair data is available */}
              {isInitialized && hairProcessingState?.segmentationData && (
                <div className="absolute top-4 right-4 z-10">
                  <VolumeScoreIndicator
                    score={hairProcessingState.segmentationData.volumeScore}
                    category={hairProcessingState.segmentationData.volumeCategory}
                    isVisible={true}
                  />
                </div>
              )}

              {/* Face Guide Overlay - helps with positioning */}
              {isInitialized && showFaceGuide && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute top-[10%] left-[15%] w-[70%] h-[45%] border-2 border-dashed border-green-400 rounded-full opacity-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Face Area
                    </div>
                  </div>
                </div>
              )}
              
              {!isInitialized && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 z-10">
                  <div className="text-6xl">📸</div>
                  <h2 className="text-xl font-semibold">Virtual Try-On</h2>
                  <p className="text-gray-400 text-center max-w-md px-4">
                    Choose how you want to try on this wig
                  </p>
                  
                  {/* Mobile HTTPS Warning */}
                  {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
                   window.location.protocol === 'http:' && (
                    <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 max-w-md">
                      <p className="text-yellow-300 font-semibold">📱 Mobile Camera Tip</p>
                      <p className="text-yellow-200 text-sm mt-2">
                        Camera requires HTTPS on mobile. We recommend using the "Upload Photo" option for best results!
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 max-w-md">
                      <p className="text-red-300">{error}</p>
                      {cameraPermission === 'denied' && (
                        <p className="text-sm mt-2">
                          Camera blocked? No problem! Upload a photo instead.
                        </p>
                      )}
                      {error.includes('HTTPS') && (
                        <p className="text-sm mt-2">
                          💡 <strong>Solution:</strong> Use "Upload Photo" option below - no HTTPS needed!
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 w-full max-w-md">
                    {/* Upload Photo Option */}
                    <label className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition cursor-pointer text-center shadow-lg">
                        📤 Upload Your Photo (Recommended)
                      </div>
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-600"></div>
                      <span className="text-gray-500 text-sm">OR</span>
                      <div className="flex-1 h-px bg-gray-600"></div>
                    </div>

                    {/* Camera Option */}
                    <button
                      onClick={handleStartAR}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold transition disabled:opacity-50 shadow-lg"
                    >
                      {isLoading ? 'Starting...' : '📷 Use Camera'}
                    </button>
                  </div>

                  <div className="mt-4 text-sm text-gray-400 text-center max-w-md">
                    <p className="mb-2">💡 <strong>Tip:</strong> Upload a photo for best results!</p>
                    <p className="text-xs">Supported: JPG, PNG, WebP (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {isInitialized && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleScreenshot}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition"
                  >
                    📷 Take Photo
                  </button>
                  <button
                    onClick={stop}
                    className="px-6 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition"
                  >
                    Stop
                  </button>
                </div>

                {/* Switch between camera and upload */}
                <div className="flex gap-2">
                  {useUploadedImage ? (
                    <button
                      onClick={handleSwitchToCamera}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      📷 Switch to Camera
                    </button>
                  ) : (
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-sm font-semibold transition cursor-pointer text-center">
                        📤 Upload Different Photo
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            <div className="bg-purple-900/30 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                <p className="text-gray-300">{product.description}</p>
                <p className="text-2xl font-bold text-purple-300 mt-4">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Choose Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color.color_hex)}
                        className={`w-12 h-12 rounded-full border-4 transition ${
                          selectedColor === color.color_hex
                            ? 'border-white scale-110'
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.color_hex }}
                        title={color.color_name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hair Flattening Controls */}
              {isInitialized && isHairFlatteningEnabled() && hairProcessingState?.segmentationData && (
                <div>
                  <AdjustmentModeToggle
                    currentMode={currentAdjustmentMode}
                    onModeChange={handleAdjustmentModeChange}
                    volumeScore={hairProcessingState.segmentationData.volumeScore}
                    disabled={!hairProcessingState.isInitialized}
                  />
                  
                  {/* Comparison View Toggle */}
                  <button
                    onClick={handleToggleComparison}
                    className="w-full mt-3 bg-purple-700 hover:bg-purple-600 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {showComparison ? 'Hide Comparison' : 'Compare Before/After'}
                  </button>
                </div>
              )}

              {/* Adjustment Controls */}
              {isInitialized && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Adjust Fit</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAutoFit}
                        className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition"
                      >
                        ✨ Auto-Fit
                      </button>
                      <button
                        onClick={handleResetPosition}
                        className="text-sm text-purple-300 hover:text-white transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-200">
                      💡 <strong>Click Auto-Fit</strong> for automatic positioning
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Wig size automatically adjusts based on your head size
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2 font-semibold">
                      Size: {scale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.05"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Smaller</span>
                      <span>Larger</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-semibold">
                      Up/Down: {offsetY.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-0.8"
                      max="0.8"
                      step="0.02"
                      value={offsetY}
                      onChange={(e) => handleOffsetYChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>↑ Higher</span>
                      <span>↓ Lower</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-semibold">
                      Left/Right: {offsetX.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.02"
                      value={offsetX}
                      onChange={(e) => handleOffsetXChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>← Left</span>
                      <span>Right →</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-semibold">
                      Transparency: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.4"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>See-through</span>
                      <span>Solid</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <label className="text-sm">Show Face Guide</label>
                    <button
                      onClick={() => setShowFaceGuide(!showFaceGuide)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        showFaceGuide
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {showFaceGuide ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 py-4 rounded-lg font-bold text-lg transition"
              >
                🛒 Add to Cart
              </button>
            </div>

            {/* Tips */}
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💡 Tips for Best Results</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ensure your entire head is visible in frame</li>
                <li>• Face the camera directly with good lighting</li>
                <li>• Click Auto-Fit for natural wig placement</li>
                <li>• Wig sits on top of head - your face stays visible</li>
                <li>• Adjust opacity to see face more clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Simple2DARTryOn;
