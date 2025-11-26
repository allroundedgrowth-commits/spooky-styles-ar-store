import React from 'react';
import { ProductFilters as Filters } from '../../types/product';

interface ProductFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const THEMES = [
  'witch', 'zombie', 'vampire', 'skeleton', 'ghost',
  'cosplay', 'party', 'fantasy', 'retro', 'punk',
  'elegant', 'casual', 'everyday'
];
const CATEGORIES = ['Wigs', 'Accessories'];

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFilterChange }) => {
  const handleThemeChange = (theme: string) => {
    onFilterChange({
      ...filters,
      theme: filters.theme === theme ? undefined : theme,
    });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handleAccessoryToggle = () => {
    onFilterChange({
      ...filters,
      is_accessory: filters.is_accessory === undefined ? true : filters.is_accessory ? false : undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.theme || filters.category || filters.is_accessory !== undefined;

  return (
    <div className="bg-halloween-darkPurple rounded-lg p-6 shadow-lg border border-halloween-purple/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-halloween-orange">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-halloween-purple hover:text-halloween-orange transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Theme Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Wig Theme</h3>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filters.theme === theme
                  ? 'bg-halloween-orange text-white shadow-lg'
                  : 'bg-halloween-black text-gray-300 hover:bg-halloween-purple hover:text-white'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.category === category
                  ? 'bg-halloween-orange text-white shadow-lg'
                  : 'bg-halloween-black text-gray-300 hover:bg-halloween-purple hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Accessory Toggle */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Product Type</h3>
        <button
          onClick={handleAccessoryToggle}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filters.is_accessory === true
              ? 'bg-halloween-orange text-white shadow-lg'
              : filters.is_accessory === false
              ? 'bg-halloween-green text-white shadow-lg'
              : 'bg-halloween-black text-gray-300 hover:bg-halloween-purple hover:text-white'
          }`}
        >
          {filters.is_accessory === true
            ? 'Accessories Only'
            : filters.is_accessory === false
            ? 'Wigs Only'
            : 'All Items'}
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
