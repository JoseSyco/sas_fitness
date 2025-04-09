// Script to start the server with enhanced logging
console.log('Starting SAS2 Fitness Platform Backend...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Current directory:', process.cwd());

// Set up enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Import and start the server
try {
  console.log('Loading server...');
  const app = require('./server');
  console.log('Server loaded successfully!');
} catch (err) {
  console.error('Error loading server:', err);
  process.exit(1);
}
