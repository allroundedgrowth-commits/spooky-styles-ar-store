import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonView } from '../ComparisonView';
import { AdjustmentMode } from '../../../engine/HairFlatteningEngine';

describe('ComparisonView', () => {
  // Helper to create test ImageData
  const createTestImageData = (width: number, height: number, fillColor: number): ImageData => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = fillColor;     // R
      data[i + 1] = fillColor; // G
      data[i + 2] = fillColor; // B
      data[i + 3] = 255;       // A
    }
    return new ImageData(data, width, height);
  };

  const mockOriginalImage = createTestImageData(640, 480, 100);
  const mockAdjustedImage = createTestImageData(640, 480, 150);
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isActive is false', () => {
      const { container } = render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isActive is true', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Comparison View')).toBeInTheDocument();
    });

    it('should display "Original" label', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    it('should display current mode label', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Flattened')).toBeInTheDocument();
    });

    it('should update mode label when mode changes', () => {
      const { rerender } = render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Flattened')).toBeInTheDocument();

      rerender(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.BALD}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Bald')).toBeInTheDocument();
      expect(screen.queryByText('Flattened')).not.toBeInTheDocument();
    });
  });

  describe('Capture Functionality', () => {
    it('should render capture button', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByRole('button', { name: /capture/i });
      expect(captureButton).toBeInTheDocument();
    });

    it('should enable capture button when images are available', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByRole('button', { name: /capture/i });
      expect(captureButton).not.toBeDisabled();
    });

    it('should disable capture button when images are missing', () => {
      render(
        <ComparisonView
          originalImage={null}
          adjustedImage={null}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByRole('button', { name: /capture/i });
      expect(captureButton).toBeDisabled();
    });

    it('should call onCapture when capture button is clicked', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByRole('button', { name: /capture/i });
      fireEvent.click(captureButton);

      expect(mockOnCapture).toHaveBeenCalledTimes(1);
      expect(mockOnCapture).toHaveBeenCalledWith(expect.any(ImageData));
    });

    it('should create composite image with correct dimensions', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByRole('button', { name: /capture/i });
      fireEvent.click(captureButton);

      const capturedImage = mockOnCapture.mock.calls[0][0] as ImageData;
      expect(capturedImage.width).toBe(mockOriginalImage.width * 2);
      expect(capturedImage.height).toBe(mockOriginalImage.height);
    });
  });

  describe('Canvas Rendering', () => {
    it('should render two visible canvases', () => {
      const { container } = render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const canvases = container.querySelectorAll('canvas:not(.hidden)');
      expect(canvases.length).toBe(2);
    });

    it('should set canvas dimensions to match image dimensions', () => {
      const { container } = render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const canvases = container.querySelectorAll('canvas:not(.hidden)');
      canvases.forEach((canvas) => {
        expect((canvas as HTMLCanvasElement).width).toBe(mockOriginalImage.width);
        expect((canvas as HTMLCanvasElement).height).toBe(mockOriginalImage.height);
      });
    });
  });

  describe('Mode Display Names', () => {
    it('should display "Normal" for NORMAL mode', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.NORMAL}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('should display "Flattened" for FLATTENED mode', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Flattened')).toBeInTheDocument();
    });

    it('should display "Bald" for BALD mode', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.BALD}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText('Bald')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for capture button', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const captureButton = screen.getByLabelText('Capture comparison screenshot');
      expect(captureButton).toBeInTheDocument();
    });

    it('should hide composite canvas from screen readers', () => {
      const { container } = render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      const hiddenCanvas = container.querySelector('canvas.hidden');
      expect(hiddenCanvas).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Instructions', () => {
    it('should display comparison instructions', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText(/Compare your original hair/i)).toBeInTheDocument();
    });

    it('should include current mode in instructions', () => {
      render(
        <ComparisonView
          originalImage={mockOriginalImage}
          adjustedImage={mockAdjustedImage}
          currentMode={AdjustmentMode.FLATTENED}
          onCapture={mockOnCapture}
          isActive={true}
        />
      );

      expect(screen.getByText(/flattened adjustment/i)).toBeInTheDocument();
    });
  });
});
