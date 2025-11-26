import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import adminService from '../../services/admin.service';
import { Product } from '../../types/product';

interface LowStockAlertsProps {
  onEditProduct: (product: Product) => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ onEditProduct }) => {
  const [threshold, setThreshold] = useState(10);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [lowStock, outOfStock] = await Promise.all([
        adminService.getLowStockProducts(threshold),
        adminService.getOutOfStockProducts(),
      ]);
      setLowStockProducts(lowStock.products);
      setOutOfStockProducts(outOfStock);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load stock alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [threshold]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-halloween-orange flex items-center gap-2">
          <AlertTriangle size={24} />
          Stock Alerts
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-halloween-gray">Alert Threshold:</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
              min="1"
              max="100"
              className="w-20 px-3 py-2 bg-halloween-dark border border-halloween-orange/30 rounded-lg text-white focus:outline-none focus:border-halloween-orange"
            />
          </div>
          <button
            onClick={loadAlerts}
            disabled={isLoading}
            className="p-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh alerts"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {outOfStockProducts.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4">
          <h3 className="text-red-500 font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={20} />
            Out of Stock ({outOfStockProducts.length})
          </h3>
          <div className="space-y-2">
            {outOfStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-halloween-dark rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-sm text-halloween-gray">{product.category}</div>
                  </div>
                </div>
                <button
                  onClick={() => onEditProduct(product)}
                  className="px-4 py-2 bg-halloween-orange hover:bg-halloween-orange/80 text-white rounded-lg transition-colors text-sm"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-halloween-orange/10 border-2 border-halloween-orange rounded-lg p-4">
          <h3 className="text-halloween-orange font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={20} />
            Low Stock - {threshold} or fewer items ({lowStockProducts.length})
          </h3>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-halloween-dark rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-sm text-halloween-gray">{product.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-halloween-orange font-semibold">
                    {product.stock_quantity} left
                  </span>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="px-4 py-2 bg-halloween-purple hover:bg-halloween-purple/80 text-white rounded-lg transition-colors text-sm"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading &&
        lowStockProducts.length === 0 &&
        outOfStockProducts.length === 0 && (
          <div className="text-center py-12 text-halloween-gray">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No stock alerts at this time. All products are well stocked!</p>
          </div>
        )}
    </div>
  );
};

export default LowStockAlerts;
