/**
 * Utility functions for lazy loading and code splitting
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

/**
 * Create a lazy-loaded component with custom loading state
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: () => ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading,
    ssr: options?.ssr ?? false,
  });
}

/**
 * Preload a component for better UX
 * Call this on hover or when you know the component will be needed soon
 */
export function preloadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  return importFunc();
}

/**
 * Lazy load with retry logic for failed chunks
 */
export function lazyLoadWithRetry<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  retries = 3,
  interval = 1000
) {
  return dynamic(
    () =>
      new Promise<{ default: ComponentType<P> }>((resolve, reject) => {
        const attemptLoad = (retriesLeft: number) => {
          importFunc()
            .then(resolve)
            .catch((error) => {
              if (retriesLeft === 0) {
                reject(error);
                return;
              }
              setTimeout(() => {
                console.log(`Retrying component load... (${retriesLeft} attempts left)`);
                attemptLoad(retriesLeft - 1);
              }, interval);
            });
        };
        attemptLoad(retries);
      }),
    {
      ssr: false,
    }
  );
}
