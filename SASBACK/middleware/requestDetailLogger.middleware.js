const logger = require('../utils/logger');

/**
 * Middleware to log detailed HTTP requests and responses
 */
const requestDetailLogger = (req, res, next) => {
  // Generate a unique request ID
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  req.requestId = requestId;
  
  // Log request start
  logger.info(`[${requestId}] 🟢 REQUEST START: ${req.method} ${req.originalUrl || req.url}`, {
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : undefined
    },
    query: req.query,
    params: req.params,
    body: req.body
  });
  
  // Record start time
  const startTime = Date.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to log response
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Get response status
    const statusCode = res.statusCode;
    
    // Determine status emoji
    let statusEmoji = '✅';
    if (statusCode >= 400) {
      statusEmoji = statusCode >= 500 ? '❌' : '⚠️';
    }
    
    // Log response
    logger.info(`[${requestId}] ${statusEmoji} REQUEST END: ${req.method} ${req.originalUrl || req.url} - ${statusCode} (${responseTime}ms)`);
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  requestDetailLogger
};
