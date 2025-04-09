/**
 * Development middleware that bypasses authentication
 * This should only be used in development mode
 */

const devAuthMiddleware = (req, res, next) => {
  // Assign a default user for development
  req.user = { 
    user_id: 1, 
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User'
  };
  
  console.log('DEV MODE: Authentication bypassed, using default user');
  next();
};

module.exports = {
  devAuthMiddleware
};
