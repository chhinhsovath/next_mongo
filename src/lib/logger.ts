/**
 * Logging utility for errors and API requests
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    let log = `[${timestamp}] [${level}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      log += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // In development, log to console
    if (this.isDevelopment) {
      const formattedLog = this.formatLog(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedLog, error || '');
          break;
        case LogLevel.INFO:
          console.info(formattedLog, error || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedLog, error || '');
          break;
        case LogLevel.ERROR:
          console.error(formattedLog, error || '');
          break;
      }
    }

    // In production, you would send logs to a logging service
    // Example: Send to Sentry, LogRocket, CloudWatch, etc.
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // TODO: Implement production error logging
      // Example: Sentry.captureException(error, { extra: context });
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: Record<string, any>) {
    this.info(`API Request: ${method} ${url}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, statusCode: number, context?: Record<string, any>) {
    this.info(`API Response: ${method} ${url} - ${statusCode}`, context);
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: Error, context?: Record<string, any>) {
    this.error(`API Error: ${method} ${url}`, error, context);
  }

  /**
   * Log database operation
   */
  dbOperation(operation: string, collection: string, context?: Record<string, any>) {
    this.debug(`DB Operation: ${operation} on ${collection}`, context);
  }

  /**
   * Log database error
   */
  dbError(operation: string, collection: string, error: Error, context?: Record<string, any>) {
    this.error(`DB Error: ${operation} on ${collection}`, error, context);
  }

  /**
   * Log authentication event
   */
  authEvent(event: string, context?: Record<string, any>) {
    this.info(`Auth Event: ${event}`, context);
  }

  /**
   * Log validation error
   */
  validationError(message: string, details?: any) {
    this.warn(`Validation Error: ${message}`, { details });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logApiRequest = (method: string, url: string, context?: Record<string, any>) => {
  logger.apiRequest(method, url, context);
};

export const logApiResponse = (method: string, url: string, statusCode: number, context?: Record<string, any>) => {
  logger.apiResponse(method, url, statusCode, context);
};

export const logApiError = (method: string, url: string, error: Error, context?: Record<string, any>) => {
  logger.apiError(method, url, error, context);
};

export const logDbOperation = (operation: string, collection: string, context?: Record<string, any>) => {
  logger.dbOperation(operation, collection, context);
};

export const logDbError = (operation: string, collection: string, error: Error, context?: Record<string, any>) => {
  logger.dbError(operation, collection, error, context);
};

export const logAuthEvent = (event: string, context?: Record<string, any>) => {
  logger.authEvent(event, context);
};

export const logValidationError = (message: string, details?: any) => {
  logger.validationError(message, details);
};
