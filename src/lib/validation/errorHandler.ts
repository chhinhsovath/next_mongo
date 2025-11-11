import { ZodError } from 'zod';
import { ApiError, apiErrors, createErrorResponse } from '../apiError';
import { ERROR_CODES } from '../constants';
import { logger } from '../logger';
import { getErrorMessage, Language } from '../errorMessages';

/**
 * Enhanced error handler with detailed error information
 */
export function handleValidationError(error: ZodError, language: Language = 'en') {
  const details = error.issues.map((err: any) => {
    const field = err.path.join('.');
    const message = err.message;
    
    // Try to get localized message based on error type
    let localizedMessage = message;
    
    switch (err.code) {
      case 'invalid_type':
        if (err.expected === 'string') {
          localizedMessage = getErrorMessage('INVALID_FIELD_VALUE', language);
        } else if (err.expected === 'number') {
          localizedMessage = getErrorMessage('INVALID_NUMBER', language);
        }
        break;
      case 'too_small':
        if (err.type === 'string') {
          localizedMessage = getErrorMessage('FIELD_TOO_SHORT', language);
        } else if (err.type === 'number') {
          localizedMessage = getErrorMessage('NUMBER_TOO_SMALL', language);
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          localizedMessage = getErrorMessage('FIELD_TOO_LONG', language);
        } else if (err.type === 'number') {
          localizedMessage = getErrorMessage('NUMBER_TOO_LARGE', language);
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          localizedMessage = getErrorMessage('INVALID_EMAIL', language);
        } else if (err.validation === 'url') {
          localizedMessage = getErrorMessage('INVALID_URL', language);
        }
        break;
      default:
        // Use the original message if no specific localization
        localizedMessage = message;
    }
    
    return {
      field,
      message: localizedMessage,
      code: err.code,
    };
  });

  logger.validationError('Request validation failed', details);

  return createErrorResponse(
    getErrorMessage('VALIDATION_ERROR', language),
    ERROR_CODES.VALIDATION_ERROR,
    'Validation failed',
    details
  );
}

/**
 * Handle database errors with appropriate error codes
 */
export function handleDatabaseError(error: any, operation: string, collection: string) {
  logger.dbError(operation, collection, error);

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    let message = 'Resource already exists';

    // Provide specific error messages for common duplicate fields
    if (field === 'email') {
      message = 'Email address already exists';
    } else if (field === 'employee_code') {
      message = 'Employee code already exists';
    } else if (field === 'username') {
      message = 'Username already exists';
    }

    return apiErrors.conflict(message);
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors || {}).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));

    return apiErrors.validation('Database validation failed', details);
  }

  // MongoDB cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return apiErrors.validation(`Invalid ${error.path}: ${error.value}`);
  }

  // Generic database error
  return apiErrors.database('Database operation failed');
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: any) {
  if (error.message?.includes('token') || error.message?.includes('session')) {
    return apiErrors.unauthorized('Session expired. Please log in again.');
  }

  if (error.message?.includes('permission') || error.message?.includes('access')) {
    return apiErrors.forbidden('You do not have permission to perform this action');
  }

  return apiErrors.unauthorized('Authentication required');
}

/**
 * Determine if an error is a known error type
 */
export function isKnownError(error: any): boolean {
  return (
    error instanceof ApiError ||
    error instanceof ZodError ||
    error.name === 'ValidationError' ||
    error.name === 'CastError' ||
    error.code === 11000
  );
}

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyErrorMessage(error: any, language: Language = 'en'): string {
  if (error instanceof ApiError) {
    return error.code ? getErrorMessage(error.code, language) : error.message;
  }

  if (error instanceof ZodError) {
    return getErrorMessage('VALIDATION_ERROR', language);
  }

  if (error.code === 11000) {
    return getErrorMessage('CONFLICT', language);
  }

  if (error.name === 'ValidationError') {
    return getErrorMessage('VALIDATION_ERROR', language);
  }

  if (error.name === 'CastError') {
    return getErrorMessage('INVALID_FIELD_VALUE', language);
  }

  return getErrorMessage('UNKNOWN_ERROR', language);
}

/**
 * Sanitize error for client response (remove sensitive information)
 */
export function sanitizeError(error: any) {
  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return {
      message: error.message || 'An error occurred',
      code: error.code || ERROR_CODES.SERVER_ERROR,
    };
  }

  // In development, include more details
  return {
    message: error.message || 'An error occurred',
    code: error.code || ERROR_CODES.SERVER_ERROR,
    stack: error.stack,
    details: error.details,
  };
}
