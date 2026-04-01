/**
 * Logging System
 * Provides centralized logging with different severity levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private isDevelopment = __DEV__;

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any, data?: any) {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.ERROR, message, { ...data, error }, stack);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    stack?: string
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack,
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in dev mode
    if (this.isDevelopment) {
      const color = this.getColorForLevel(level);
      console.log(
        `${color}[${level}] ${message}`,
        data || '',
        stack || ''
      );
    }

    // Send to service for ERROR and WARN in production
    if (!this.isDevelopment && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      this.sendToService(entry);
    }
  }

  private getColorForLevel(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '🔵',
      [LogLevel.INFO]: '🟢',
      [LogLevel.WARN]: '🟡',
      [LogLevel.ERROR]: '🔴',
    };
    return colors[level];
  }

  private sendToService(entry: LogEntry) {
    // TODO: Send to error tracking service (Sentry, Crashlytics, etc.)
    // This will aggregate errors and provide insights
    console.log('Would send to logging service:', entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }
}

export const logger = new Logger();

// Export shortcuts
export const log = {
  debug: (msg: string, data?: any) => logger.debug(msg, data),
  info: (msg: string, data?: any) => logger.info(msg, data),
  warn: (msg: string, data?: any) => logger.warn(msg, data),
  error: (msg: string, error?: Error | any, data?: any) =>
    logger.error(msg, error, data),
  getLogs: (level?: LogLevel) => logger.getLogs(level),
  clearLogs: () => logger.clearLogs(),
  exportLogs: () => logger.exportLogs(),
};

export default logger;
