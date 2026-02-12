/**
 * Formatting utility functions
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateString, options = {}) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a stage name for display
 */
export function formatStageName(stage) {
  if (!stage) return '';
  return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
}
