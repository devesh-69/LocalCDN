import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to combine class names with Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes into a human-readable format with the appropriate unit
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date to include time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate a string to a specific length
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Deep copy an object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Flatten an object (for metadata handling)
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, string | number | boolean> {
  return Object.keys(obj).reduce((result: Record<string, any>, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], prefixedKey));
    } else if (Array.isArray(obj[key])) {
      result[prefixedKey] = obj[key].join(', ');
    } else if (obj[key] !== null && obj[key] !== undefined) {
      result[prefixedKey] = obj[key];
    }
    
    return result;
  }, {});
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 