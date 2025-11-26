import React, { useState } from 'react';
import { Product } from '../../types/product';
import { Trash2, Edit, AlertTriangle } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-halloween-dark border border-halloween-orange/30 rounded-lg text-white placeholder-halloween-gray focus:outline-none focus:border-halloween-orange"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-halloween-dark border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-halloween-orange/30">
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Image</th>
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Name</th>
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Category</th>
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Price</th>
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Stock</th>
              <th className="text-left py-3 px-4 text-halloween-orange font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-halloween-orange/10 hover:bg-halloween-dark/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="text-white font-medium">{product.name}</div>
                  {product.is_accessory && (
                    <span className="text-xs text-halloween-purple">Accessory</span>
                  )}
                </td>
                <td className="py-3 px-4 text-halloween-gray">{product.category}</td>
                <td className="py-3 px-4">
                  <div className="text-white">
                    ${product.promotional_price || product.price}
                  </div>
                  {product.promotional_price && (
                    <div className="text-sm text-halloween-gray line-through">
                      ${product.price}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {product.stock_quantity === 0 ? (
                      <span className="text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle size={16} />
                        Out of Stock
                      </span>
                    ) : product.stock_quantity <= 10 ? (
                      <span className="text-halloween-orange font-semibold flex items-center gap-1">
                        <AlertTriangle size={16} />
                        {product.stock_quantity}
                      </span>
                    ) : (
                      <span className="text-halloween-green">{product.stock_quantity}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-halloween-gray">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
