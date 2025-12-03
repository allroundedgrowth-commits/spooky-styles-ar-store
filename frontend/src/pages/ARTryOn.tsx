import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimple2DAR } from '../hooks/useSimple2DAR';
import { productService } from '../services/product.service';
import { Product } from '../types/product';
import { useCartStore } from '../store/cartStore';

const ARTryOn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [scale, setScale] = useState(1.5);
  const [offsetY, setOffsetY] = useState(-0.3);
  const [useUploadedImage, setUseUploadedImage] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const {
    videoRef,
    canvasRef,
    isInitialized,
    isLoading,
    error,
    cameraPermission,
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
      if (!id) return;
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

      // Load wig on top of the image
      if (product) {
        await loadWig({
          wigImageUrl: product.ar_image_url || product.image_url || product.thumbnail_url || '/placeholder-wig.png',
          wigColor: selectedColor,
          scale,
          offsetY,
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
      });
    }
  }, [isInitialized, product, selectedColor, scale, offsetY]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    updateConfig({ wigColor: color });
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    updateConfig({ scale: newScale });
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffsetY(newOffset);
    updateConfig({ offsetY: newOffset });
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
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4]">
              {!isInitialized ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
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
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover hidden"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </>
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
                  ${product.price.toFixed(2)}
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
                  <h3 className="text-lg font-semibold">Adjust Fit</h3>
                  
                  <div>
                    <label className="block text-sm mb-2">
                      Size: {scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Position: {offsetY.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="-0.5"
                      max="0"
                      step="0.05"
                      value={offsetY}
                      onChange={(e) => handleOffsetChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
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
                <li>• Face the camera directly</li>
                <li>• Ensure good lighting</li>
                <li>• Keep your head centered</li>
                <li>• Adjust size and position as needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ARTryOn;
