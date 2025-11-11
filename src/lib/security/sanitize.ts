/**
 * Input Sanitization Utilities
 * Sanitizes user inputs to prevent XSS and injection attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Sanitize plain text by removing HTML tags
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Sanitize phone number (remove non-numeric characters except +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    htmlFields?: string[];
    textFields?: string[];
    emailFields?: string[];
    phoneFields?: string[];
    urlFields?: string[];
  } = {}
): T {
  const {
    htmlFields = [],
    textFields = [],
    emailFields = [],
    phoneFields = [],
    urlFields = [],
  } = options;
  
  const sanitized: any = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      } else if (emailFields.includes(key)) {
        sanitized[key] = sanitizeEmail(value);
      } else if (phoneFields.includes(key)) {
        sanitized[key] = sanitizePhone(value);
      } else if (urlFields.includes(key)) {
        sanitized[key] = sanitizeUrl(value);
      } else if (textFields.includes(key) || !htmlFields.length) {
        // Default to text sanitization if no specific fields defined
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value, options);
    }
  }
  
  return sanitized;
}

/**
 * Escape special characters for SQL-like queries
 */
export function escapeSqlLike(input: string): string {
  if (!input) return '';
  return input.replace(/[%_\\]/g, '\\$&');
}

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery);
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Remove keys starting with $ (MongoDB operators) from user input
    // Allow them only in specific contexts
    if (key.startsWith('$')) {
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize file upload
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  // Remove path traversal attempts
  const name = fileName.replace(/\.\./g, '');
  
  // Remove special characters except dots, dashes, and underscores
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove special regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
}
