import { connectDB } from '@/lib/db';
import { ImageProcessor } from '@/services/ImageProcessor';
import { StorageService } from '@/services/StorageService';
import Image from '@/models/Image';
import MetadataVersion from '@/models/MetadataVersion';
import { MetadataVersion as MetadataVersionType } from '@/components/metadata/VersionHistory';
import { v4 as uuidv4 } from 'uuid';
import { flattenObject } from '@/lib/utils';
import { MongoQueryBuilder } from '@/lib/MongoQueryBuilder';
import { memoryCache } from '@/lib/cache';

/**
 * Service for metadata operations
 */
export class MetadataService {
  /**
   * Get metadata for an image
   */
  static async getImageMetadata(
    imageId: string,
    options: {
      userId?: string;
      versionId?: string;
      includeBasicInfo?: boolean;
    } = {}
  ) {
    try {
      await connectDB();
      
      // Find the image
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Check authorization for private images
      if (!image.isPublic && (!options.userId || image.owner.toString() !== options.userId)) {
        throw new Error('User not authorized to view this image');
      }
      
      // Get the image metadata
      let metadata: Record<string, any> = {};
      
      if (options.versionId) {
        // Get metadata from a specific version
        const version = await MetadataVersion.findOne({
          _id: options.versionId,
          imageId,
        });
        
        if (!version) {
          throw new Error('Metadata version not found');
        }
        
        metadata = version.metadata;
      } else {
        // Get current metadata from the image
        metadata = {
          basic: {
            title: image.title,
            description: image.description || '',
            width: image.width,
            height: image.height,
            format: image.format,
            size: image.size,
            uploadDate: image.createdAt,
            lastModified: image.updatedAt,
            tags: image.tags,
          },
          ...image.metadata,
        };
      }
      
      // Return the metadata
      const response: Record<string, any> = {
        metadata,
      };
      
      // Include basic image info if requested
      if (options.includeBasicInfo) {
        response.id = image._id.toString();
        response.title = image.title;
        response.url = image.url;
        response.width = image.width;
        response.height = image.height;
        response.format = image.format;
        response.size = image.size;
        response.createdAt = image.createdAt;
        response.updatedAt = image.updatedAt;
        response.owner = image.owner.toString();
        response.isPublic = image.isPublic;
      }
      
      return response;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw error;
    }
  }
  
  /**
   * Update metadata for an image
   */
  static async updateImageMetadata(
    imageId: string,
    options: {
      userId: string;
      metadata?: Record<string, any>;
      restoreFromVersionId?: string;
    }
  ) {
    try {
      await connectDB();
      
      // Find the image
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Check if the user owns the image
      if (image.owner.toString() !== options.userId) {
        throw new Error('User not authorized to update this image');
      }
      
      // Get the current metadata to save as a version
      const currentMetadata = image.metadata || {};
      
      // Create a metadata version before making changes
      const version = new MetadataVersion({
        imageId,
        createdAt: new Date(),
        author: options.userId,
        metadata: currentMetadata,
        changeType: 'edit',
        description: 'Metadata updated by user',
      });
      
      await version.save();
      
      let newMetadata: Record<string, any> = {};
      let versionDescription = 'Metadata updated by user';
      
      if (options.restoreFromVersionId) {
        // Restore metadata from a previous version
        const previousVersion = await MetadataVersion.findOne({
          _id: options.restoreFromVersionId,
          imageId,
        });
        
        if (!previousVersion) {
          throw new Error('Metadata version not found');
        }
        
        newMetadata = previousVersion.metadata;
        versionDescription = `Metadata restored from version ${options.restoreFromVersionId}`;
      } else if (options.metadata) {
        // Update with new metadata
        newMetadata = options.metadata;
      } else {
        throw new Error('No metadata or version provided');
      }
      
      // Update the image with the new metadata
      const updatedImage = await Image.findByIdAndUpdate(
        imageId,
        { 
          $set: { metadata: newMetadata }
        },
        { new: true }
      );
      
      return {
        success: true,
        versionId: version._id.toString(),
        updatedImage,
      };
    } catch (error) {
      console.error('Error updating image metadata:', error);
      throw error;
    }
  }
  
