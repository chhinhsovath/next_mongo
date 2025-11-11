import { NextResponse } from 'next/server';
import { ERROR_CODES } from './constants';
import { logger } from './logger';
import { ZodError } from 'zod';
import { handleValidationError, handleDatabaseError, sanitizeError } from './validation/errorHandler';

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: any;
  code: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown, language: 'en' | 'km' = 'en'): NextResponse<ApiErrorResponse> {
  // Log the error
  if (error instanceof Error) {
    logger.error('API Error occurred', error, {
      name: error.name,
      message: error.message,
    });
  } else {
    logger.error('Unknown API Error occurred', undefined, { error });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorResponse = handleValidationError(error, language);
    return NextResponse.json(errorResponse, { status: 400 });
  }

  // Handle MongoDB errors
  if ((error as any).name === 'MongoError' || (error as any).name === 'MongoServerError' || (error as any).code === 11000) {
    const dbError = handleDatabaseError(error, 'unknown', 'unknown');
    return NextResponse.json(
      {
        success: false,
        message: dbError.message,
        error: dbError.message,
        code: dbError.code,
        details: dbError.details,
      },
      { status: dbError.statusCode }
    );
  }

  // Handle custom ApiError
  if (error instanceof ApiError) {
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        error: sanitized.message,
        code: error.code,
        details: sanitized.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle generic Error
  if (error instanceof Error) {
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred',
        error: sanitized.message,
        code: ERROR_CODES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      message: 'An unknown error occurred',
      error: 'Unknown error',
      code: ERROR_CODES.SERVER_ERROR,
    },
    { status: 500 }
  );
}

export function createApiError(
  message: string,
  statusCode: number,
  code: string,
  details?: any
): ApiError {
  return new ApiError(message, statusCode, code, details);
}

// Common error creators
export const apiErrors = {
  unauthorized: (message = 'Authentication required') =>
    new ApiError(message, 401, ERROR_CODES.AUTH_REQUIRED),
  
  forbidden: (message = 'Insufficient permissions') =>
    new ApiError(message, 403, ERROR_CODES.FORBIDDEN),
  
  notFound: (resource: string) =>
    new ApiError(`${resource} not found`, 404, ERROR_CODES.NOT_FOUND),
  
  validation: (message: string, details?: any) =>
    new ApiError(message, 400, ERROR_CODES.VALIDATION_ERROR, details),
  
  conflict: (message: string) =>
    new ApiError(message, 409, ERROR_CODES.CONFLICT),
  
  database: (message = 'Database operation failed') =>
    new ApiError(message, 500, ERROR_CODES.DATABASE_ERROR),
  
  server: (message = 'Internal server error') =>
    new ApiError(message, 500, ERROR_CODES.SERVER_ERROR),
};

/**
 * Create a standardized error response object
 */
export function createErrorResponse(
  message: string,
  code: string,
  error?: string,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    message,
    error: error || message,
    code,
    details,
  };
}
