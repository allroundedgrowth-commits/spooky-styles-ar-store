import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import ARCanvas from '../components/AR/ARCanvas';
import FPSMonitor from '../components/AR/FPSMonitor';
import { TrackingGuidance } from '../components/AR/TrackingGuidance';
import { LightingWarning } from '../components/AR/LightingWarning';
import { TrackingStatus } from '../components/AR/TrackingStatus';
import { ColorPicker } from '../components/AR/ColorPicker';
import { AccessorySelector } from '../components/AR/AccessorySelector';
import { SocialShareModal } from '../components/AR/SocialShareModal';
import { ARTryOnEngine } from '../engine/ARTryOnEngine';
import { useFaceTracking } from '../hooks/useFaceTracking';
import { useARSession, ActiveAccessory } from '../hooks/useARSession';
import { productService } from '../services/product.service';
import { ScreenshotService } from '../services/screenshot.service';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types/product';

const ARTryOn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('productId');
  
  const [engine, setEngine] = useState<ARTryOnEngine | null>(null);
  const [fps, setFps] = useState(0);
  const [showFPS, setShowFPS] = useState(true);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentWigModel, setCurrentWigModel] = useState<THREE.Group | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [availableWigs, setAvailableWigs] = useState<Product[]>([]);
  const [availableAccessories, setAvailableAccessories] = useState<Product[]>([]);
  const [showWigCarousel, setShowWigCarousel] = useState(false);
  const [showAccessoryPanel, setShowAccessoryPanel] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [capturedScreenshot, setCapturedScreenshot] = useState<Blob | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { addItem } = useCartStore();
  
  // AR session management
  const { 
    currentProduct, 
    customization, 
    loadProduct, 
    selectColor,
    addAccessory,
    removeAccessory,
    getAvailableLayers,
  } = useARSession();
  
  // Initialize face tracking
  const {
    isInitialized: isFaceTrackingInitialized,
    isTracking,
    status: trackingStatus,
    landmarks,
    headPose,
    lighting,
    error: trackingError,
    start: startFaceTracking,
    stop: stopFaceTracking,
  } = useFaceTracking(videoRef, {
    autoStart: false,
    lightingThreshold: 0.3,
    trackingLostThreshold: 2000,
  });

  const handleEngineReady = (arEngine: ARTryOnEngine) => {
    setEngine(arEngine);
    // Store canvas reference for screenshot capture
    canvasRef.current = arEngine.getRenderer().domElement;
    console.log('AR Engine ready for use');
  };

  const handleFPSUpdate = (currentFps: number) => {
    setFps(currentFps);
  };

  const handleStartTryOn = async () => {
    try {
      setCameraError(null);
      await startFaceTracking();
      setIsCameraStarted(true);
    } catch (error: any) {
      console.error('Failed to start face tracking:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions to use AR try-on.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Failed to start camera. Please try again.');
      }
    }
  };

  const handleStopTryOn = () => {
    stopFaceTracking();
    setIsCameraStarted(false);
  };

  // Check WebGL support on mount
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLError('WebGL is not supported on this device. AR try-on requires WebGL support.');
    }
  }, []);

  // Load available wigs and accessories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [wigs, accessories] = await Promise.all([
          productService.getProducts({ is_accessory: false }),
          productService.getProducts({ is_accessory: true }),
        ]);
        setAvailableWigs(wigs);
        setAvailableAccessories(accessories);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Load product if productId is provided in URL
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          setIsLoadingProduct(true);
          const product = await productService.getProductById(productId);
          loadProduct(product);
        } catch (error) {
          console.error('Failed to load product:', error);
        } finally {
          setIsLoadingProduct(false);
        }
      }
    };
    fetchProduct();
  }, [productId, loadProduct]);

  // Load wig model when product is loaded and engine is ready
  useEffect(() => {
    const loadWigModel = async () => {
      if (engine && currentProduct && !currentWigModel) {
        try {
          setIsLoadingProduct(true);
          const model = await engine.loadWigModel(
            currentProduct.model_url,
            (progress) => setLoadingProgress(progress)
          );
          await engine.setCurrentWig(model);
          setCurrentWigModel(model);
          console.log('Wig model loaded and set');
        } catch (error) {
          console.error('Failed to load wig model:', error);
        } finally {
          setIsLoadingProduct(false);
          setLoadingProgress(0);
        }
      }
    };
    loadWigModel();
  }, [engine, currentProduct, currentWigModel]);

  // Update wig position based on face tracking
  useEffect(() => {
    if (engine && currentWigModel && landmarks && headPose && isTracking) {
      engine.updateWigPosition(landmarks, headPose);
    }
  }, [engine, currentWigModel, landmarks, headPose, isTracking]);

  // Apply color customization when selected
  useEffect(() => {
    if (engine && currentWigModel && customization.selectedColor) {
      engine.applyColorCustomization(customization.selectedColor);
    }
  }, [engine, currentWigModel, customization.selectedColor]);

  // Update AR engine lighting based on detected conditions
  useEffect(() => {
    if (engine && lighting) {
      engine.updateLighting(lighting.brightness);
    }
  }, [engine, lighting]);

  const handleColorSelect = (colorHex: string, colorName: string) => {
    selectColor(colorHex, colorName);
  };

  const handleWigSelect = async (product: Product) => {
    if (engine) {
      try {
        setIsLoadingProduct(true);
        setCurrentWigModel(null);
        loadProduct(product);
        setShowWigCarousel(false);
      } catch (error) {
        console.error('Failed to select wig:', error);
      }
    }
  };

  const handleAddAccessory = async (product: Product, layer: number) => {
    if (engine) {
      try {
        setIsLoadingProduct(true);
        const model = await engine.loadAccessoryModel(product.model_url);
        const accessoryId = `${product.id}-${layer}-${Date.now()}`;
        await engine.addAccessoryLayer(model, layer);
        
        const activeAccessory: ActiveAccessory = {
          id: accessoryId,
          productId: product.id,
          layer,
          product,
        };
        addAccessory(activeAccessory);
      } catch (error) {
        console.error('Failed to add accessory:', error);
      } finally {
        setIsLoadingProduct(false);
      }
    }
  };

  const handleRemoveAccessory = async (accessoryId: string) => {
    const accessory = customization.accessories.find(acc => acc.id === accessoryId);
    if (engine && accessory) {
      try {
        await engine.removeAccessoryLayer(accessory.layer);
        removeAccessory(accessoryId);
      } catch (error) {
        console.error('Failed to remove accessory:', error);
      }
    }
  };

  const handleCaptureScreenshot = async () => {
    if (!canvasRef.current) {
      console.error('Canvas not available for screenshot');
      return;
    }
    
    try {
      setIsCapturingScreenshot(true);
      
      // Capture screenshot at 1080p with watermark
      const screenshot = await ScreenshotService.captureFromCanvas(canvasRef.current, {
        width: 1920,
        height: 1080,
        addWatermark: true,
        quality: 1.0,
      });
      
      // Store screenshot temporarily
      await ScreenshotService.storeScreenshot(screenshot, currentProduct?.id);
      
      // Set screenshot and open share modal
      setCapturedScreenshot(screenshot);
      setShowShareModal(true);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    // Don't clear the screenshot immediately to allow for re-sharing
    setTimeout(() => {
      if (capturedScreenshot) {
        setCapturedScreenshot(null);
      }
    }, 1000);
  };

  const handleAddToCart = async () => {
    if (!currentProduct) return;
    
    try {
      setIsAddingToCart(true);
      
      // Add main product with customizations
      await addItem({
        productId: currentProduct.id,
        quantity: 1,
        customizations: {
          color: customization.selectedColor || undefined,
          accessories: customization.accessories.map(acc => acc.productId),
        },
      });
      
      // Show success message and navigate to cart
      alert('Added to cart! 🛒');
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Social Share Modal */}
      <SocialShareModal
        screenshot={capturedScreenshot}
        productName={currentProduct?.name}
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-halloween-orange mb-2">
            AR Try-On 🎃
          </h1>
          <p className="text-gray-400">
            Virtual try-on experience with face tracking
          </p>
        </div>

        {/* Error Messages */}
        {webGLError && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">⚠️ WebGL Not Supported</h3>
            <p className="text-gray-300 text-sm">{webGLError}</p>
            <p className="text-gray-400 text-sm mt-2">
              Please try using a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        )}

        {cameraError && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">📷 Camera Access Error</h3>
            <p className="text-gray-300 text-sm">{cameraError}</p>
            <p className="text-gray-400 text-sm mt-2">
              Please allow camera permissions in your browser settings and refresh the page.
            </p>
          </div>
        )}

        {/* AR Canvas Container */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" 
             style={{ height: '70vh', minHeight: '500px' }}>
          
          {/* Video Element for Face Tracking (hidden behind canvas) */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: isCameraStarted ? 'block' : 'none' }}
            autoPlay
            playsInline
            muted
          />
          
          {/* AR Canvas Overlay */}
          <div className="absolute inset-0">
            <ARCanvas 
              onEngineReady={handleEngineReady}
              onFPSUpdate={handleFPSUpdate}
              className="w-full h-full"
            />
          </div>

          {/* Tracking Status Overlay */}
          {isCameraStarted && (
            <TrackingStatus
              status={trackingStatus}
              landmarks={landmarks}
              headPose={headPose}
              showDetails={showTrackingDetails}
            />
          )}

          {/* FPS Monitor Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <FPSMonitor fps={fps} targetFps={24} show={showFPS} />
          </div>

          {/* Tracking Guidance Overlay */}
          {isCameraStarted && (
            <TrackingGuidance status={trackingStatus} error={trackingError} />
          )}

          {/* Lighting Warning Overlay */}
          {isCameraStarted && (
            <LightingWarning lighting={lighting} threshold={0.3} />
          )}

          {/* Wig Selection Button */}
          {isCameraStarted && !showWigCarousel && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowWigCarousel(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <span>👻</span>
                <span>Change Wig</span>
              </button>
            </div>
          )}

          {/* Wig Carousel Overlay */}
          {showWigCarousel && (
            <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-halloween-orange">Select a Wig</h3>
                  <button
                    onClick={() => setShowWigCarousel(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableWigs.map((wig) => (
                    <div
                      key={wig.id}
                      onClick={() => handleWigSelect(wig)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        currentProduct?.id === wig.id
                          ? 'border-halloween-orange shadow-lg shadow-orange-500/50'
                          : 'border-gray-700 hover:border-purple-500'
                      }`}
                    >
                      <img
                        src={wig.thumbnail_url}
                        alt={wig.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3 bg-gray-800">
                        <h4 className="text-white font-semibold text-sm truncate">{wig.name}</h4>
                        <p className="text-halloween-orange font-bold text-sm mt-1">
                          ${wig.promotional_price || wig.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Color Picker Overlay */}
          {currentProduct && currentProduct.colors.length > 0 && !showWigCarousel && !showAccessoryPanel && (
            <div className="absolute top-20 right-4 z-10">
              <ColorPicker
                colors={currentProduct.colors}
                selectedColor={customization.selectedColor}
                onColorSelect={handleColorSelect}
                disabled={!currentWigModel || isLoadingProduct}
              />
            </div>
          )}

          {/* Accessory Panel Toggle Button */}
          {isCameraStarted && !showAccessoryPanel && !showWigCarousel && (
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => setShowAccessoryPanel(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <span>🎭</span>
                <span>Accessories</span>
              </button>
            </div>
          )}

          {/* Accessory Panel Overlay */}
          {showAccessoryPanel && (
            <div className="absolute top-4 left-4 z-20 w-80">
              <div className="bg-gray-900/95 rounded-lg p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-halloween-orange">Accessories</h3>
                  <button
                    onClick={() => setShowAccessoryPanel(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>
                <AccessorySelector
                  accessories={availableAccessories}
                  activeAccessories={customization.accessories}
                  availableLayers={getAvailableLayers()}
                  onAddAccessory={handleAddAccessory}
                  onRemoveAccessory={handleRemoveAccessory}
                  isLoading={isLoadingProduct}
                  maxLayers={3}
                />
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoadingProduct && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-halloween-orange mx-auto mb-4"></div>
                <p className="text-white font-semibold">Loading Wig Model...</p>
                {loadingProgress > 0 && (
                  <p className="text-gray-400 text-sm mt-2">{Math.round(loadingProgress)}%</p>
                )}
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black bg-opacity-70 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="text-gray-300 text-sm">
                  {engine ? (
                    <span className="text-green-500">✓ AR Engine Active</span>
                  ) : (
                    <span className="text-yellow-500">⟳ Initializing...</span>
                  )}
                  {isCameraStarted && (
                    <span className="ml-3">
                      {isTracking ? (
                        <span className="text-green-500">✓ Face Tracking</span>
                      ) : (
                        <span className="text-yellow-500">⟳ Starting Tracking...</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!isCameraStarted ? (
                    <button
                      onClick={handleStartTryOn}
                      disabled={!!webGLError}
                      className="px-4 py-2 bg-halloween-orange hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                    >
                      📷 Start Try-On
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleStopTryOn}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
                      >
                        Stop Camera
                      </button>
                      {currentProduct && (
                        <>
                          <button
                            onClick={handleCaptureScreenshot}
                            disabled={isCapturingScreenshot || !isTracking}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                          >
                            {isCapturingScreenshot ? '📸 Capturing...' : '📸 Screenshot'}
                          </button>
                          <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || !isTracking}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                          >
                            {isAddingToCart ? '🛒 Adding...' : '🛒 Add to Cart'}
                          </button>
                        </>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => setShowFPS(!showFPS)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    {showFPS ? 'Hide' : 'Show'} FPS
                  </button>
                  {isCameraStarted && (
                    <button
                      onClick={() => setShowTrackingDetails(!showTrackingDetails)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      {showTrackingDetails ? 'Hide' : 'Show'} Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        {currentProduct && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-halloween-orange mb-4">
              Current Product
            </h2>
            <div className="flex items-start gap-4">
              <img
                src={currentProduct.thumbnail_url}
                alt={currentProduct.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{currentProduct.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{currentProduct.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-halloween-orange font-bold text-lg">
                    ${currentProduct.promotional_price || currentProduct.price}
                  </span>
                  {customization.selectedColorName && (
                    <span className="text-gray-400 text-sm">
                      Color: <span className="text-white">{customization.selectedColorName}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-halloween-orange mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 mb-1">AR Engine</p>
              <p className="text-white font-semibold">
                {engine ? 'Ready' : 'Loading...'}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 mb-1">Face Tracking</p>
              <p className="text-white font-semibold">
                {isFaceTrackingInitialized ? 'Ready' : 'Not Started'}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 mb-1">Current FPS</p>
              <p className={`font-semibold ${fps >= 24 ? 'text-green-500' : 'text-yellow-500'}`}>
                {fps} fps
              </p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 mb-1">Lighting</p>
              <p className={`font-semibold ${lighting?.isAdequate ? 'text-green-500' : 'text-yellow-500'}`}>
                {lighting ? `${Math.round(lighting.brightness * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Face Tracking Details */}
          {isCameraStarted && headPose && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-halloween-orange mb-3">
                Head Pose
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-400 mb-1">Pitch (Up/Down)</p>
                  <p className="text-white font-mono">{headPose.rotation.x.toFixed(1)}°</p>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-400 mb-1">Yaw (Left/Right)</p>
                  <p className="text-white font-mono">{headPose.rotation.y.toFixed(1)}°</p>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-400 mb-1">Roll (Tilt)</p>
                  <p className="text-white font-mono">{headPose.rotation.z.toFixed(1)}°</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARTryOn;
