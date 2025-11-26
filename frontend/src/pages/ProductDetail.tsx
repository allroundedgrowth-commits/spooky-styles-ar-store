import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { Product } from '../types/product';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await productService.getProductById(id);
        setProduct(fetchedProduct);
        setSelectedImage(fetchedProduct.thumbnail_url);
        
        // Set default color if available
        if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
          setSelectedColor(fetchedProduct.colors[0].id);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-halloween-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-halloween-orange mb-4"></div>
          <p className="text-halloween-purple">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-halloween-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            {error || 'Product not found'}
          </h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-halloween-orange text-white px-6 py-3 rounded-lg hover:bg-halloween-orange/80 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity === 0;
  const hasPromotion = product.promotional_price && product.promotional_price < product.price;

  return (
    <div className="min-h-screen bg-halloween-black">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/products" className="text-halloween-purple hover:text-halloween-orange transition-colors">
            Products
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-gray-400">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-halloween-darkPurple border border-halloween-purple/30">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-3xl transform -rotate-12 border-4 border-red-500 px-6 py-3">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Placeholder for future implementation */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedImage(product.thumbnail_url)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === product.thumbnail_url
                    ? 'border-halloween-orange'
                    : 'border-halloween-purple/30 hover:border-halloween-purple'
                }`}
              >
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex gap-2 mb-3">
                <span className="bg-halloween-purple text-white text-sm px-3 py-1 rounded-full capitalize">
                  {product.theme}
                </span>
                {product.is_accessory && (
                  <span className="bg-halloween-green text-white text-sm px-3 py-1 rounded-full">
                    Accessory
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-gray-400">{product.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasPromotion ? (
                <>
                  <span className="text-4xl font-bold text-halloween-orange">
                    ${Number(product.promotional_price).toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    SALE
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-halloween-orange">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Available Colors</h2>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color.id
                          ? 'border-halloween-orange bg-halloween-darkPurple'
                          : 'border-halloween-purple/30 bg-halloween-black hover:border-halloween-purple'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white/30"
                        style={{ backgroundColor: color.color_hex }}
                      />
                      <span className="text-white capitalize">{color.color_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="bg-halloween-darkPurple rounded-lg p-4 border border-halloween-purple/30">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Stock Status:</span>
                <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : 'text-halloween-green'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} Available`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* AR Try-On */}
              <Link
                to={`/ar-tryon/${product.id}`}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                📸 Virtual Try-On
              </Link>
              
              <button
                disabled={isOutOfStock}
                className={`w-full px-6 py-4 rounded-lg font-semibold transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-halloween-purple text-white hover:bg-halloween-purple/80 shadow-lg hover:shadow-xl'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-halloween-purple/30 pt-6 space-y-2 text-sm text-gray-400">
              <p>• Free shipping on orders over $50</p>
              <p>• 30-day return policy</p>
              <p>• Secure checkout with Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
