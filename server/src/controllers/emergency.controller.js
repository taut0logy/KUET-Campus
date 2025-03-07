const realtimeService = require('../services/realtime.service');

const triggerEmergencyAlert = async (req, res, next) => {
  try {
    const { message } = req.body;
    await realtimeService.broadcastToRoles(['ADMIN', 'STUDENT', 'FACULTY', 'OFFICE_MANAGER', 'CAFE_MANAGER'], {
      title: 'Emergency Alert',
      message: `Emergency alert triggered: ${message}`,
      type: 'EMERGENCY',
      metadata: { message }
    });
    res.status(200).json({ message: 'Emergency alert triggered successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerEmergencyAlert
};