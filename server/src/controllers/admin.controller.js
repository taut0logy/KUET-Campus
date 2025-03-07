const adminService = require('../services/admin.service');
const { sendSuccess, sendError } = require('../utils/response.util');

// Create a new announcement
const createAnnouncement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, message } = req.body;
    
    const result = await adminService.createAnnouncement(userId, {
      title,
      message
    });
    
    sendSuccess(res, result, 'Announcement created and notifications sent successfully');
  } catch (error) {
    next(error);
  }
};

// Get all announcements
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await adminService.getAnnouncements();
    sendSuccess(res, announcements, 'Announcements retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await adminService.getAnnouncementById(id);
    sendSuccess(res, announcement, 'Announcement retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteAnnouncement(id);
    sendSuccess(res, { id }, 'Announcement deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
}; 