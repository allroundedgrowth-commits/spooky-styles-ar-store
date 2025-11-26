import React from 'react';
import { ProductColor } from '../../types/product';

interface ColorPickerProps {
  colors: ProductColor[];
  selectedColor: string | null;
  onColorSelect: (colorHex: string, colorName: string) => void;
  disabled?: boolean;
}

/**
 * ColorPicker Component
 * Displays predefined color options for wig customization
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  disabled = false,
}) => {
  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="bg-black bg-opacity-70 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3 text-sm">
        Customize Color
      </h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color.color_hex, color.color_name)}
            disabled={disabled}
            className={`
              relative w-12 h-12 rounded-full border-2 transition-all
              ${selectedColor === color.color_hex 
                ? 'border-halloween-orange scale-110 shadow-lg' 
                : 'border-gray-600 hover:border-gray-400 hover:scale-105'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ backgroundColor: color.color_hex }}
            title={color.color_name}
            aria-label={`Select ${color.color_name} color`}
          >
            {selectedColor === color.color_hex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-gray-400 text-xs mt-2">
          Selected: {colors.find(c => c.color_hex === selectedColor)?.color_name}
        </p>
      )}
    </div>
  );
};
