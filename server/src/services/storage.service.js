const { supabaseAdmin } = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger.util');
const { ValidationError, NotFoundError } = require('../middleware/error.middleware');
const realtimeService = require('./realtime.service');

// Connection status constants
const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  ERROR: 'error'
};

// Allowed file types and their corresponding MIME types
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
};

// Maximum file sizes in bytes
const MAX_FILE_SIZES = {
  images: 5 * 1024 * 1024, // 5MB
  documents: 10 * 1024 * 1024, // 10MB
  spreadsheets: 10 * 1024 * 1024, // 10MB
  presentations: 20 * 1024 * 1024, // 20MB
  default: 5 * 1024 * 1024 // 5MB
};

/**
 * Supabase Storage Service for managing file uploads and retrievals
 */
class StorageService {
  /**
   * Initialize the storage service with bucket configuration
   * @param {string} defaultBucket - The default storage bucket name
   */
  constructor(defaultBucket = 'app-uploads') {
    this.defaultBucket = defaultBucket;
    this.supabase = supabaseAdmin;
    this.initialized = false;
    this.connectionStatus = CONNECTION_STATUS.DISCONNECTED;
    this.bucketConfigs = {
      'app-uploads': { public: true, fileSizeLimit: MAX_FILE_SIZES.default },
      'private-uploads': { public: false, fileSizeLimit: MAX_FILE_SIZES.documents },
      'profile-pictures': { public: true, fileSizeLimit: MAX_FILE_SIZES.images }
    };

    // Log initial setup
    logger.info('Storage service created', {
      defaultBucket,
      buckets: Object.keys(this.bucketConfigs)
    });
  }

  /**
   * Get current connection status
   * @returns {string} Current connection status
   */
  getConnectionStatus() {
    return this.connectionStatus;
  }

  /**
   * Initialize storage service and ensure buckets exist
   */
  async initialize() {
    try {
      if (this.initialized) {
        logger.debug('Storage service already initialized');
        return;
      }
      
      logger.info('Initializing storage service...');
      
      // Check if the buckets exist, create them if not
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        this.connectionStatus = CONNECTION_STATUS.ERROR;
        logger.error('Failed to connect to storage service', {
          error: error.message,
          code: error.code,
          status: this.connectionStatus
        });
        throw new Error(`Failed to list buckets: ${error.message}`);
      }
      
      // Create missing buckets with their configurations
      for (const [bucketName, config] of Object.entries(this.bucketConfigs)) {
        const bucketExists = buckets.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          logger.info(`Creating storage bucket: ${bucketName}`, {
            public: config.public,
            sizeLimit: config.fileSizeLimit
          });

          const { error: createError } = await this.supabase.storage.createBucket(bucketName, {
            public: config.public,
            fileSizeLimit: config.fileSizeLimit,
          });
          
          if (createError) {
            this.connectionStatus = CONNECTION_STATUS.ERROR;
            logger.error(`Failed to create bucket ${bucketName}`, {
              error: createError.message,
              code: createError.code,
              status: this.connectionStatus
            });
            throw new Error(`Failed to create bucket ${bucketName}: ${createError.message}`);
          }
          
          logger.info(`Created storage bucket: ${bucketName}`);
        } else {
          logger.debug(`Bucket ${bucketName} already exists`);
        }
      }
      
