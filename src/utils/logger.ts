// src/utils/logger.ts
// Structured logging utility with levels and metadata

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(minLevel: LogLevel = LogLevel.INFO, enableConsole: boolean = true) {
    this.minLevel = minLevel;
    this.enableConsole = enableConsole;
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Enable or disable console output
   */
  setConsoleEnabled(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Create a log entry
   */
  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    if (this.enableConsole) {
      const prefix = context ? `[${context}]` : '';
      const levelName = LogLevel[level];
      const timestamp = new Date().toLocaleTimeString();

      const logMessage = `${timestamp} ${levelName} ${prefix} ${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, metadata || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, metadata || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, metadata || '');
          break;
        case LogLevel.ERROR:
          console.error(logMessage, metadata || '');
          break;
      }
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>, context?: string): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: string): void {
    const metadata = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

    this.log(LogLevel.ERROR, message, context, metadata);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, metadata?: Record<string, any>): void {
    this.info(`${method} ${url}`, metadata, 'API');
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, statusCode: number, duration: number): void {
    const metadata = { statusCode, duration };
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;

    if (statusCode >= 400) {
      this.warn(message, metadata, 'API');
    } else {
      this.info(message, metadata, 'API');
    }
  }

  /**
   * Log user action
   */
  userAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    const message = userId ? `User ${userId}: ${action}` : action;
    this.info(message, metadata, 'USER');
  }

  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const message = `${operation} took ${duration}ms`;
    this.info(message, metadata, 'PERFORMANCE');
  }
}

// Create default logger instance
export const logger = new Logger(
  import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  true
);

// Export log level enum for convenience

export default logger;
