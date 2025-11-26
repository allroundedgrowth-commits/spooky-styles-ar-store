import { useState, useCallback } from 'react';
import { Product } from '../types/product';

/**
 * Active accessory information
 */
export interface ActiveAccessory {
  id: string; // Unique instance ID
  productId: string; // Product ID
  layer: number; // Layer number (0-2)
  product: Product; // Full product info
}

/**
 * AR Session customization state
 */
export interface ARCustomization {
  selectedColor: string | null;
  selectedColorName: string | null;
  accessories: ActiveAccessory[];
}

/**
 * Hook to manage AR try-on session state
 */
export const useARSession = () => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [customization, setCustomization] = useState<ARCustomization>({
    selectedColor: null,
    selectedColorName: null,
    accessories: [],
  });

  const selectColor = useCallback((colorHex: string, colorName: string) => {
    setCustomization((prev) => ({
      ...prev,
      selectedColor: colorHex,
      selectedColorName: colorName,
    }));
  }, []);

  const addAccessory = useCallback((accessory: ActiveAccessory) => {
    setCustomization((prev) => ({
      ...prev,
      accessories: [...prev.accessories, accessory],
    }));
  }, []);

  const removeAccessory = useCallback((accessoryId: string) => {
    setCustomization((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((acc) => acc.id !== accessoryId),
    }));
  }, []);

  const removeAccessoryByLayer = useCallback((layer: number) => {
    setCustomization((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((acc) => acc.layer !== layer),
    }));
  }, []);

  const getAccessoryByLayer = useCallback(
    (layer: number): ActiveAccessory | undefined => {
      return customization.accessories.find((acc) => acc.layer === layer);
    },
    [customization.accessories]
  );

  const getOccupiedLayers = useCallback((): number[] => {
    return customization.accessories.map((acc) => acc.layer);
  }, [customization.accessories]);

  const getAvailableLayers = useCallback((): number[] => {
    const occupied = getOccupiedLayers();
    return [0, 1, 2].filter((layer) => !occupied.includes(layer));
  }, [getOccupiedLayers]);

  const resetCustomization = useCallback(() => {
    setCustomization({
      selectedColor: null,
      selectedColorName: null,
      accessories: [],
    });
  }, []);

  const loadProduct = useCallback(
    (product: Product) => {
      setCurrentProduct(product);
      resetCustomization();
    },
    [resetCustomization]
  );

  return {
    currentProduct,
    customization,
    loadProduct,
    selectColor,
    addAccessory,
    removeAccessory,
    removeAccessoryByLayer,
    getAccessoryByLayer,
    getOccupiedLayers,
    getAvailableLayers,
    resetCustomization,
  };
};
