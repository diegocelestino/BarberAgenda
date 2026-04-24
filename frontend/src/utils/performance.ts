/**
 * Performance Monitoring Utility
 * Tracks page load times, API calls, and user interactions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private enabled: boolean;

  constructor() {
    // Enable in production, or when explicitly enabled in development
    this.enabled = process.env.NODE_ENV === 'production' || 
                   process.env.REACT_APP_ENABLE_METRICS === 'true';
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`, metadata || '');
    }

    // In production, send to analytics service
    // Example: analytics.track('performance', metric);
  }

  /**
   * Measure page load time using Navigation Timing API
   */
  measurePageLoad() {
    if (!this.enabled || typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
        const tcpTime = perfData.connectEnd - perfData.connectStart;
        const requestTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        this.recordMetric('page_load_time', pageLoadTime);
        this.recordMetric('dom_ready_time', domReadyTime);
        this.recordMetric('dns_time', dnsTime);
        this.recordMetric('tcp_time', tcpTime);
        this.recordMetric('request_time', requestTime);
        this.recordMetric('render_time', renderTime);

        // First Contentful Paint (FCP)
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          this.recordMetric(entry.name.replace(/-/g, '_'), entry.startTime);
        });
      }, 0);
    });
  }

  /**
   * Measure API call duration
   */
  measureApiCall(endpoint: string, duration: number, status: number) {
    this.recordMetric('api_call', duration, {
      endpoint,
      status,
      success: status >= 200 && status < 300,
    });
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string, duration: number) {
    this.recordMetric('component_render', duration, { componentName });
  }

  /**
   * Measure route change time
   */
  measureRouteChange(from: string, to: string, duration: number) {
    this.recordMetric('route_change', duration, { from, to });
  }

  /**
   * Measure user interaction time (e.g., form submission)
   */
  measureInteraction(action: string, duration: number, metadata?: Record<string, any>) {
    this.recordMetric('user_interaction', duration, { action, ...metadata });
  }

  /**
   * Start a timer for custom measurements
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric('custom_timer', duration, { label });
    };
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.avg = (stat.avg * (stat.count - 1) + metric.value) / stat.count;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Log performance summary to console
   */
  logSummary() {
    const summary = this.getSummary();
    console.group('📊 Performance Summary');
    Object.entries(summary).forEach(([name, stats]) => {
      console.log(
        `${name}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms, count=${stats.count}`
      );
    });
    console.groupEnd();
  }

  /**
   * Report Web Vitals (Core Web Vitals)
   */
  reportWebVitals(onPerfEntry?: (metric: any) => void) {
    if (!onPerfEntry || !this.enabled) return;

    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to measure async operations
export const measureAsync = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const stopTimer = performanceMonitor.startTimer(label);
  try {
    return await fn();
  } finally {
    stopTimer();
  }
};

// Helper function to measure sync operations
export const measureSync = <T>(label: string, fn: () => T): T => {
  const stopTimer = performanceMonitor.startTimer(label);
  try {
    return fn();
  } finally {
    stopTimer();
  }
};

// React hook for measuring component lifecycle
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.measureComponentRender(componentName, duration);
  };
};
