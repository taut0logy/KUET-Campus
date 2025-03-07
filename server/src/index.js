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
const realtimeService = require('./services/realtime.service');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { logger, stream } = require('./utils/logger.util');
const { initializeDocumentStore } = require('./utils/document-loader.util');

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8000;

// Initialize Socket.io with notification service
realtimeService.initialize(httpServer);

// Initialize all required services before starting the server
async function initializeServices() {
  logger.info('Initializing services...');
  
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connect();
    logger.info('✅ Database service is ready');
    
    // Verify email connection
    logger.info('Verifying email service connection...');
    const emailConnected = await verifyEmailConnection();
    if (emailConnected) {
      logger.info('✅ Email service is ready');
    } else {
      logger.warn('⚠️ Email service is not ready. Emails will not be sent.');
    }
    
    // Initialize RAG system
    logger.info('Initializing RAG (Retrieval Augmented Generation) system...');
    const ragInitialized = await initializeDocumentStore();
    if (ragInitialized) {
      logger.info('✅ RAG system initialized successfully');
    } else {
      logger.warn('⚠️ RAG system initialization had issues - AI responses may have limited knowledge');
    }
    
    // Start the server after all services are initialized
    startServer();
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Function to start the HTTP server
function startServer() {
  httpServer.listen(PORT, () => {
    logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info('✅ Socket.io server initialized');
  });
}

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream })); // Logging
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL || 'http://localhost:3000'], // Your frontend URL
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

// Start the initialization process
initializeServices();

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