// Performance monitoring utilities
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface CustomMetrics {
  pageLoadTime: number;
  imageLoadTime: number;
  apiResponseTime: number;
  searchResponseTime: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private customMetrics: Partial<CustomMetrics> = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.measureCoreWebVitals();
  }

  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processEntry(entry);
        }
      });

      // Observe different entry types
      try {
        this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn('Performance Observer not fully supported');
      }
    }
  }

  private processEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;
      case 'first-input':
        this.metrics.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        break;
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.metrics.cls = (this.metrics.cls || 0) + (entry as any).value;
        }
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;
      case 'navigation':
        this.metrics.ttfb = (entry as PerformanceNavigationTiming).responseStart;
        this.customMetrics.pageLoadTime = entry.duration;
        break;
    }
  }

  private measureCoreWebVitals() {
    // Measure TTFB
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.ttfb = timing.responseStart - timing.requestStart;
    }
  }

  // Custom timing measurements
  public startTiming(label: string): string {
    const id = `${label}-${Date.now()}`;
    performance.mark(`${id}-start`);
    return id;
  }

  public endTiming(id: string): number {
    const endMark = `${id}-end`;
    performance.mark(endMark);
    performance.measure(id, `${id}-start`, endMark);
    
    const measure = performance.getEntriesByName(id)[0];
    return measure.duration;
  }

  // API response time tracking
  public trackApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall().then(
      (result) => {
        const duration = performance.now() - startTime;
        this.logApiMetric(endpoint, duration, 'success');
        return result;
      },
      (error) => {
        const duration = performance.now() - startTime;
        this.logApiMetric(endpoint, duration, 'error');
        throw error;
      }
    );
  }

  private logApiMetric(endpoint: string, duration: number, status: 'success' | 'error') {
    // In production, send to analytics service
    console.log(`API Call: ${endpoint} - ${duration.toFixed(2)}ms - ${status}`);
    
    // Store for reporting
    if (!this.customMetrics.apiResponseTime) {
      this.customMetrics.apiResponseTime = duration;
    } else {
      // Running average
      this.customMetrics.apiResponseTime = (this.customMetrics.apiResponseTime + duration) / 2;
    }
  }

  // Get current metrics
  public getMetrics(): { core: Partial<PerformanceMetrics>; custom: Partial<CustomMetrics> } {
    return {
      core: { ...this.metrics },
      custom: { ...this.customMetrics }
    };
  }

  // Report metrics (to analytics service)
  public reportMetrics() {
    const allMetrics = this.getMetrics();
    
    // In production, send to your analytics service
    console.log('Performance Metrics:', allMetrics);
    
    // Example: Send to Google Analytics, DataDog, etc.
    if (window.gtag) {
      // Google Analytics 4 custom events
      window.gtag('event', 'performance_metrics', {
        lcp: allMetrics.core.lcp,
        fid: allMetrics.core.fid,
        cls: allMetrics.core.cls,
        fcp: allMetrics.core.fcp,
        ttfb: allMetrics.core.ttfb
      });
    }
  }

  // Performance budget checks
  public checkBudgets(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const { core } = this.getMetrics();

    // Core Web Vitals thresholds
    if (core.lcp && core.lcp > 2500) violations.push(`LCP too slow: ${core.lcp}ms`);
    if (core.fid && core.fid > 100) violations.push(`FID too slow: ${core.fid}ms`);
    if (core.cls && core.cls > 0.1) violations.push(`CLS too high: ${core.cls}`);
    if (core.fcp && core.fcp > 1800) violations.push(`FCP too slow: ${core.fcp}ms`);
    if (core.ttfb && core.ttfb > 600) violations.push(`TTFB too slow: ${core.ttfb}ms`);

    return {
      passed: violations.length === 0,
      violations
    };
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    trackApiCall: performanceMonitor.trackApiCall.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    reportMetrics: performanceMonitor.reportMetrics.bind(performanceMonitor),
    checkBudgets: performanceMonitor.checkBudgets.bind(performanceMonitor)
  };
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.group('Bundle Analysis');
    console.log(`Scripts loaded: ${scripts.length}`);
    console.log(`Stylesheets loaded: ${styles.length}`);
    
    // Estimate sizes (in production, use webpack-bundle-analyzer)
    scripts.forEach((script, index) => {
      console.log(`Script ${index + 1}: ${(script as HTMLScriptElement).src}`);
    });
    
    console.groupEnd();
  }
};

// Global performance utilities
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
