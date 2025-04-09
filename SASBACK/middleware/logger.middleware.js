const logger = require('../utils/logger');

/**
 * Middleware to log HTTP requests
 */
const requestLogger = (req, res, next) => {
  // Record start time
  const start = Date.now();
  
  // Log request details
  logger.debug(`Received ${req.method} request to ${req.originalUrl || req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : undefined
    }
  });
  
  // Override end method to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Log HTTP request with response info
    logger.httpRequest(req, res, responseTime);
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  requestLogger
};
