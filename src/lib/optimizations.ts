/**
 * Central export for all performance optimization utilities
 */

// Cache utilities
export { default as cache } from './cache';

// Lazy loading utilities
export { lazyLoad, preloadComponent, lazyLoadWithRetry } from './lazyLoad';

// Performance monitoring utilities
export {
  measureRenderTime,
  measureApiCall,
  debounce,
  throttle,
  isSlowConnection,
  getMemoryUsage,
  logPerformanceMetrics,
} from './performance';

// Query optimization utilities
export {
  buildPaginationQuery,
  buildSearchQuery,
  buildDateRangeQuery,
  selectFields,
  FIELD_SELECTIONS,
  buildAggregationPipeline,
  optimizeQuery,
} from './queryOptimizer';
