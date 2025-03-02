const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('./database.service');
const { supabaseAdmin } = require('../config/supabase');
const emailService = require('./email.service');
require('dotenv').config();

// Generate a random token
const generateVerificationToken = (id) => {
  const token = crypto.randomBytes(32).toString('hex');
  const signedToken = jwt.sign(
    { id },
    process.env.JWT_VERIFICATION_SECRET,
    { expiresIn: process.env.JWT_VERIFICATION_EXPIRES_IN }
  )
  return { token, signedToken };
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT tokens
const generateTokens = (userId, role) => {
  // Access token
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  // Refresh token
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

// Verify hCaptcha token
const verifyCaptcha = async (token) => {
  try {
    const secret = process.env.HCAPTCHA_SECRET_KEY;
    
    if (!secret) {
      throw new Error('HCAPTCHA_SECRET_KEY is not set in environment variables');
    }
    
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${token}&secret=${secret}`,
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('CAPTCHA verification failed');
    }
    
    return true;
  } catch (error) {
    throw new Error(`CAPTCHA verification failed: ${error.message}`);
  }
};

// Register a new user
const register = async (userData) => {
  try {
    const { email, password, firstName, lastName, role = 'STUDENT', captchaToken } = userData;
    
    // Verify captcha
    //await verifyCaptcha(captchaToken);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Generate verification token
    const { token: verificationToken, signedToken: signedVerificationToken } = generateVerificationToken(user.id);
    
    // const { data: supabaseUser, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
    //   email,
    //   password,
    //   email_confirm: true,
    //   user_metadata: {
    //     firstName,
    //     lastName,
    //     role
    //   },
    //   email_confirm_send: false
    // });
    
    // if (supabaseError) {
    //   throw new Error(`Supabase auth error: ${supabaseError.message}`);
    // }
    
    // Send verification email
    await emailService.sendVerificationEmail(user, signedVerificationToken);

    // Update verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken
      }
    });
    
    return { 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        role: user.role,
        profile: user.profile
      }
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Verify email with token
const verifyEmail = async (token) => {
  try {

    const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_SECRET); 

    // Find user with this verification token in our database
    const user = await prisma.user.findFirst({
      where: { id: decoded.id }
    });
    
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    
    
    // Update user status in our database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    });
  
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error during email verification:', error);
    throw error;
  }
};

// Login user
const login = async (email, password, captchaToken) => {
  try {
    // Verify captcha
    //await verifyCaptcha(captchaToken);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Format user data for response, ensuring firstName and lastName are included
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    // // Try to login with Supabase as well to keep sessions in sync
    // try {
    //   await supabaseAdmin.auth.signInWithPassword({
    //     email,
    //     password
    //   });
    // } catch (supabaseError) {
    //   // Just log the error but continue - we'll use our own auth system
    //   console.error('Error logging in with Supabase (ignoring):', supabaseError);
    // }
    
    return { 
      user: userData,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
const logout = async (userId, refreshToken) => {
  try {
    // Remove session
    await prisma.session.deleteMany({
      where: {
        userId,
        token: refreshToken
      }
    });

    // Logout from Supabase
    // const { error: supabaseError } = await supabaseAdmin.auth.signOut();
    // if (supabaseError) {
    //   console.error('Error logging out from Supabase:', supabaseError);
    // }
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Refresh access token
const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if token exists in database
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
      throw new Error('Invalid or expired refresh token');
    }
    
    // Find the user to get their current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens with the user's current role
    const tokens = generateTokens(user.id, user.role);
    
    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Request password reset
const requestPasswordReset = async (email, captchaToken) => {
  try {
    // Verify captcha
    //await verifyCaptcha(captchaToken);
    
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    
    // If the user doesn't exist, we still return success (for security)
    if (!user) {
      return { success: true };
    }
    
    // Generate reset token and expiry
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 10);
    
    // Update user with reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(user, resetToken);
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Reset password
const resetPassword = async (token, newPassword) => {
  try {
    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password in our database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    // Update Supabase auth password
    const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (supabaseError) {
      console.error('Error updating Supabase password:', supabaseError);
      // Continue as we already updated our database
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Resend verification email
const resendVerificationEmail = async (email) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // For security, don't reveal that the user doesn't exist
      return { success: true };
    }
    
    // Check if user is already verified
    if (user.emailVerified) {
      return { success: true };
    }
    
      const { token: verificationToken, signedToken: signedVerificationToken } = generateVerificationToken(user.id);
      
      // Update user with new verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken
        }
      });
      
      // Send verification email
      await emailService.sendVerificationEmail(user, signedVerificationToken);
    
    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  generateTokens,
  comparePassword,
  resendVerificationEmail
}; 