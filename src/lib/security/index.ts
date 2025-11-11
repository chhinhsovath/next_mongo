/**
 * Security Module
 * Centralized exports for all security utilities
 */

// CSRF Protection
export {
  generateCsrfToken,
  setCsrfToken,
  getCsrfToken,
  verifyCsrfToken,
  csrfProtection,
} from './csrf';

// Rate Limiting
export {
  rateLimit,
  rateLimitConfigs,
  applyRateLimit,
} from './rateLimit';

// Input Sanitization
export {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeObject,
  escapeSqlLike,
  sanitizeMongoQuery,
  sanitizeFileName,
  sanitizeSearchQuery,
} from './sanitize';

// Password Security
export {
  PASSWORD_REQUIREMENTS,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  generateResetToken,
  verifyResetToken,
  isCommonPassword,
  generateTemporaryPassword,
} from './password';

// Session Management
export {
  SESSION_TIMEOUT_MS,
  SESSION_WARNING_MS,
  isSessionExpired,
  getValidSession,
  SessionActivityTracker,
  isSessionAboutToExpire,
} from './session';

// Audit Logging
export {
  AuditEventType,
  logAuditEvent,
  extractRequestMetadata,
  logAuthEvent,
  logDataAccess,
  logSecurityViolation,
  logUserManagement,
  logPayrollEvent,
} from './audit';

// Security Middleware
export {
  applySecurityMiddleware,
  withSecurity,
  addSecurityHeaders,
} from './middleware';

export type { AuditLogEntry } from './audit';
export type { SecurityMiddlewareOptions } from './middleware';
