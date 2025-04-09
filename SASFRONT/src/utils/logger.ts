/**
 * Log levels:
 * 1 - ERROR: Error events that might still allow the application to continue running
 * 2 - WARN: Warning events that might lead to an error
 * 3 - INFO: Informational messages that highlight the progress of the application
 * 4 - DEBUG: Detailed information, typically useful only when diagnosing problems
 */
export enum LogLevel {
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

// Current log level (can be changed at runtime)
let currentLogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Format log message
 * @param level - Log level
 * @param message - Log message
 * @param data - Additional data to log
 * @returns - Formatted log message
 */
const formatLogMessage = (level: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    try {
      if (typeof data === 'object') {
        logMessage += ` ${JSON.stringify(data)}`;
      } else {
        logMessage += ` ${data}`;
      }
    } catch (error) {
      logMessage += ` [Error serializing data]`;
    }
  }
  
  return logMessage;
};

/**
 * Logger object with methods for different log levels
 */
const logger = {
  /**
   * Set current log level
   * @param level - Log level
   */
  setLogLevel: (level: LogLevel): void => {
    currentLogLevel = level;
    logger.info(`Log level set to ${LogLevel[level]}`);
  },
  
  /**
   * Log error message
   * @param message - Error message
   * @param data - Additional data or error object
   */
  error: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.ERROR) {
      // If data is an Error object, extract useful information
      if (data instanceof Error) {
        const errorData = {
          message: data.message,
          stack: data.stack,
          ...(data.response ? { response: data.response.data } : {})
        };
        console.error(formatLogMessage('ERROR', message, errorData));
      } else {
        console.error(formatLogMessage('ERROR', message, data));
      }
    }
  },
  
  /**
   * Log warning message
   * @param message - Warning message
   * @param data - Additional data
   */
  warn: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(formatLogMessage('WARN', message, data));
    }
  },
  
  /**
   * Log info message
   * @param message - Info message
   * @param data - Additional data
   */
  info: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(formatLogMessage('INFO', message, data));
    }
  },
  
  /**
   * Log debug message
   * @param message - Debug message
   * @param data - Additional data
   */
  debug: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(formatLogMessage('DEBUG', message, data));
    }
  }
};

export default logger;
