/**
 * API client for handling file uploads
 */

export type UploadResponse = {
  success: boolean;
  data?: {
    id: string;
    url: string;
    publicId: string;
    title: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
  error?: string;
};

/**
 * Upload a file with metadata
 */
export async function uploadFile(
  file: File,
  metadata: {
    title?: string;
    description?: string;
    isPublic?: boolean;
    tags?: string[];
  },
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  try {
    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    formData.append('title', metadata.title || file.name);
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.isPublic !== undefined) {
      formData.append('isPublic', String(metadata.isPublic));
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }
    
    // Create XMLHttpRequest to track upload progress
    if (onProgress) {
      return await uploadWithProgress(formData, onProgress);
    }
    
    // Use standard fetch if progress tracking not needed
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
      };
    }
    
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload with progress tracking using XMLHttpRequest
 */
function uploadWithProgress(
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            data: response.data,
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid response format',
          });
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: false,
            error: response.error || `Server error: ${xhr.status}`,
          });
        } catch (error) {
          resolve({
            success: false,
            error: `Server error: ${xhr.status}`,
          });
        }
      }
    });
    
    // Handle network errors
    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: 'Network error occurred',
      });
    });
    
    // Handle timeouts
    xhr.addEventListener('timeout', () => {
      resolve({
        success: false,
        error: 'Upload timed out',
      });
    });
    
    // Open and send the request
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  });
}

/**
 * Get presigned URL for direct upload to cloud storage
 * (for future implementation)
 */
export async function getPresignedUrl(
  filename: string,
  contentType: string
): Promise<{ url: string; fields: Record<string, string> } | null> {
  try {
    const response = await fetch('/api/upload/presigned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return null;
  }
} 