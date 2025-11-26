import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import { Product, ProductFilters as Filters } from '../types/product';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilters from '../components/Products/ProductFilters';
import SearchBar from '../components/Products/SearchBar';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products based on filters and search
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedProducts: Product[];

      if (searchQuery.trim()) {
        // Use search endpoint if there's a search query
        fetchedProducts = await productService.searchProducts(searchQuery);
      } else {
        // Use filter endpoint otherwise
        fetchedProducts = await productService.getProducts(filters);
      }

      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Fetch products when filters or search changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setSearchQuery(''); // Clear search when filters change
  }, []);

  return (
    <div className="min-h-screen bg-halloween-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-halloween-orange mb-4">
            Spooky Wigs Collection
          </h1>
          <p className="text-gray-300 text-lg">
            Browse our collection of themed wigs and accessories! Filter by style and theme.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-halloween-darkPurple text-white px-4 py-3 rounded-lg border border-halloween-purple/30 hover:bg-halloween-purple transition-colors flex items-center justify-between blood-drip-button glow-hover"
          >
            <span className="font-medium">Filters</span>
            <svg
              className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Results Count */}
            {!loading && products && (
              <div className="mb-4 text-gray-400">
                {products.length} {products.length === 1 ? 'item' : 'items'} found
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
