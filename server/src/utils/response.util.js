/**
 * Response utility for standardizing API responses across the application
 * Format is designed to be compatible with Supabase response structure
 */

/**
 * Creates a success response object
 * @param {Object} data - The data to be returned
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized success response
 */
const successResponse = (data = null, message = 'Operation successful', statusCode = 200) => {
  return {
    status: statusCode,
    success: true,
    message,
    data,
    error: null,
  };
};

/**
 * Creates an error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errorDetails - Additional error details (optional)
 * @returns {Object} Standardized error response
 */
const errorResponse = (message, statusCode = 400, errorDetails = null) => {
  // Create a standardized error object
  const error = {
    message,
    code: statusCode,
    details: errorDetails
  };

  return {
    status: statusCode,
    success: false,
    message,
    data: null,
    error
  };
};

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(successResponse(data, message, statusCode));
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errorDetails - Additional error details
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errorDetails = null) => {
  return res.status(statusCode).json(errorResponse(message, statusCode, errorDetails));
};

/**
 * Maps common error types to appropriate HTTP status codes
 * @param {Error} error - The error object
 * @returns {number} - Appropriate HTTP status code
 */
const getErrorStatusCode = (error) => {
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'UnauthorizedError') return 401;
  if (error.name === 'ForbiddenError') return 403;
  if (error.name === 'NotFoundError') return 404;
  if (error.name === 'ConflictError') return 409;
  if (error.name === 'RateLimitError') return 429;
  
  // If this is a Prisma error, handle specific cases
  if (error.code) {
    // Prisma unique constraint violation
    if (error.code === 'P2002') return 409;
    // Prisma record not found
    if (error.code === 'P2025') return 404;
  }
  
  return 500;
};

module.exports = {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
  getErrorStatusCode
}; 