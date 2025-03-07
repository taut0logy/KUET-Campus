/**
 * Utility to convert strings to URL-friendly slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @param {object} options - Slugify options
 * @returns {string} URL-friendly slug
 */
const slugify = (text, options = {}) => {
  if (!text) return '';
  
  const defaults = {
    lower: true,       // Convert to lowercase
    trim: true,        // Trim leading and trailing whitespace
    remove: /[*+~.()'"!:@]/g,  // Characters to remove
    replacement: '-',  // Replace spaces with this character
    maxLength: 100     // Maximum length of the slug
  };
  
  const opts = { ...defaults, ...options };
  
  let slug = text;
  
  // Convert to lowercase if requested
  if (opts.lower) {
    slug = slug.toLowerCase();
  }
  
  // Replace spaces with replacement character
  slug = slug.replace(/\s+/g, opts.replacement);
  
  // Remove special characters
  if (opts.remove) {
    slug = slug.replace(opts.remove, '');
  }
  
  // Replace accented characters with ASCII equivalents
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace any other non-alphanumeric characters with replacement
  slug = slug.replace(/[^a-zA-Z0-9-_]/g, opts.replacement);
  
  // Replace multiple instances of replacement with a single instance
  slug = slug.replace(new RegExp(`${opts.replacement}+`, 'g'), opts.replacement);
  
  // Trim replacement characters from start and end
  if (opts.trim) {
    slug = slug.replace(new RegExp(`^${opts.replacement}|${opts.replacement}$`, 'g'), '');
  }
  
  // Truncate to maximum length
  if (opts.maxLength && slug.length > opts.maxLength) {
    slug = slug.substring(0, opts.maxLength);
    
    // Make sure we don't truncate in the middle of a character
    if (slug.charAt(slug.length - 1) === opts.replacement) {
      slug = slug.slice(0, -1);
    }
  }
  
  return slug;
};

module.exports = slugify;