  /**
   * Get metadata version history for an image
   */
  static async getMetadataVersions(
    imageId: string,
    options: {
      userId?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<MetadataVersionType[]> {
    try {
      await connectDB();
      
      // Find the image
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Check authorization for private images
      if (!image.isPublic && (!options.userId || image.owner.toString() !== options.userId)) {
        throw new Error('User not authorized to view this image');
      }
      
      // Get version history
      const versions = await MetadataVersion.find({ imageId })
        .sort({ createdAt: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20);
      
      // Map to the expected format
      return versions.map(version => ({
        id: version._id.toString(),
        createdAt: version.createdAt,
        author: version.author,
        description: version.description,
        changeType: version.changeType,
      }));
    } catch (error) {
      console.error('Error getting metadata versions:', error);
      throw error;
    }
  }
  
  /**
   * Strip all metadata from an image
   */
  static async stripImageMetadata(
    imageId: string,
    options: {
      userId: string;
    }
  ) {
    try {
      await connectDB();
      
      // Find the image
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Check if the user owns the image
      if (image.owner.toString() !== options.userId) {
        throw new Error('User not authorized to update this image');
      }
      
      // Get the current metadata to save as a version
      const currentMetadata = image.metadata || {};
      
      // Create a metadata version before making changes
      const version = new MetadataVersion({
        imageId,
        createdAt: new Date(),
        author: options.userId,
        metadata: currentMetadata,
        changeType: 'strip',
        description: 'All metadata stripped for privacy',
      });
      
      await version.save();
      
      // Update the image with empty metadata (except for basic info)
      const updatedImage = await Image.findByIdAndUpdate(
        imageId,
        { 
          $set: { 
            metadata: {
              custom: {},
            } 
          }
        },
        { new: true }
      );
      
      return {
        success: true,
        versionId: version._id.toString(),
        updatedImage,
      };
    } catch (error) {
      console.error('Error stripping image metadata:', error);
      throw error;
    }
  }
  
  /**
   * Search images by metadata fields
   */
  static async searchByMetadata(
    query: {
      text?: string;
      fields?: Record<string, any>;
      userId?: string;
      isPublic?: boolean;
      dateFilter?: Record<string, any>;
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ) {
    try {
      await connectDB();
      
      const limit = options.limit || query.limit || 20;
      const skip = options.skip || query.skip || 0;
      const sort = options.sort || query.sort || { createdAt: -1 };
      
      // Create cache key
      const cacheKey = `search:${JSON.stringify(query)}:${JSON.stringify(options)}`;
      
      // Check cache
      const cachedResult = memoryCache.get(cacheKey);
      if (cachedResult) {
        console.log('[MetadataService] Cache hit for search:', cacheKey);
        return cachedResult;
      }
      
      // Build search query using query builder pattern
      const queryBuilder = new MongoQueryBuilder();
      
      // Add ownership or public filter
      if (query.userId) {
        queryBuilder.addOr([
          { owner: query.userId },
          { isPublic: true }
        ]);
      } else if (query.isPublic !== undefined) {
        queryBuilder.addCondition("isPublic", query.isPublic);
      }
      
      // Add text search if provided
      if (query.text) {
        queryBuilder.addTextSearch(query.text);
      }
      
      // Add metadata field search
      if (query.fields) {
        const flattened = flattenObject(query.fields);
        
        // Handle tags specially
        if (query.fields.tags && Array.isArray(query.fields.tags)) {
          queryBuilder.addCondition("tags", { $in: query.fields.tags });
          delete flattened.tags;
        }
        
        // Add remaining metadata fields
        Object.entries(flattened).forEach(([key, value]) => {
          queryBuilder.addCondition(`metadata.${key}`, value);
        });
      }
      
      // Add date range filter if provided
      if (query.dateFilter) {
        if (query.dateFilter.captureDate) {
          const dateCondition: Record<string, any> = {};
          
          if (query.dateFilter.captureDate.$gte) {
            dateCondition.$gte = query.dateFilter.captureDate.$gte;
          }
          
          if (query.dateFilter.captureDate.$lt) {
            dateCondition.$lt = query.dateFilter.captureDate.$lt;
          }
          
          queryBuilder.addCondition("metadata.captureDate", dateCondition);
        }
      }
      
      // Convert to MongoDB query
      const searchQuery = queryBuilder.build();
      
      // Perform the search
      const pipeline = [];
      
      // Add match stage with our query
      pipeline.push({ $match: searchQuery });
      
      // Sort stage
      pipeline.push({ $sort: sort });
      
      // Skip and limit for pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
      
      console.log('[MetadataService] Cache miss for search:', cacheKey);
      
      // Perform aggregation for better performance with large datasets
      const images = await Image.aggregate(pipeline);
      
      // Cache results for future use (60 seconds)
      memoryCache.set(cacheKey, images, 60);
      
      return images;
    } catch (error) {
      console.error('Error searching by metadata:', error);
      throw error;
    }
  }
  
  /**
   * Count total search results for pagination
   */
  static async countSearchResults(
    query: {
      text?: string;
      fields?: Record<string, any>;
      userId?: string;
      isPublic?: boolean;
      dateFilter?: Record<string, any>;
    }
  ): Promise<number> {
    try {
      await connectDB();
      
      // Create cache key
      const cacheKey = `count:${JSON.stringify(query)}`;
      
      // Check cache
      const cachedCount = memoryCache.get<number>(cacheKey);
      if (cachedCount !== null) {
        console.log('[MetadataService] Cache hit for count:', cacheKey);
        return cachedCount;
      }
      
      // Build the same search query used in searchByMetadata
      const queryBuilder = new MongoQueryBuilder();
      
      // Add ownership or public filter
      if (query.userId) {
        queryBuilder.addOr([
          { owner: query.userId },
          { isPublic: true }
        ]);
      } else if (query.isPublic !== undefined) {
        queryBuilder.addCondition("isPublic", query.isPublic);
      }
      
      // Add text search if provided
      if (query.text) {
        queryBuilder.addTextSearch(query.text);
      }
      
      // Add metadata field search
      if (query.fields) {
        const flattened = flattenObject(query.fields);
        
        // Handle tags specially
        if (query.fields.tags && Array.isArray(query.fields.tags)) {
          queryBuilder.addCondition("tags", { $in: query.fields.tags });
          delete flattened.tags;
        }
        
        // Add remaining metadata fields
        Object.entries(flattened).forEach(([key, value]) => {
          queryBuilder.addCondition(`metadata.${key}`, value);
        });
      }
      
      // Add date range filter if provided
      if (query.dateFilter) {
        if (query.dateFilter.captureDate) {
          const dateCondition: Record<string, any> = {};
          
          if (query.dateFilter.captureDate.$gte) {
            dateCondition.$gte = query.dateFilter.captureDate.$gte;
          }
          
          if (query.dateFilter.captureDate.$lt) {
            dateCondition.$lt = query.dateFilter.captureDate.$lt;
          }
          
          queryBuilder.addCondition("metadata.captureDate", dateCondition);
        }
      }
      
      // Convert to MongoDB query
      const searchQuery = queryBuilder.build();
      
      console.log('[MetadataService] Cache miss for count:', cacheKey);
      
      // Count the total matching documents
      const count = await Image.countDocuments(searchQuery);
      
      // Cache the count result (120 seconds)
      memoryCache.set(cacheKey, count, 120);
      
      return count;
    } catch (error) {
      console.error('Error counting search results:', error);
      throw error;
    }
  }
  
  /**
   * Export metadata to a file format
   */
  static async exportMetadata(
    imageId: string,
    format: 'json' | 'xmp' | 'exif' = 'json',
    options: {
      userId?: string;
      versionId?: string;
    } = {}
  ) {
    try {
      await connectDB();
      
      // Get the metadata
      const data = await this.getImageMetadata(imageId, {
        userId: options.userId,
        versionId: options.versionId,
        includeBasicInfo: true,
      });
      
      // Return the data in the requested format
      switch (format) {
        case 'json':
          return {
            data: JSON.stringify(data, null, 2),
            contentType: 'application/json',
            filename: `metadata_${imageId}.json`,
          };
        
        // Add other format exports as needed
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting metadata:', error);
      throw error;
    }
  }
} 