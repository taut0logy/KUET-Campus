import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Storage utilities for file handling
 */
export const storage = {
  /**
   * Uploads a file to Supabase storage
   * @param {File} file - The file to upload
   * @param {string} bucket - The storage bucket
   * @param {string} folder - Optional folder path within the bucket
   * @returns {Object} - The uploaded file information
   */
  uploadFile: async (file, bucket = 'app-uploads', folder = '') => {
    if (!file) throw new Error('No file provided');
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Create full path including folder if provided
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return {
      key: filePath,
      url: publicUrlData.publicUrl,
      fileName,
      originalName: file.name,
      fileType: file.type,
      bucket
    };
  },
  
  /**
   * Downloads a file from Supabase storage
   * @param {string} path - The file path
   * @param {string} bucket - The storage bucket
   * @returns {Blob} - The file blob
   */
  downloadFile: async (path, bucket = 'app-uploads') => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Gets the public URL of a file
   * @param {string} path - The file path
   * @param {string} bucket - The storage bucket
   * @returns {string} - The file's public URL
   */
  getFileUrl: (path, bucket = 'app-uploads') => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
  
  /**
   * Deletes a file from Supabase storage
   * @param {string} path - The file path
   * @param {string} bucket - The storage bucket
   * @returns {boolean} - Whether the deletion was successful
   */
  deleteFile: async (path, bucket = 'app-uploads') => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Realtime utilities for subscriptions
 */
export const realtime = {
  /**
   * Subscribes to changes in a database table
   * @param {string} table - The table name
   * @param {Object} options - Subscription options
   * @param {Function} callback - The callback function
   * @returns {Object} - The subscription object
   */
  subscribeToTable: (table, options = { event: '*' }, callback) => {
    const { event = '*', filter, schema = 'public' } = options;
    
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event, schema, table, filter }, 
        (payload) => callback(payload)
      )
      .subscribe();
  },
  
  /**
   * Subscribes to a specific channel
   * @param {string} channel - The channel name
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Object} - The subscription object
   */
  subscribeToChannel: (channel, event, callback) => {
    return supabase
      .channel(channel)
      .on('broadcast', { event }, (payload) => callback(payload))
      .subscribe();
  },
  
  /**
   * Broadcasts a message to a channel
   * @param {string} channel - The channel name
   * @param {string} event - The event name
   * @param {Object} payload - The message payload
   * @returns {boolean} - Whether the broadcast was successful
   */
  broadcast: async (channel, event, payload) => {
    const { error } = await supabase
      .channel(channel)
      .send({
        type: 'broadcast',
        event,
        payload
      });
    
    if (error) throw error;
    return true;
  },
  
  /**
   * Unsubscribes from a channel
   * @param {Object} subscription - The subscription object
   */
  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

export default supabase; 