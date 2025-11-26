/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.observeWebVitals();
    }
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    // Observe Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          if (this.metrics.lcp) {
            this.logMetric('LCP', this.metrics.lcp);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // Observe First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            if (this.metrics.fid) {
              this.logMetric('FID', this.metrics.fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Observe Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }

    // Get First Contentful Paint (FCP)
    window.addEventListener('load', () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        if (this.metrics.fcp) {
          this.logMetric('FCP', this.metrics.fcp);
        }
      }

      // Get Time to First Byte (TTFB)
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        this.metrics.ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        if (this.metrics.ttfb) {
          this.logMetric('TTFB', this.metrics.ttfb);
        }
      }
    });
  }

  /**
   * Log performance metric
   */
  private logMetric(name: string, value: number): void {
    console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Measure custom timing
   */
  measureTiming(name: string, startMark: string, endMark: string): number | null {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
      return null;
    }
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    try {
      performance.mark(name);
    } catch (e) {
      console.warn(`Failed to mark ${name}:`, e);
    }
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    try {
      performance.clearMarks();
      performance.clearMeasures();
    } catch (e) {
      console.warn('Failed to clear performance data:', e);
    }
  }

  /**
   * Get resource timing information
   */
  getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  /**
   * Analyze slow resources
   */
  getSlowResources(threshold: number = 1000): PerformanceResourceTiming[] {
    const resources = this.getResourceTimings();
    return resources.filter((resource) => resource.duration > threshold);
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Report all metrics
   */
  report(): void {
    console.group('📊 Performance Report');
    console.log('Core Web Vitals:', this.metrics);
    
    const slowResources = this.getSlowResources();
    if (slowResources.length > 0) {
      console.warn(`⚠️ ${slowResources.length} slow resources detected (>1s):`);
      slowResources.forEach((resource) => {
        console.log(`  - ${resource.name}: ${resource.duration.toFixed(2)}ms`);
      });
    }

    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      });
    }

    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
