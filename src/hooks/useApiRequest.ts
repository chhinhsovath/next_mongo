'use client';

import { useState, useCallback } from 'react';
import { message, notification } from 'antd';
import { getErrorMessage, Language } from '@/lib/errorMessages';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: HeadersInit;
  retries?: number;
  retryDelay?: number;
  showSuccessMessage?: boolean;
  successMessage?: string;
  showErrorMessage?: boolean;
  language?: Language;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;
}

/**
 * Custom hook for making API requests with retry logic and error handling
 */
export function useApiRequest<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const request = useCallback(
    async (
      url: string,
      options: ApiRequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      const {
        method = 'GET',
        body,
        headers = {},
        retries = 2,
        retryDelay = 1000,
        showSuccessMessage = false,
        successMessage,
        showErrorMessage = true,
        language = 'en',
      } = options;

      setLoading(true);
      setError(null);

      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt <= retries) {
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          const result: ApiResponse<T> = await response.json();

          if (!response.ok) {
            // Handle API error response
            const errorMsg = result.message || result.error || 'An error occurred';
            
            if (showErrorMessage) {
              // Try to get localized error message
              const localizedMsg = result.code 
                ? getErrorMessage(result.code, language)
                : errorMsg;

              notification.error({
                message: 'Error',
                description: localizedMsg,
                duration: 5,
              });
            }

            setError(errorMsg);
            setLoading(false);
            return result;
          }

          // Success
          if (showSuccessMessage) {
            message.success(successMessage || result.message || 'Operation successful');
          }

          setData(result.data || null);
          setError(null);
          setLoading(false);
          return result;
        } catch (err) {
          lastError = err as Error;
          attempt++;

          // If we have retries left, wait and try again
          if (attempt <= retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          // All retries exhausted
          const errorMsg = lastError.message || 'Network error occurred';
          
          if (showErrorMessage) {
            notification.error({
              message: 'Network Error',
              description: language === 'km' 
                ? 'មានបញ្ហាក្នុងការភ្ជាប់បណ្តាញ។ សូមព្យាយាមម្តងទៀត។'
                : 'A network error occurred. Please try again.',
              duration: 5,
            });
          }

          setError(errorMsg);
          setLoading(false);
          
          return {
            success: false,
            error: errorMsg,
            message: errorMsg,
          };
        }
      }

      // This should never be reached, but TypeScript needs it
      return {
        success: false,
        error: 'Unknown error',
        message: 'Unknown error',
      };
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    request,
    reset,
  };
}

/**
 * Helper function for making API requests without the hook
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    retries = 2,
    retryDelay = 1000,
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok) {
        return result;
      }

      return result;
    } catch (err) {
      lastError = err as Error;
      attempt++;

      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      return {
        success: false,
        error: lastError.message || 'Network error occurred',
        message: lastError.message || 'Network error occurred',
      };
    }
  }

  return {
    success: false,
    error: 'Unknown error',
    message: 'Unknown error',
  };
}
