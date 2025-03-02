const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');

// Register a new user
const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { email, password, firstName, lastName, captchaToken } = req.body;
    
    // Verify captcha
    // if (!captchaToken) {
    //   return sendError(res, 'CAPTCHA verification failed. Please try again.', 400);
    // }
    
    // Register user
    const result = await authService.register({ 
      email, 
      password, 
      firstName, 
      lastName, 
      captchaToken 
    });
    
    return sendSuccess(
      res, 
      { user: result.user },
      'Registration successful! Please check your email to verify your account.',
      201
    );
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, 409);
    }
    
    if (error.message.includes('CAPTCHA verification failed')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

// Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      throw new ValidationError('Verification token is required');
    }
    
    const result = await authService.verifyEmail(token);
    console.log("Verification done")
    
    return sendSuccess(
      res,
      { success: result.success },
      'Email verified successfully! You can now log in.'
    );
  } catch (error) {
    logger.error('Email verification error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    await authService.resendVerificationEmail(email);
  } catch (error) {
    logger.error('Resend verification error:', error);
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { email, password, captchaToken } = req.body;
    
    // Verify captcha
    // if (!captchaToken) {
    //   return sendError(res, 'CAPTCHA verification failed. Please try again.', 400);
    // }
    
    // Login user
    const result = await authService.login(email, password, captchaToken || 'test-token');
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better cross-site functionality
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logger.info(`User ${email} logged in successfully`);
    
    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken
      },
      'Login successful'
    );
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error.message.includes('Invalid email or password')) {
      return sendError(res, error.message, 401);
    }
    
    if (error.message.includes('Account is')) {
      return sendError(res, error.message, 403);
    }
    
    if (error.message.includes('CAPTCHA verification failed')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return sendError(res, 'No refresh token provided', 400);
    }
    
    await authService.logout(req.user.id, refreshToken);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return sendError(res, 'No refresh token provided', 401);
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return sendSuccess(
      res,
      { accessToken: result.accessToken },
      'Token refreshed successfully'
    );
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    // Clear cookie on error
    res.clearCookie('refreshToken');
    
    if (error.message.includes('Invalid or expired')) {
      return sendError(res, error.message, 401);
    }
    
    next(error);
  }
};

// Request password reset
const requestPasswordReset = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }
    
    const { email, captchaToken } = req.body;
    
    // Verify captcha
    // if (!captchaToken) {
    //   return sendError(res, 'CAPTCHA verification failed. Please try again.', 400);
    // }
    
    await authService.requestPasswordReset(email, captchaToken);
    
    // Always return success for security (even if email doesn't exist)
    return sendSuccess(
      res,
      null,
      'If an account with that email exists, we have sent password reset instructions to it.'
    );
  } catch (error) {
    logger.error('Password reset request error:', error);
    
    if (error.message.includes('CAPTCHA verification failed')) {
      return sendError(res, error.message, 400);
    }
    
    // For security, don't reveal specific errors
    next(error);
  }
};

// Resend verification email
const resendVerification = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }
    
    const { email } = req.body;
    
    await authService.resendVerificationEmail(email);
    
    // Return success message
    return sendSuccess(
      res,
      null,
      'If your account requires verification, a new verification link has been sent to your email.'
    );
  } catch (error) {
    logger.error('Resend verification error:', error);
    
    // For security, don't reveal specific errors
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }
    
    const { token } = req.params;
    const { password } = req.body;
    
    await authService.resetPassword(token, password);
    
    return sendSuccess(
      res,
      null,
      'Password reset successful! You can now log in with your new password.'
    );
  } catch (error) {
    logger.error('Password reset error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

// Get current user profile
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by the authenticate middleware
    logger.info(`User ${req.user.email} retrieved profile`);
    return sendSuccess(res, { user: req.user }, 'User profile retrieved successfully');
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  getCurrentUser
}; 