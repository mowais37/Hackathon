// src/utils/formatDate.js
/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  // Check if dateString is valid
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
  
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
  
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
};

/**
 * Get relative time from a date string (e.g. "2 hours ago")
 * @param {string} dateString - The date string
 * @returns {string} - The relative time string
 */
export const getRelativeTime = (dateString) => {
  // Check if dateString is valid
  if (!dateString) return 'Unknown time';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diff = now - date;
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown time';
  }
};