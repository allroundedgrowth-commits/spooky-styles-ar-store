import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductList from '../components/Admin/ProductList';
import ProductForm, { ProductFormData } from '../components/Admin/ProductForm';
import DeleteConfirmDialog from '../components/Admin/DeleteConfirmDialog';
import LowStockAlerts from '../components/Admin/LowStockAlerts';
import PumpkinSpinner from '../components/Halloween/PumpkinSpinner';
import { Product } from '../types/product';
import { productService } from '../services/product.service';
import adminService from '../services/admin.service';

type TabType = 'products' | 'alerts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, data);
        setSuccessMessage('Product updated successfully!');
      } else {
        await adminService.createProduct(data);
        setSuccessMessage('Product created successfully!');
      }
      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      await adminService.deleteProduct(deletingProduct.id);
      setSuccessMessage('Product deleted successfully!');
      setShowDeleteDialog(false);
      setDeletingProduct(null);
      await loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete product');
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-halloween-black py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-halloween-orange mb-2">Admin Dashboard</h1>
          <p className="text-halloween-gray">Manage your spooky product catalog</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-halloween-green/20 border border-halloween-green rounded-lg text-halloween-green">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b border-halloween-orange/30">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'text-halloween-orange border-b-2 border-halloween-orange'
                : 'text-halloween-gray hover:text-white'
            }`}
          >
            <Package size={20} />
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'text-halloween-orange border-b-2 border-halloween-orange'
                : 'text-halloween-gray hover:text-white'
            }`}
          >
            <AlertTriangle size={20} />
            Stock Alerts
          </button>
          <Link
            to="/admin/analytics"
            className="px-6 py-3 font-semibold transition-colors flex items-center gap-2 text-halloween-gray hover:text-white"
          >
            <BarChart3 size={20} />
            Analytics
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <PumpkinSpinner size="large" />
              <p className="text-halloween-gray mt-4">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-halloween-orange">Product Catalog</h2>
                  <button
                    onClick={handleCreateProduct}
                    className="px-6 py-3 bg-halloween-orange hover:bg-halloween-orange/80 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add New Product
                  </button>
                </div>

                <div className="bg-halloween-dark border border-halloween-orange/30 rounded-lg p-6">
                  <ProductList
                    products={products}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-halloween-dark border border-halloween-orange/30 rounded-lg p-6">
                <LowStockAlerts onEditProduct={handleEditProduct} />
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showDeleteDialog && deletingProduct && (
        <DeleteConfirmDialog
          product={deletingProduct}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDeletingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
