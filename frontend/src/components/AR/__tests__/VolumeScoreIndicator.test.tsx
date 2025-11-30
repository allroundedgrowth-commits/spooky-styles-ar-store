import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VolumeScoreIndicator } from '../VolumeScoreIndicator';
import { VolumeCategory } from '../../../engine/HairVolumeDetector';

describe('VolumeScoreIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isVisible is true', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('Hair Volume')).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should display the score value', () => {
      render(
        <VolumeScoreIndicator
          score={75}
          category="high"
          isVisible={true}
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should display the maximum score indicator', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('/100')).toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    it('should display "Minimal" for minimal category', () => {
      render(
        <VolumeScoreIndicator
          score={10}
          category="minimal"
          isVisible={true}
        />
      );

      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('should display "Moderate" for moderate category', () => {
      render(
        <VolumeScoreIndicator
          score={35}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('should display "High" for high category', () => {
      render(
        <VolumeScoreIndicator
          score={60}
          category="high"
          isVisible={true}
        />
      );

      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should display "Very High" for very-high category', () => {
      render(
        <VolumeScoreIndicator
          score={85}
          category="very-high"
          isVisible={true}
        />
      );

      expect(screen.getByText('Very High')).toBeInTheDocument();
    });

    it('should display category icon for minimal', () => {
      render(
        <VolumeScoreIndicator
          score={10}
          category="minimal"
          isVisible={true}
        />
      );

      expect(screen.getByText(/▁/)).toBeInTheDocument();
    });

    it('should display category icon for moderate', () => {
      render(
        <VolumeScoreIndicator
          score={35}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText(/▃/)).toBeInTheDocument();
    });

    it('should display category icon for high', () => {
      render(
        <VolumeScoreIndicator
          score={60}
          category="high"
          isVisible={true}
        />
      );

      expect(screen.getByText(/▅/)).toBeInTheDocument();
    });

    it('should display category icon for very-high', () => {
      render(
        <VolumeScoreIndicator
          score={85}
          category="very-high"
          isVisible={true}
        />
      );

      expect(screen.getByText(/▇/)).toBeInTheDocument();
    });
  });

  describe('Score Animation', () => {
    it('should animate score changes within 200ms', async () => {
      const { rerender } = render(
        <VolumeScoreIndicator
          score={0}
          category="minimal"
          isVisible={true}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();

      const startTime = performance.now();
      
      rerender(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByText('50')).toBeInTheDocument();
        },
        { timeout: 250 } // Allow 250ms to account for animation + test overhead
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Animation should complete within 200ms + some overhead
      expect(duration).toBeLessThan(300);
    });

    it('should update displayed score when score prop changes', async () => {
      const { rerender } = render(
        <VolumeScoreIndicator
          score={25}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('25')).toBeInTheDocument();

      rerender(
        <VolumeScoreIndicator
          score={75}
          category="high"
          isVisible={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-flatten Threshold', () => {
    it('should show flattening recommended message when score > 40', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText(/Hair flattening recommended/i)).toBeInTheDocument();
    });

    it('should show flattening not needed message when score <= 40', () => {
      render(
        <VolumeScoreIndicator
          score={30}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText(/flattening not needed/i)).toBeInTheDocument();
    });

    it('should show threshold marker label', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText(/Auto-flatten at 40\+/i)).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      // Check for progress bar container
      const progressBar = container.querySelector('.h-3.bg-black\\/50');
      expect(progressBar).toBeInTheDocument();
    });

    it('should set progress bar width based on score', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={75}
          category="high"
          isVisible={true}
        />
      );

      const progressFill = container.querySelector('[style*="width: 75%"]');
      expect(progressFill).toBeInTheDocument();
    });

    it('should handle score of 0', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={0}
          category="minimal"
          isVisible={true}
        />
      );

      const progressFill = container.querySelector('[style*="width: 0%"]');
      expect(progressFill).toBeInTheDocument();
    });

    it('should handle score of 100', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={100}
          category="very-high"
          isVisible={true}
        />
      );

      const progressFill = container.querySelector('[style*="width: 100%"]');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
          className="custom-class"
        />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveClass('custom-class');
    });

    it('should have Halloween theme styling', () => {
      const { container } = render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator).toHaveClass('bg-halloween-darkPurple/90');
      expect(indicator).toHaveClass('border-halloween-purple/50');
    });
  });

  describe('Score Range Validation', () => {
    it('should handle minimum score (0)', () => {
      render(
        <VolumeScoreIndicator
          score={0}
          category="minimal"
          isVisible={true}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle maximum score (100)', () => {
      render(
        <VolumeScoreIndicator
          score={100}
          category="very-high"
          isVisible={true}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle mid-range scores', () => {
      render(
        <VolumeScoreIndicator
          score={42}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should display hair volume icon', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      expect(screen.getByText('💇')).toBeInTheDocument();
    });

    it('should display scale labels (0 and 100)', () => {
      render(
        <VolumeScoreIndicator
          score={50}
          category="moderate"
          isVisible={true}
        />
      );

      const labels = screen.getAllByText(/^(0|100)$/);
      expect(labels).toHaveLength(2);
    });
  });

  describe('Category Color Coding', () => {
    const categories: Array<{ score: number; category: VolumeCategory }> = [
      { score: 10, category: 'minimal' },
      { score: 35, category: 'moderate' },
      { score: 60, category: 'high' },
      { score: 85, category: 'very-high' },
    ];

    categories.forEach(({ score, category }) => {
      it(`should apply appropriate color for ${category} category`, () => {
        const { container } = render(
          <VolumeScoreIndicator
            score={score}
            category={category}
            isVisible={true}
          />
        );

        // Check that the category badge has inline styles (color coding)
        const categoryBadge = container.querySelector('[style*="color"]');
        expect(categoryBadge).toBeInTheDocument();
      });
    });
  });
});
