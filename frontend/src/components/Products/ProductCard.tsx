import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isOutOfStock = product.stock_quantity === 0;
  const hasPromotion = product.promotional_price && product.promotional_price < product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-halloween-darkPurple rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-halloween-purple/30 glow-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-halloween-black">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-red-500 font-bold text-xl transform -rotate-12 border-4 border-red-500 px-4 py-2">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Theme Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-halloween-purple/90 text-white text-xs px-3 py-1 rounded-full capitalize">
            {product.theme}
          </span>
        </div>

        {/* Accessory Badge */}
        {product.is_accessory && (
          <div className="absolute top-2 right-2">
            <span className="bg-halloween-green/90 text-white text-xs px-3 py-1 rounded-full">
              Accessory
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-halloween-orange transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          {hasPromotion ? (
            <>
              <span className="text-2xl font-bold text-halloween-orange">
                ${Number(product.promotional_price).toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-halloween-orange">
              ${Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isOutOfStock ? 'text-red-500' : 'text-halloween-green'}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
          </span>
          
          {/* Color Indicators */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color) => (
                <div
                  key={color.id}
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: color.color_hex }}
                  title={color.color_name}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-400 ml-1">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
