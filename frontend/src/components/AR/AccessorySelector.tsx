import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { ActiveAccessory } from '../../hooks/useARSession';

interface AccessorySelectorProps {
  accessories: Product[]; // Available accessory products
  activeAccessories: ActiveAccessory[]; // Currently active accessories
  availableLayers: number[]; // Available layers
  onAddAccessory: (product: Product, layer: number) => void;
  onRemoveAccessory: (accessoryId: string) => void;
  isLoading?: boolean;
  maxLayers?: number;
}

/**
 * AccessorySelector Component
 * UI for selecting and managing accessory layers
 */
export const AccessorySelector: React.FC<AccessorySelectorProps> = ({
  accessories,
  activeAccessories,
  availableLayers,
  onAddAccessory,
  onRemoveAccessory,
  isLoading = false,
  maxLayers = 3,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  // Auto-select first available layer when selection changes
  useEffect(() => {
    if (availableLayers.length > 0 && selectedLayer === null) {
      setSelectedLayer(availableLayers[0]);
    }
  }, [availableLayers, selectedLayer]);

  const handleAddAccessory = () => {
    if (selectedProduct && selectedLayer !== null) {
      onAddAccessory(selectedProduct, selectedLayer);
      setSelectedProduct(null);
      setSelectedLayer(null);
    }
  };

  const getLayerLabel = (layer: number): string => {
    const labels = ['Base Layer', 'Middle Layer', 'Top Layer'];
    return labels[layer] || `Layer ${layer}`;
  };

  const isMaxReached = activeAccessories.length >= maxLayers;

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
        <span>🎭</span>
        <span>Accessory Layers</span>
        <span className="text-sm text-gray-400">
          ({activeAccessories.length}/{maxLayers})
        </span>
      </h3>

      {/* Active Accessories Display */}
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Active Layers:</h4>
        {activeAccessories.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-2">No accessories added yet</div>
        ) : (
          <div className="space-y-2">
            {[...Array(maxLayers)].map((_, layerIndex) => {
              const accessory = activeAccessories.find((acc) => acc.layer === layerIndex);
              return (
                <div
                  key={layerIndex}
                  className={`flex items-center justify-between p-2 rounded border ${
                    accessory
                      ? 'bg-purple-900/30 border-purple-500/50'
                      : 'bg-gray-800/30 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                        accessory ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {layerIndex}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{getLayerLabel(layerIndex)}</div>
                      {accessory && (
                        <div className="text-sm text-white font-medium">{accessory.product.name}</div>
                      )}
                    </div>
                  </div>
                  {accessory && (
                    <button
                      onClick={() => onRemoveAccessory(accessory.id)}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Accessory Section */}
      {!isMaxReached && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Add Accessory:</h4>

          {/* Accessory Selection */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Select Accessory:</label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = accessories.find((acc) => acc.id === e.target.value);
                setSelectedProduct(product || null);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
              disabled={isLoading || accessories.length === 0}
            >
              <option value="">Choose an accessory...</option>
              {accessories.map((accessory) => (
                <option key={accessory.id} value={accessory.id}>
                  {accessory.name} - ${Number(accessory.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Layer Selection */}
          {selectedProduct && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Select Layer:</label>
              <div className="flex gap-2">
                {availableLayers.map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setSelectedLayer(layer)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      selectedLayer === layer
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-xs">{getLayerLabel(layer)}</div>
                    <div className="text-xs opacity-75">Layer {layer}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddAccessory}
            disabled={!selectedProduct || selectedLayer === null || isLoading}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Add to Layer'}
          </button>
        </div>
      )}

      {isMaxReached && (
        <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-600/30 rounded p-2 mt-2">
          Maximum accessories reached. Remove one to add another.
        </div>
      )}

      {accessories.length === 0 && (
        <div className="text-sm text-gray-500 italic py-2">No accessories available</div>
      )}
    </div>
  );
};
