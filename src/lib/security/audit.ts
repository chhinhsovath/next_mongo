/**
 * Audit Logging Utilities
 * Logs sensitive operations for security and compliance
 */

import { logger } from '@/lib/logger';

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  
  // User management events
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Employee management events
  EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
  EMPLOYEE_UPDATED = 'EMPLOYEE_UPDATED',
  EMPLOYEE_DELETED = 'EMPLOYEE_DELETED',
  EMPLOYEE_TERMINATED = 'EMPLOYEE_TERMINATED',
  
  // Leave management events
  LEAVE_REQUEST_CREATED = 'LEAVE_REQUEST_CREATED',
  LEAVE_REQUEST_APPROVED = 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED = 'LEAVE_REQUEST_REJECTED',
  LEAVE_REQUEST_CANCELLED = 'LEAVE_REQUEST_CANCELLED',
  
  // Payroll events
  PAYROLL_GENERATED = 'PAYROLL_GENERATED',
  PAYROLL_APPROVED = 'PAYROLL_APPROVED',
  PAYROLL_PAID = 'PAYROLL_PAID',
  
  // Performance events
  EVALUATION_CREATED = 'EVALUATION_CREATED',
  EVALUATION_UPDATED = 'EVALUATION_UPDATED',
  EVALUATION_ACKNOWLEDGED = 'EVALUATION_ACKNOWLEDGED',
  
  // Security events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Data access events
  SENSITIVE_DATA_ACCESSED = 'SENSITIVE_DATA_ACCESSED',
  BULK_DATA_EXPORT = 'BULK_DATA_EXPORT',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  event_type: AuditEventType;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log audit event
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };
  
  // Log to application logger
  logger.info('AUDIT', auditEntry);
  
  // In production, also send to:
  // - Dedicated audit log database
  // - SIEM system
  // - Cloud logging service (CloudWatch, Stackdriver, etc.)
  
  // For now, we'll use the existing logger
  // TODO: Implement dedicated audit log storage
}

/**
 * Extract request metadata for audit logging
 */
export function extractRequestMetadata(request: Request): {
  ip_address: string;
  user_agent: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip_address = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  const user_agent = request.headers.get('user-agent') || 'unknown';
  
  return { ip_address, user_agent };
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  eventType: AuditEventType,
  request: Request,
  userId?: string,
  userEmail?: string,
  status: 'success' | 'failure' = 'success',
  details?: Record<string, any>
): void {
  const metadata = extractRequestMetadata(request);
  
  logAuditEvent({
    event_type: eventType,
    user_id: userId,
    user_email: userEmail,
    action: eventType,
    status,
    details,
    ...metadata,
  });
}

/**
 * Log data access event
 */
export function logDataAccess(
  userId: string,
  userEmail: string,
  userRole: string,
  resourceType: string,
  resourceId: string,
  action: string,
  request: Request,
  details?: Record<string, any>
): void {
  const metadata = extractRequestMetadata(request);
  
  logAuditEvent({
    event_type: AuditEventType.SENSITIVE_DATA_ACCESSED,
    user_id: userId,
    user_email: userEmail,
    user_role: userRole,
    resource_type: resourceType,
    resource_id: resourceId,
    action,
    status: 'success',
    details,
    ...metadata,
  });
}

/**
 * Log security violation
 */
export function logSecurityViolation(
  eventType: AuditEventType,
  request: Request,
  userId?: string,
  details?: Record<string, any>
): void {
  const metadata = extractRequestMetadata(request);
  
  logAuditEvent({
    event_type: eventType,
    user_id: userId,
    action: eventType,
    status: 'failure',
    details,
    ...metadata,
  });
}

/**
 * Log user management event
 */
export function logUserManagement(
  eventType: AuditEventType,
  actorId: string,
  actorEmail: string,
  targetUserId: string,
  request: Request,
  details?: Record<string, any>
): void {
  const metadata = extractRequestMetadata(request);
  
  logAuditEvent({
    event_type: eventType,
    user_id: actorId,
    user_email: actorEmail,
    resource_type: 'user',
    resource_id: targetUserId,
    action: eventType,
    status: 'success',
    details,
    ...metadata,
  });
}

/**
 * Log payroll event
 */
export function logPayrollEvent(
  eventType: AuditEventType,
  userId: string,
  userEmail: string,
  payrollId: string,
  request: Request,
  details?: Record<string, any>
): void {
  const metadata = extractRequestMetadata(request);
  
  logAuditEvent({
    event_type: eventType,
    user_id: userId,
    user_email: userEmail,
    resource_type: 'payroll',
    resource_id: payrollId,
    action: eventType,
    status: 'success',
    details,
    ...metadata,
  });
}
