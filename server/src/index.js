require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { createServer } = require('http');
const routes = require('./routes');
const busRoutes = require('./routes/bus.routes');
const { connect } = require('./services/database.service');
const { verifyConnection: verifyEmailConnection } = require('./services/email.service');
const notificationService = require('./services/notification.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { logger, stream } = require('./utils/logger.util');

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8000;

// Initialize Socket.io with notification service
notificationService.initialize(httpServer);

// Connect to database service
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
  origin: ['http://localhost:3000'], // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// API routes
app.use('/api/v1', routes);
app.use('/api/bus', busRoutes);

// 404 handler for routes that don't exist
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Start server with Socket.io
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info('Socket.io server initialized');
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
