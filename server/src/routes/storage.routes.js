const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const storageService = require('../services/storage.service');
const { logger } = require('../utils/logger.util');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max file size
  }
});

// Upload a file
router.post('/upload', 
  authenticate, 
  upload.single('file'),
  async (req, res) => {
    try {
      const { 
        folder = '', 
        isPrivate = false, 
        category = 'default',
        shareWith = [] 
      } = req.body;

      const file = await storageService.uploadFile(req.file, {
        folder,
        isPrivate: isPrivate === 'true',
        category,
        userId: req.user.id,
        shareWithUsers: shareWith
      });

      res.status(201).json(file);
    } catch (error) {
      logger.error('File upload failed:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Share a file with users
router.post('/:fileKey/share',
  authenticate,
  async (req, res) => {
    try {
      const { fileKey } = req.params;
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'Invalid userIds provided' });
      }

      await storageService.shareFile(fileKey, userIds, req.user.id);
      res.json({ message: 'File shared successfully' });
    } catch (error) {
      logger.error('File sharing failed:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Get file URL
router.get('/:fileKey',
  authenticate,
  async (req, res) => {
    try {
      const url = storageService.getFileUrl(req.params.fileKey);
      res.json({ url });
    } catch (error) {
      logger.error('Failed to get file URL:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Download file
router.get('/:fileKey/download',
  authenticate,
  async (req, res) => {
    try {
      const data = await storageService.downloadFile(req.params.fileKey);
      res.send(data);
    } catch (error) {
      logger.error('File download failed:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete file
router.delete('/:fileKey',
  authenticate,
  async (req, res) => {
    try {
      await storageService.deleteFile(req.params.fileKey, {
        userId: req.user.id
      });
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      logger.error('File deletion failed:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// List files in a folder
router.get('/list/:folder?',
  authenticate,
  async (req, res) => {
    try {
      const files = await storageService.listFiles(req.params.folder || '');
      res.json(files);
    } catch (error) {
      logger.error('Failed to list files:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router; 