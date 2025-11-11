import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from './apiError';
import { logger } from './logger';

/**
 * API route handler type
 */
export type ApiRouteHandler = (
  request: NextRequest,
  context?: { params: any }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with error handling and logging
 * @param handler - The API route handler function
 * @returns Wrapped handler with error handling and logging
 */
export function withApiHandler(handler: ApiRouteHandler): ApiRouteHandler {
  return async (request: NextRequest, context?: { params: any }) => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    try {
      // Log incoming request
      logger.apiRequest(method, url, {
        params: context?.params,
      });

      // Execute the handler
      const response = await handler(request, context);

      // Log response
      const duration = Date.now() - startTime;
      logger.apiResponse(method, url, response.status, {
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      logger.apiError(method, url, error as Error, {
        duration: `${duration}ms`,
        params: context?.params,
      });

      // Handle and return error response
      return handleApiError(error);
    }
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Creates a standardized list response with pagination
 */
export function createListResponse<T>(
  items: T[],
  total: number,
  page?: number,
  limit?: number
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data: items,
      total,
      page,
      limit,
    },
    { status: 200 }
  );
}
