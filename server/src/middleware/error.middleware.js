const { sendError, getErrorStatusCode } = require('../utils/response.util');
const { logger } = require('../utils/logger.util');

/**
 * Custom error classes for different types of errors
 */
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden access') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

class DatabaseError extends Error {
  constructor(message = 'Database error occurred', details = null) {
    super(message);
    this.name = 'DatabaseError';
    this.details = details;
  }
}

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${getErrorStatusCode(err)}, Message:: ${err.message}`);
  
  // For debugging in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Handle database connection errors
  if (err.message && err.message.includes('Database connection not initialized')) {
    logger.error('Database connection error detected', err);
    return sendError(
      res,
      'Database connection error',
      503, // Service Unavailable
      { type: 'database_connection_error' }
    );
  }

  // Get appropriate status code
  const statusCode = getErrorStatusCode(err);
  
  // Prepare detailed error information
  let errorDetails = null;
  
  // Include validation errors details if available
  if (err.details || err.errors) {
    errorDetails = err.details || err.errors;
  }
  
  // For Prisma errors, provide more helpful messages
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        const fields = err.meta?.target || ['field'];
        return sendError(
          res, 
          `Duplicate entry: ${fields.join(', ')} already exists`, 
          409,
          { fields, type: 'unique_constraint' }
        );
      
      case 'P2025': // Record not found
        return sendError(res, 'Resource not found', 404, { type: 'not_found' });
      
      case 'P2003': // Foreign key constraint failed
        return sendError(
          res,
          'Operation failed due to a reference constraint',
          400,
          { type: 'foreign_key_constraint' }
        );
      
      case 'P2000': // Input value too long
        return sendError(
          res,
          'Input value is too long',
          400,
          { type: 'input_too_long' }
        );
      
      // Add more Prisma error cases as needed
    }
  }
  
  // For validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    return sendError(
      res, 
      'Validation failed', 
      400, 
      { validationErrors, type: 'validation_error' }
    );
  }

  // Send standardized error response
  return sendError(
    res,
    err.message || 'Internal server error',
    statusCode,
    errorDetails
  );
};

/**
 * 404 handler for routes that don't exist
 */
const notFoundHandler = (req, res) => {
  logger.warn(`[${req.method}] ${req.path} - Route not found`);
  return sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError
}; 