      this.initialized = true;
      this.connectionStatus = CONNECTION_STATUS.CONNECTED;
      logger.info('Storage service initialized successfully', {
        status: this.connectionStatus,
        buckets: buckets.map(b => b.name)
      });
    } catch (error) {
      this.connectionStatus = CONNECTION_STATUS.ERROR;
      logger.error('Storage service initialization failed', {
        error: error.message,
        status: this.connectionStatus,
        initialized: this.initialized
      });
      throw error;
    }
  }

  /**
   * Validate file type and size
   * @param {Object} file - The file object
   * @param {string} category - The file category (images, documents, etc.)
   * @throws {ValidationError} If validation fails
   */
  validateFile(file, category = 'default') {
    // Check file size
    const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.default;
    if (file.size > maxSize) {
      throw new ValidationError(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type if category is specified
    if (category !== 'default' && ALLOWED_FILE_TYPES[category]) {
      if (!ALLOWED_FILE_TYPES[category].includes(file.mimetype)) {
        throw new ValidationError(`Invalid file type. Allowed types for ${category}: ${ALLOWED_FILE_TYPES[category].join(', ')}`);
      }
    }
  }

  /**
   * Upload a file to storage with progress tracking and notifications
   * @param {Object} file - The file object
   * @param {Object} options - Upload options
   * @returns {Object} - The uploaded file information
   */
  async uploadFile(file, {
    folder = '',
    bucketName = this.defaultBucket,
    category = 'default',
    userId = null,
    isPrivate = false,
    shareWithUsers = []
  } = {}) {
    try {
      await this.initialize();
      
      if (!file || !file.buffer) {
        logger.warn('Invalid file provided for upload', {
          userId,
          category,
          bucket: bucketName
        });
        throw new ValidationError('Invalid file provided');
      }

      logger.info('Starting file upload', {
        fileName: file.originalname,
        size: file.size,
        type: file.mimetype,
        bucket: bucketName,
        folder,
        userId
      });

      // Validate file
      this.validateFile(file, category);
      
      // Generate a unique file name
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Use private bucket if specified
      const actualBucket = isPrivate ? 'private-uploads' : bucketName;
      
      // Upload file to Supabase
      const { data, error } = await this.supabase.storage
        .from(actualBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }
      
      // Get file URL
      const { data: urlData } = this.supabase.storage
        .from(actualBucket)
        .getPublicUrl(filePath);

      const fileInfo = {
        key: filePath,
        url: urlData.publicUrl,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket: actualBucket,
        isPrivate,
        category,
        uploadedBy: userId
      };

      // Send notification to uploader
      if (userId) {
        await realtimeService.createNotification({
          userId,
          title: 'File Upload Success',
          message: `${file.originalname} has been uploaded successfully`,
          type: 'SUCCESS',
          metadata: {
            fileInfo: {
              name: file.originalname,
              size: file.size,
              type: file.mimetype
            }
          }
        });
      }

      // Share with users if specified
      if (shareWithUsers.length > 0) {
        await Promise.all(shareWithUsers.map(shareUserId =>
          realtimeService.createNotification({
            userId: shareUserId,
            title: 'File Shared With You',
            message: `A file has been shared with you: ${file.originalname}`,
            type: 'INFO',
            metadata: {
              fileInfo: {
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                url: urlData.publicUrl
              }
            }
          })
        ));
      }
      
      logger.info('File upload completed successfully', {
        fileName: fileInfo.originalName,
        key: fileInfo.key,
        bucket: fileInfo.bucket,
        size: fileInfo.size
      });

      return fileInfo;
    } catch (error) {
      logger.error('File upload failed', {
        error: error.message,
        fileName: file?.originalname,
        userId,
        bucket: bucketName,
        category
      });
      throw error;
    }
  }

  /**
   * Share a file with users
   * @param {string} fileKey - The file key
   * @param {string[]} userIds - Array of user IDs to share with
   * @param {string} sharedBy - ID of user sharing the file
   */
  async shareFile(fileKey, userIds, sharedBy) {
    try {
      const fileUrl = this.getFileUrl(fileKey);
      
      await Promise.all(userIds.map(userId =>
        realtimeService.createNotification({
          userId,
          title: 'New File Shared',
          message: 'A file has been shared with you',
          type: 'INFO',
          metadata: {
            fileKey,
            fileUrl,
            sharedBy
          }
        })
      ));

      return true;
    } catch (error) {
      logger.error(`File sharing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the public URL for a file
   * @param {string} filePath - The file path within the bucket
   * @param {string} bucketName - Optional bucket name
   * @returns {string} - The file's public URL
   */
  getFileUrl(filePath, bucketName = this.defaultBucket) {
    try {
      const { data } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      logger.error(`Failed to get file URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download a file's data
   * @param {string} filePath - The file path within the bucket
   * @param {string} bucketName - Optional bucket name
   * @returns {Buffer} - The file data as a buffer
   */
  async downloadFile(filePath, bucketName = this.defaultBucket) {
    try {
      await this.initialize();
      
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .download(filePath);
      
      if (error) {
        throw new NotFoundError(`File download failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      logger.error(`File download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a file and notify relevant users
   * @param {string} filePath - The file path
   * @param {Object} options - Delete options
   */
  async deleteFile(filePath, { bucketName = this.defaultBucket, userId = null } = {}) {
    try {
      await this.initialize();
      
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        throw new Error(`File deletion failed: ${error.message}`);
      }

      // Notify user of successful deletion
      if (userId) {
        await realtimeService.createNotification({
          userId,
          title: 'File Deleted',
          message: `File ${path.basename(filePath)} has been deleted successfully`,
          type: 'SUCCESS'
        });
      }
      
      return true;
    } catch (error) {
      // Notify user of deletion failure
      if (userId) {
        await realtimeService.createNotification({
          userId,
          title: 'File Deletion Failed',
          message: `Failed to delete ${path.basename(filePath)}: ${error.message}`,
          type: 'ERROR'
        });
      }

      logger.error(`File deletion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List files in a bucket or folder
   * @param {string} folder - Optional folder path
   * @param {string} bucketName - Optional bucket name
   * @returns {Array} - Array of file objects
   */
  async listFiles(folder = '', bucketName = this.defaultBucket) {
    try {
      await this.initialize();
      
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list(folder);
      
      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      logger.error(`Failed to list files: ${error.message}`);
      throw error;
    }
  }
}

// Create and export an instance of the storage service
const storageService = new StorageService();

// Log service creation
logger.info('Storage service instance created');

module.exports = storageService; 