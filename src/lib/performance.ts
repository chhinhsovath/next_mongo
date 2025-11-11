/**
 * Performance monitoring utilities
 */

/**
 * Measure and log component render time
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  if (typeof window === 'undefined') return callback();

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  }

  // Report to analytics in production
  if (process.env.NODE_ENV === 'production' && renderTime > 1000) {
    console.warn(`[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
  }
}

/**
 * Debounce function for search inputs and filters
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure API call performance
 */
export async function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Performance] ${apiName} completed in ${duration.toFixed(2)}ms`);
    }

    // Log slow API calls
    if (duration > 3000) {
      console.warn(`[API Warning] ${apiName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`[API Error] ${apiName} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Check if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
}

/**
 * Get memory usage (Chrome only)
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined') return null;

  const performance = (window as any).performance;
  if (!performance || !performance.memory) return null;

  return {
    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
  };
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics() {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (navigation) {
    const metrics = {
      'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'TCP Connection': navigation.connectEnd - navigation.connectStart,
      'Request Time': navigation.responseStart - navigation.requestStart,
      'Response Time': navigation.responseEnd - navigation.responseStart,
      'DOM Processing': navigation.domComplete - navigation.domInteractive,
      'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
      'Total Load Time': navigation.loadEventEnd - navigation.fetchStart,
    };

    console.table(metrics);
  }
}
