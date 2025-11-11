/**
 * Security Middleware
 * Centralized security middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from './csrf';
import { applyRateLimit, rateLimitConfigs } from './rateLimit';
import { sanitizeObject } from './sanitize';
import { logSecurityViolation, AuditEventType } from './audit';

/**
 * Security middleware options
 */
export interface SecurityMiddlewareOptions {
  csrf?: boolean;
  rateLimit?: 'auth' | 'api' | 'read' | 'write' | false;
  sanitize?: boolean;
  sanitizeOptions?: {
    htmlFields?: string[];
    textFields?: string[];
    emailFields?: string[];
    phoneFields?: string[];
    urlFields?: string[];
  };
}

/**
 * Apply security middleware to API route
 */
export async function applySecurityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{ error: Response | null; sanitizedBody?: any }> {
  const {
    csrf = true,
    rateLimit = 'api',
    sanitize = true,
    sanitizeOptions = {},
  } = options;
  
  // Apply CSRF protection
  if (csrf) {
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      logSecurityViolation(AuditEventType.CSRF_VIOLATION, request);
      return { error: csrfError };
    }
  }
  
  // Apply rate limiting
  if (rateLimit) {
    const rateLimitError = await applyRateLimit(
      request,
      rateLimitConfigs[rateLimit]
    );
    if (rateLimitError) {
      logSecurityViolation(AuditEventType.RATE_LIMIT_EXCEEDED, request);
      return { error: rateLimitError };
    }
  }
  
  // Sanitize request body
  let sanitizedBody;
  if (sanitize && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      sanitizedBody = sanitizeObject(body, sanitizeOptions);
    } catch (error) {
      // If body parsing fails, let the route handler deal with it
      sanitizedBody = undefined;
    }
  }
  
  return { error: null, sanitizedBody };
}

/**
 * Create a secured API route handler
 */
export function withSecurity(
  handler: (request: NextRequest, sanitizedBody?: any) => Promise<NextResponse>,
  options: SecurityMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { error, sanitizedBody } = await applySecurityMiddleware(request, options);
    
    if (error) {
      return error as NextResponse;
    }
    
    return handler(request, sanitizedBody);
  };
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=()'
  );
  
  return response;
}
