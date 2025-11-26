import { create } from 'zustand';
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
 * AR Session Store State
 */
interface ARSessionStore {
  // State
  currentProduct: Product | null;
  customization: ARCustomization;
  isActive: boolean;
  
  // Actions
  loadProduct: (product: Product) => void;
  selectColor: (colorHex: string, colorName: string) => void;
  addAccessory: (accessory: ActiveAccessory) => void;
  removeAccessory: (accessoryId: string) => void;
  removeAccessoryByLayer: (layer: number) => void;
  getAccessoryByLayer: (layer: number) => ActiveAccessory | undefined;
  getOccupiedLayers: () => number[];
  getAvailableLayers: () => number[];
  resetCustomization: () => void;
  startSession: () => void;
  endSession: () => void;
}

/**
 * Zustand store for AR try-on session state
 * Manages active product, color customizations, and accessory layers
 */
export const useARSessionStore = create<ARSessionStore>((set, get) => ({
  // Initial state
  currentProduct: null,
  customization: {
    selectedColor: null,
    selectedColorName: null,
    accessories: [],
  },
  isActive: false,

  // Load a product and reset customizations
  loadProduct: (product) => {
    set({
      currentProduct: product,
      customization: {
        selectedColor: null,
        selectedColorName: null,
        accessories: [],
      },
      isActive: true,
    });
  },

  // Select a color for the current product
  selectColor: (colorHex, colorName) => {
    set((state) => ({
      customization: {
        ...state.customization,
        selectedColor: colorHex,
        selectedColorName: colorName,
      },
    }));
  },

  // Add an accessory to a specific layer
  addAccessory: (accessory) => {
    set((state) => ({
      customization: {
        ...state.customization,
        accessories: [...state.customization.accessories, accessory],
      },
    }));
  },

  // Remove an accessory by its ID
  removeAccessory: (accessoryId) => {
    set((state) => ({
      customization: {
        ...state.customization,
        accessories: state.customization.accessories.filter(
          (acc) => acc.id !== accessoryId
        ),
      },
    }));
  },

  // Remove an accessory by its layer number
  removeAccessoryByLayer: (layer) => {
    set((state) => ({
      customization: {
        ...state.customization,
        accessories: state.customization.accessories.filter(
          (acc) => acc.layer !== layer
        ),
      },
    }));
  },

  // Get accessory at a specific layer
  getAccessoryByLayer: (layer) => {
    const { customization } = get();
    return customization.accessories.find((acc) => acc.layer === layer);
  },

  // Get list of occupied layer numbers
  getOccupiedLayers: () => {
    const { customization } = get();
    return customization.accessories.map((acc) => acc.layer);
  },

  // Get list of available layer numbers (0-2)
  getAvailableLayers: () => {
    const occupiedLayers = get().getOccupiedLayers();
    return [0, 1, 2].filter((layer) => !occupiedLayers.includes(layer));
  },

  // Reset all customizations
  resetCustomization: () => {
    set({
      customization: {
        selectedColor: null,
        selectedColorName: null,
        accessories: [],
      },
    });
  },

  // Start AR session
  startSession: () => {
    set({ isActive: true });
  },

  // End AR session and clear state
  endSession: () => {
    set({
      currentProduct: null,
      customization: {
        selectedColor: null,
        selectedColorName: null,
        accessories: [],
      },
      isActive: false,
    });
  },
}));
