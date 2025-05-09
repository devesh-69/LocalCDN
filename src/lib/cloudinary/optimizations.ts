/**
 * Cloudinary optimization utilities to minimize bandwidth and storage usage
 * while maximizing image quality for different use cases
 */

type ImageFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
type ImageQuality = 'auto' | number;
type ImageFit = 'crop' | 'fill' | 'scale' | 'pad';

interface OptimizationOptions {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: ImageQuality;
  fit?: ImageFit;
  dpr?: number;
}

/**
 * Transforms a Cloudinary URL to apply optimizations
 * based on the intended use case and device
 */
export function optimizeCloudinaryUrl(url: string, options: OptimizationOptions = {}): string {
  if (!url.includes('cloudinary') || !url.includes('/image/upload/')) {
    // Not a Cloudinary URL, return as is
    return url;
  }

  // Extract base URL and transformation path
  const [baseUrl, transformPath] = url.split('/image/upload/');
  
  // Set default values for critical options
  const format = options.format || 'auto';
  const quality = options.quality || 'auto';
  const fit = options.fit || 'crop';
  
  // Start building the transformation string
  let transformation = 'f_' + format + ',q_' + quality;
  
  // Add responsive sizing if provided
  if (options.width || options.height) {
    transformation += `,${fit === 'crop' ? 'c_crop' : fit === 'fill' ? 'c_fill' : fit === 'scale' ? 'c_scale' : 'c_pad'}`;
    
    if (options.width) {
      transformation += `,w_${options.width}`;
    }
    
    if (options.height) {
      transformation += `,h_${options.height}`;
    }
  }
  
  // Add device pixel ratio (DPR) for retina displays if provided
  if (options.dpr) {
    transformation += `,dpr_${options.dpr}`;
  }
  
  // Combine everything back into a URL with transformations
  return `${baseUrl}/image/upload/${transformation}/${transformPath}`;
}

/**
 * Presets for common image usage scenarios
 */
export const imagePresets = {
  thumbnail: (url: string): string => {
    return optimizeCloudinaryUrl(url, {
      width: 200,
      height: 200,
      fit: 'fill',
      format: 'auto',
      quality: 80
    });
  },
  
  galleryItem: (url: string): string => {
    return optimizeCloudinaryUrl(url, {
      width: 400,
      height: 400,
      fit: 'fill',
      format: 'auto',
      quality: 'auto'
    });
  },
  
  profilePicture: (url: string): string => {
    return optimizeCloudinaryUrl(url, {
      width: 150,
      height: 150,
      fit: 'fill',
      format: 'auto',
      quality: 'auto'
    });
  },
  
  fullScreenView: (url: string, width: number = 1200): string => {
    return optimizeCloudinaryUrl(url, {
      width,
      format: 'auto',
      quality: 'auto',
      dpr: 2
    });
  },
  
  // For very small preview images (e.g., in lists or tables)
  microThumbnail: (url: string): string => {
    return optimizeCloudinaryUrl(url, {
      width: 60,
      height: 60,
      fit: 'fill',
      format: 'auto',
      quality: 70
    });
  }
};

/**
 * Dynamically selects the best image preset based on viewport size
 * This helps load appropriate image sizes for different devices
 */
export function responsiveImage(url: string, containerWidth: number): string {
  if (containerWidth <= 200) {
    return imagePresets.microThumbnail(url);
  } else if (containerWidth <= 400) {
    return imagePresets.thumbnail(url);
  } else if (containerWidth <= 800) {
    return imagePresets.galleryItem(url);
  } else {
    return imagePresets.fullScreenView(url, containerWidth);
  }
}

/**
 * Optimize image during upload to minimize storage use
 * Returns transformation parameters to apply during upload
 */
export function getUploadOptimizationParams(originalWidth?: number, originalHeight?: number): string {
  // Default optimization for uploads
  let params = 'q_auto:good';
  
  // If we have dimensions and the image is very large, resize it during upload
  if (originalWidth && originalHeight) {
    const maxDimension = 2048; // Maximum dimension to store
    
    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      if (originalWidth > originalHeight) {
        params += `,w_${maxDimension}`;
      } else {
        params += `,h_${maxDimension}`;
      }
    }
  }
  
  return params;
} 