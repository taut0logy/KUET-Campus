require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const routes = require('./routes');
const { connect } = require('./services/database.service');
const { verifyConnection: verifyEmailConnection } = require('./services/email.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { logger, stream } = require('./utils/logger.util');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to database
connect()
  .then(() => {
    logger.info('Database service is ready');
  })
  .catch((error) => {
    logger.error('Database service is not ready:', error);
    process.exit(1);
  });

// Verify email service connection
verifyEmailConnection()
  .then((connected) => {
    if (connected) {
      logger.info('Email service is ready');
    } else {
      logger.warn('Email service is not ready. Emails will not be sent.');
    }
  })
  .catch((error) => {
    logger.error('Email service is not ready:', error);
  });

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream })); // Logging
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// API routes
app.use('/api/v1', routes);

// 404 handler for routes that don't exist
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
}); 