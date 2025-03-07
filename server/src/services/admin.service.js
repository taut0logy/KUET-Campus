const { prisma } = require('./database.service');
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const { logger } = require('../utils/logger.util');

// Create a new announcement and notify all users
const createAnnouncement = async (adminId, announcementData) => {
  try {
    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        ...announcementData,
        createdBy: adminId
      }
    });

    // Get all users to notify
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    logger.info(`Creating notifications for ${users.length} users for announcement: ${announcement.id}`);

    // Create notifications for all users
    const notificationPromises = users.map(user => 
      notificationService.createNotification({
        userId: user.id,
        title: `New Announcement: ${announcementData.title}`,
        message: announcementData.message.substring(0, 100) + (announcementData.message.length > 100 ? '...' : ''),
        type: 'ANNOUNCEMENT',
        metadata: {
          announcementId: announcement.id
        }
      })
    );

    // Send emails to all users
    const emailPromises = users.map(user => 
      emailService.sendEmail({
        to: user.email,
        subject: `New Announcement: ${announcementData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Announcement</h2>
            <h3>${announcementData.title}</h3>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p>${announcementData.message}</p>
            </div>
            <p>You can view all announcements by logging into your account.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    );

    // Wait for all notifications and emails to be sent
    await Promise.all([
      Promise.all(notificationPromises),
      Promise.all(emailPromises)
    ]);

    return {
      announcement,
      notificationsSent: users.length,
      emailsSent: users.length
    };
  } catch (error) {
    logger.error('Failed to create announcement:', error);
    throw new Error('Failed to create announcement and send notifications');
  }
};

// Get all announcements
const getAnnouncements = async () => {
  return await prisma.announcement.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });
};

// Get announcement by ID
const getAnnouncementById = async (id) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return announcement;
};

// Delete announcement
const deleteAnnouncement = async (id) => {
  return await prisma.announcement.delete({
    where: { id }
  });
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
}; 