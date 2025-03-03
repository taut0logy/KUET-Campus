const nodemailer = require('nodemailer');
require('dotenv').config();
const { logger } = require('../utils/logger.util');
// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
async function verifyConnection() {
  try {
    await transporter.verify();
    logger.info('Email service is ready to send messages');
    return true;
  } catch (error) {
    logger.error('Email service connection error:', error);
    return false;
  }
}

// Send an email
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Send verification email
async function sendVerificationEmail(user, verificationToken) {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Platform!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also click on this link or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't sign up for our platform, please ignore this email.</p>
      </div>
    `,
  });
}

// Send password reset email
async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    text: `Please reset your password by clicking on the following link: ${resetUrl}. This link will expire in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Please click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click on this link or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    `,
  });
}

module.exports = {
  verifyConnection,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
}; 