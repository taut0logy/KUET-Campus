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
const generateTokens = (userId, roles) => {
  // Access token
  const accessToken = jwt.sign(
    { userId, roles },
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
const registerEmployee = async (userData) => {
  try {
    const { email, password, name, roles = ['STUDENT'], captchaToken } = userData;
    
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roles: roles,
        status: 'ACTIVE',
        emailVerified: false,
        employeeInfo: {
          create: {
            employeeId,
            designation
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        emailVerified: true,
      }
    });

    // Generate verification token
    const { token: verificationToken, signedToken: signedVerificationToken } = generateVerificationToken(user.id);

    // Update verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user, signedVerificationToken);

    return { user };
  } catch (error) {
    console.error('Error registering employee:', error);
    throw error;
  }
};

// Register a new student
const studentRegister = async (userData) => {
  try {
    const { email, password, name, roles = ['STUDENT'], captchaToken, studentId, section, batch, departmentId } = userData;
    
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roles: roles,
        status: 'ACTIVE',
        emailVerified: false,
        studentInfo: {
          create: {
            studentId,
            section,
            batch,
            department: {
              connect: { id: departmentId }
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        emailVerified: true,
      }
    });

    // Generate verification token
    const { token: verificationToken, signedToken: signedVerificationToken } = generateVerificationToken(user.id);

    // Update verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user, signedVerificationToken);

    return { user };
  } catch (error) {
    console.error('Error registering student:', error);
    throw error;
  }
};

// Register a new faculty
const facultyRegister = async (userData) => {
  try {
    const { email, password, name, roles = ['FACULTY'], captchaToken, employeeId, status, designation, departmentId, bio } = userData;
    
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roles: roles,
        status: 'ACTIVE',
        emailVerified: false,
        facultyInfo: {
          create: {
            employeeId,
            status,
            designation,
            bio,
            department: {
              connect: { id: departmentId }
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        emailVerified: true,
      }
    });

    // Generate verification token
    const { token: verificationToken, signedToken: signedVerificationToken } = generateVerificationToken(user.id);

    // Update verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken
      }
    });

    // Send verification email
    await emailService.sendVerificationEmail(user, signedVerificationToken);

    return { user };
  } catch (error) {
    console.error('Error registering faculty:', error);
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.roles);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    return { success: true, user: updatedUser, accessToken, refreshToken };
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
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        roles: true,
        status: true,
        emailVerified: true
      }
    });

    if (!user) {
      throw new Error('No user found with this email');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Wrong password. Please try again.');
    }
    
    // Format user data for response, ensuring firstName and lastName are included
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles,
      emailVerified: user.emailVerified,
    };

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active. Please contact support.');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.roles);
    
    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

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
        roles: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens with the user's current roles
    const tokens = generateTokens(user.id, user.roles);
    
    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { token: tokens.refreshToken, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }
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
  registerEmployee,
  studentRegister,
  facultyRegister,
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