
// File validation utilities

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Validate file before uploading
export const validateFile = (file: File): {valid: boolean; error?: string} => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false, 
      error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`
    };
  }
  
  return { valid: true };
};
