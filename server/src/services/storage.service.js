const { supabaseAdmin } = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger.util');
const { ValidationError, NotFoundError } = require('../middleware/error.middleware');

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
  }

  /**
   * Initialize storage service and ensure buckets exist
   */
  async initialize() {
    try {
      if (this.initialized) return;
      
      // Check if the default bucket exists, create it if not
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        throw new Error(`Failed to list buckets: ${error.message}`);
      }
      
      const defaultBucketExists = buckets.some(bucket => bucket.name === this.defaultBucket);
      
      if (!defaultBucketExists) {
        // Create the default bucket with public access
        const { error: createError } = await this.supabase.storage.createBucket(this.defaultBucket, {
          public: true, // Allows public access to files
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (createError) {
          throw new Error(`Failed to create bucket: ${createError.message}`);
        }
        
        logger.info(`Created storage bucket: ${this.defaultBucket}`);
      }
      
      this.initialized = true;
      logger.info('Storage service initialized successfully');
    } catch (error) {
      logger.error(`Storage initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a file to storage
   * @param {Object} file - The file object (typically from multer middleware)
   * @param {string} folder - Optional folder path within the bucket
   * @param {string} bucketName - Optional bucket name (defaults to this.defaultBucket)
   * @returns {Object} - The uploaded file information
   */
  async uploadFile(file, folder = '', bucketName = this.defaultBucket) {
    try {
      await this.initialize();
      
      if (!file || !file.buffer) {
        throw new ValidationError('Invalid file provided');
      }
      
      // Generate a unique file name
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      
      // Create full path including folder if provided
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      // Upload file to Supabase
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }
      
      // Get public URL for the file
      const { data: publicUrlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return {
        key: filePath,
        url: publicUrlData.publicUrl,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket: bucketName
      };
    } catch (error) {
      logger.error(`File upload failed: ${error.message}`);
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
   * Delete a file from storage
   * @param {string} filePath - The file path within the bucket
   * @param {string} bucketName - Optional bucket name
   * @returns {boolean} - True if successful
   */
  async deleteFile(filePath, bucketName = this.defaultBucket) {
    try {
      await this.initialize();
      
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        throw new Error(`File deletion failed: ${error.message}`);
      }
      
      return true;
    } catch (error) {
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

module.exports = storageService; 