const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');
const debugLogPath = path.join(logsDir, 'debug.log');

/**
 * Log levels:
 * 1 - ERROR: Error events that might still allow the application to continue running
 * 2 - WARN: Warning events that might lead to an error
 * 3 - INFO: Informational messages that highlight the progress of the application
 * 4 - DEBUG: Detailed information, typically useful only when diagnosing problems
 */
const LOG_LEVELS = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

// Current log level (can be changed at runtime)
let currentLogLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, data = null) => {
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
      logMessage += ` [Error serializing data: ${error.message}]`;
    }
  }
  
  return logMessage;
};

/**
 * Write log to file and console
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 * @param {string} [logFilePath] - Path to log file
 */
const writeLog = (level, message, data = null, logFilePath = null) => {
  const logMessage = formatLogMessage(level, message, data);
  
  // Log to console
  switch (level) {
    case 'ERROR':
      console.error(logMessage);
      break;
    case 'WARN':
      console.warn(logMessage);
      break;
    case 'INFO':
      console.info(logMessage);
      break;
    case 'DEBUG':
      console.debug(logMessage);
      break;
    default:
      console.log(logMessage);
  }
  
  // Log to file if path provided
  if (logFilePath) {
    fs.appendFile(logFilePath, logMessage + '\n', (err) => {
      if (err) {
        console.error(`Failed to write to log file: ${err.message}`);
      }
    });
  }
};

/**
 * Logger object with methods for different log levels
 */
const logger = {
  /**
   * Set current log level
   * @param {number} level - Log level
   */
  setLogLevel: (level) => {
    if (Object.values(LOG_LEVELS).includes(level)) {
      currentLogLevel = level;
      logger.info(`Log level set to ${Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level)}`);
    } else {
      logger.warn(`Invalid log level: ${level}`);
    }
  },
  
  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object|Error} [data] - Additional data or error object
   */
  error: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      // If data is an Error object, extract useful information
      if (data instanceof Error) {
        const errorData = {
          message: data.message,
          stack: data.stack,
          ...(data.response ? { response: data.response.data } : {})
        };
        writeLog('ERROR', message, errorData, errorLogPath);
      } else {
        writeLog('ERROR', message, data, errorLogPath);
      }
    }
  },
  
  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [data] - Additional data
   */
  warn: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      writeLog('WARN', message, data, errorLogPath);
    }
  },
  
  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} [data] - Additional data
   */
  info: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      writeLog('INFO', message, data, accessLogPath);
    }
  },
  
  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} [data] - Additional data
   */
  debug: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      writeLog('DEBUG', message, data, debugLogPath);
    }
  },
  
  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  httpRequest: (req, res, responseTime) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      const logData = {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      };
      
      writeLog('INFO', 'HTTP Request', logData, accessLogPath);
    }
  }
};

module.exports = logger;
