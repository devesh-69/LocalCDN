import sharp from 'sharp';
import { ExifParserFactory } from 'ts-exif-parser';

// Types for image metadata
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size?: number;
  exif?: any;
  iptc?: any;
  xmp?: any;
  icc?: any;
  // Parsed and normalized metadata fields
  camera?: string;
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  exposureTime?: string; // 1/250, etc.
  iso?: number;
  captureDate?: Date;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  [key: string]: any;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
}

/**
 * Service for image processing operations
 */
export class ImageProcessor {
  /**
   * Process an image, optionally stripping metadata
   */
  static async processImage(
    buffer: Buffer,
    options: {
      stripMetadata?: boolean;
      resize?: { width?: number; height?: number; fit?: keyof sharp.FitEnum };
      format?: 'jpeg' | 'png' | 'webp' | 'avif';
      quality?: number;
    } = {}
  ): Promise<ProcessedImage> {
    try {
      let image = sharp(buffer);
      
      // Get metadata from the original image
      const metadata = await image.metadata();
      
      // Apply resizing if requested
      if (options.resize) {
        image = image.resize({
          width: options.resize.width,
          height: options.resize.height,
          fit: options.resize.fit || 'inside',
          withoutEnlargement: true,
        });
      }
      
      // Convert format if requested
      if (options.format) {
        const formatOptions: any = {};
        
        if (options.quality) {
          formatOptions.quality = options.quality;
        }
        
        image = image.toFormat(options.format, formatOptions);
      }
      
      // Strip metadata if requested
      if (options.stripMetadata) {
        image = image.withMetadata({
          // Preserve orientation but remove everything else
          orientation: metadata.orientation,
        });
      }
      
      // Process the image
      const processedBuffer = await image.toBuffer();
      
      // Get metadata of the processed image
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();
      
      return {
        buffer: processedBuffer,
        metadata: {
          width: processedMetadata.width || metadata.width || 0,
          height: processedMetadata.height || metadata.height || 0,
          format: processedMetadata.format || metadata.format || 'unknown',
          size: processedBuffer.length,
          exif: options.stripMetadata ? undefined : metadata.exif,
          iptc: options.stripMetadata ? undefined : metadata.iptc,
          xmp: options.stripMetadata ? undefined : metadata.xmp,
          icc: options.stripMetadata ? undefined : metadata.icc,
        },
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }
  
  /**
   * Extract metadata from an image
   */
  static async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Create basic metadata object
      const extractedMetadata: ImageMetadata = {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        exif: metadata.exif,
        iptc: metadata.iptc,
        xmp: metadata.xmp,
        icc: metadata.icc,
      };
      
      // Parse EXIF data if available
      if (metadata.exif) {
        try {
          const exifParser = ExifParserFactory.create(Buffer.from(metadata.exif));
          const result = exifParser.parse();
          
          // Extract camera and lens information
          if (result.tags) {
            extractedMetadata.make = result.tags.Make;
            extractedMetadata.model = result.tags.Model;
            extractedMetadata.camera = [result.tags.Make, result.tags.Model]
              .filter(Boolean)
              .join(' ');
            
            // Extract lens information
            extractedMetadata.lens = result.tags.LensModel || result.tags.Lens;
            
            // Extract camera settings
            extractedMetadata.focalLength = result.tags.FocalLength;
            
            if (result.tags.FNumber) {
              extractedMetadata.aperture = result.tags.FNumber;
            }
            
            if (result.tags.ExposureTime) {
              // Format exposure time as a fraction if needed
              const exposureTime = result.tags.ExposureTime;
              if (exposureTime < 1) {
                extractedMetadata.exposureTime = `1/${Math.round(1 / exposureTime)}`;
              } else {
                extractedMetadata.exposureTime = `${exposureTime}`;
              }
            }
            
            extractedMetadata.iso = result.tags.ISO;
            
            // Extract date information
            if (result.tags.DateTimeOriginal) {
              extractedMetadata.captureDate = new Date(result.tags.DateTimeOriginal * 1000);
            } else if (result.tags.DateTime) {
              extractedMetadata.captureDate = new Date(result.tags.DateTime * 1000);
            }
            
            // Extract GPS information
            if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
              extractedMetadata.gps = {
                latitude: result.tags.GPSLatitude,
                longitude: result.tags.GPSLongitude,
                altitude: result.tags.GPSAltitude,
              };
            }
          }
        } catch (exifError) {
          console.warn('Failed to parse EXIF data:', exifError);
        }
      }
      
      return extractedMetadata;
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw error;
    }
  }
  
  /**
   * Create an optimized thumbnail from an image
   */
  static async createThumbnail(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      format?: 'jpeg' | 'webp';
      quality?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const { width = 300, height = 300, format = 'webp', quality = 80 } = options;
      
      const thumbnail = await sharp(buffer)
        .resize({
          width,
          height,
          fit: 'cover',
          position: 'entropy', // Focus on the most "interesting" part
        })
        .toFormat(format, { quality })
        .toBuffer();
      
      return thumbnail;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }
  
  /**
   * Strip all metadata from an image
   */
  static async stripAllMetadata(buffer: Buffer): Promise<Buffer> {
    try {
      const strippedImage = await sharp(buffer)
        .withMetadata({
          // Keep orientation if needed
          orientation: undefined,
        })
        .toBuffer();
      
      return strippedImage;
    } catch (error) {
      console.error('Metadata stripping error:', error);
      throw error;
    }
  }
  
  /**
   * Normalize metadata from different sources into a standard format
   */
  static normalizeMetadata(metadata: ImageMetadata): Record<string, any> {
    const normalized: Record<string, any> = {
      basic: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
      },
    };
    
    // Extract EXIF data into a usable format
    if (metadata.exif) {
      normalized.exif = {};
      
      // Add camera information if available
      if (metadata.camera) normalized.exif.camera = metadata.camera;
      if (metadata.make) normalized.exif.make = metadata.make;
      if (metadata.model) normalized.exif.model = metadata.model;
      if (metadata.lens) normalized.exif.lens = metadata.lens;
      
      // Add shooting settings if available
      if (metadata.focalLength) normalized.exif.focalLength = `${metadata.focalLength}mm`;
      if (metadata.aperture) normalized.exif.aperture = `f/${metadata.aperture}`;
      if (metadata.exposureTime) normalized.exif.exposureTime = metadata.exposureTime;
      if (metadata.iso) normalized.exif.iso = metadata.iso;
      
      // Add date information if available
      if (metadata.captureDate) {
        normalized.exif.captureDate = metadata.captureDate;
      }
      
      // Add GPS information if available
      if (metadata.gps && metadata.gps.latitude && metadata.gps.longitude) {
        normalized.exif.gps = {
          latitude: metadata.gps.latitude,
          longitude: metadata.gps.longitude,
          altitude: metadata.gps.altitude,
        };
      }
    }
    
    // Add IPTC data if available
    if (metadata.iptc) {
      normalized.iptc = {};
      
      // Process IPTC data (would need a specific parser for detailed extraction)
      normalized.iptc.exists = true;
    }
    
    // Add XMP data if available
    if (metadata.xmp) {
      normalized.xmp = {};
      
      // Process XMP data (would need a specific parser for detailed extraction)
      normalized.xmp.exists = true;
    }
    
    return normalized;
  }
  
  /**
   * Extract specific metadata fields for searching and indexing
   */
  static extractSearchableMetadata(metadata: ImageMetadata): Record<string, any> {
    const searchable: Record<string, any> = {};
    
    // Add basic image info
    searchable.dimensions = {
      width: metadata.width,
      height: metadata.height,
    };
    
    searchable.format = metadata.format;
    
    // Add camera and settings info if available
    if (metadata.camera) searchable.camera = metadata.camera;
    if (metadata.make) searchable.make = metadata.make;
    if (metadata.model) searchable.model = metadata.model;
    if (metadata.lens) searchable.lens = metadata.lens;
    
    // Add capture date if available
    if (metadata.captureDate) {
      searchable.captureDate = metadata.captureDate;
    }
    
    // Add GPS information if available
    if (metadata.gps && metadata.gps.latitude && metadata.gps.longitude) {
      searchable.location = {
        lat: metadata.gps.latitude,
        lng: metadata.gps.longitude,
      };
    }
    
    return searchable;
  }
} 