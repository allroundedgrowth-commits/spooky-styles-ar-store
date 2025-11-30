import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
import { productService } from '../services/product.service';
import { Product } from '../types/product';
import { useCartStore } from '../store/cartStore';
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';

export const Simple2DARTryOn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [scale, setScale] = useState(1.5);
  const [offsetY, setOffsetY] = useState(-0.5);
  const [offsetX, setOffsetX] = useState(0);
  const [opacity, setOpacity] = useState(0.85);
  const [useUploadedImage, setUseUploadedImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFaceGuide, setShowFaceGuide] = useState(false);
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
          image_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          thumbnail_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          ar_image_url: 'https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Demo+Wig',
          ar_model_url: null,
          category: 'costume',
          stock_quantity: 999,
          colors: [{ color_name: 'Purple', color_hex: '#8b5cf6' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Product);
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
      });
    }
  }, [isInitialized, product, selectedColor, scale, offsetY, offsetX, opacity]);

  // Handle mouse/touch drag for wig positioning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInitialized) return;
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
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = (currentX - dragStart.x) / rect.width;
    const deltaY = (currentY - dragStart.y) / rect.height;
    
    setOffsetX(prev => prev + deltaX);
    setOffsetY(prev => prev + deltaY);
    
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isInitialized || e.touches.length === 0) return;
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
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.touches[0].clientX - rect.left;
    const currentY = e.touches[0].clientY - rect.top;
    
    const deltaX = (currentX - dragStart.x) / rect.width;
    const deltaY = (currentY - dragStart.y) / rect.height;
    
    setOffsetX(prev => prev + deltaX);
    setOffsetY(prev => prev + deltaY);
    
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
    // Auto-fit positions wig ONLY on top of head
    // Face remains completely visible
    setScale(1.2);    // Smaller - just covers top of head
    setOffsetY(-0.7); // Much higher - only top of head
    setOffsetX(0);
    setOpacity(0.7);  // More transparent to see through
    updateConfig({ scale: 1.2, offsetY: -0.7, offsetX: 0, opacity: 0.7 });
  };

  const handleResetPosition = () => {
    // Reset to minimal coverage - face fully visible
    setScale(1.2);
    setOffsetY(-0.7);
    setOffsetX(0);
    setOpacity(0.7);
    updateConfig({ scale: 1.2, offsetY: -0.7, offsetX: 0, opacity: 0.7 });
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
              {/* Video and Canvas - always rendered but hidden when not initialized */}
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${isInitialized ? 'hidden' : 'hidden'}`}
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover ${isInitialized ? 'block' : 'hidden'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                  
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 max-w-md">
                      <p className="text-red-300">{error}</p>
                      {cameraPermission === 'denied' && (
                        <p className="text-sm mt-2">
                          Camera blocked? No problem! Upload a photo instead.
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
                    <label className="block text-sm mb-2">
                      Size: {scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Vertical Position: {offsetY.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={offsetY}
                      onChange={(e) => handleOffsetYChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Horizontal Position: {offsetX.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={offsetX}
                      onChange={(e) => handleOffsetXChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Wig Opacity: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Lower opacity lets your face show through more
                    </p>
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
