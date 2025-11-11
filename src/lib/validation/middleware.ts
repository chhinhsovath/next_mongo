import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { apiErrors } from '../apiError';

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ApiError if validation fails
 */
export async function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw apiErrors.validation(
        'Validation failed',
        details
      );
    }
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @param request - NextRequest object
 * @returns Validated query parameters
 * @throws ApiError if validation fails
 */
export async function validateQuery<T>(
  schema: ZodSchema<T>,
  request: NextRequest
): Promise<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObject: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });
    
    return await schema.parseAsync(queryObject);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw apiErrors.validation(
        'Invalid query parameters',
        details
      );
    }
    throw error;
  }
}

/**
 * Parses and validates JSON request body
 * @param request - NextRequest object
 * @param schema - Zod schema to validate against
 * @returns Validated request body
 * @throws ApiError if parsing or validation fails
 */
export async function parseAndValidateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return await validateRequest(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw apiErrors.validation('Invalid JSON in request body');
    }
    throw error;
  }
}

/**
 * Validates route parameters
 * @param schema - Zod schema to validate against
 * @param params - Route parameters object
 * @returns Validated parameters
 * @throws ApiError if validation fails
 */
export async function validateParams<T>(
  schema: ZodSchema<T>,
  params: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw apiErrors.validation(
        'Invalid route parameters',
        details
      );
    }
    throw error;
  }
}
