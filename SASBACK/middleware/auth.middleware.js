const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // For development purposes, allow requests without token
  // and assign a default user
  if (!token) {
    console.log('No token provided, using default user for development');
    req.user = { user_id: 1, email: 'demo@example.com' };
    return next();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.log('Invalid token, using default user for development');
    req.user = { user_id: 1, email: 'demo@example.com' };
    next();
  }
};

module.exports = {
  authenticateToken
};
