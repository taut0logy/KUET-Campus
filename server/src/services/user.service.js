const { prisma } = require('./database.service');
const bcrypt = require('bcrypt');
const { logger } = require('../utils/logger.util');

class UserService {
  async updateProfile(userId, data) {
    try {
      const { name, phone, address } = data;
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          address
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          roles: true,
          status: true,
          emailVerified: true,
          profile: true
        }
      });

      logger.info(`Profile updated for user ${userId}`);
      return user;
    } catch (error) {
      logger.error('Failed to update profile:', error);
      throw error;
    }
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    try {
      // Get user with current password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      logger.info(`Password changed for user ${userId}`);
      return { message: 'Password updated successfully' };
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }
}

const userService = new UserService();
module.exports = userService; 