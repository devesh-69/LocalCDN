import { uploadImage, deleteImage, generateImageUrl } from "@/lib/cloudinary";
import Image, { IImage } from "@/models/Image";
import Version, { IVersion } from "@/models/Version";
import { createDocument, findDocumentById, findDocuments, updateDocument, deleteDocument } from "@/lib/dbUtils";
import { connectDB } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';
import Collection from '@/models/Collection';
import { ObjectId } from 'mongodb';

/**
 * StorageService provides a unified interface for interacting with both 
 * Cloudinary for image storage and MongoDB for metadata storage.
 */
export class StorageService {
  /**
   * Upload a new image to storage
   */
  static async uploadImage(
    file: string | Buffer,
    metadata: {
      title: string;
      description?: string;
      ownerId: string;
      tags?: string[];
      isPublic?: boolean;
      metadata?: Record<string, any>;
      collectionId?: string;
    }
  ): Promise<IImage> {
    try {
      await connectDB();
      
      // 1. Upload image to Cloudinary
      const cloudinaryResult = await uploadImage(file, {
        folder: `localcdn/${metadata.ownerId}`,
        tags: metadata.tags,
      });
      
      // 2. Create image document in MongoDB
      const imageData = {
        title: metadata.title,
        description: metadata.description,
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        size: cloudinaryResult.bytes,
        owner: metadata.ownerId,
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        metadata: metadata.metadata || {},
        uploadDate: new Date(),
        lastModified: new Date(),
      };
      
      const image = await createDocument<IImage>(Image, imageData);
      
      // If collection ID is provided, add the image to the collection
      if (metadata.collectionId) {
        await Collection.findByIdAndUpdate(
          metadata.collectionId,
          { $push: { images: image._id } },
          { new: true }
        );
      }
      
      return image;
    } catch (error) {
      console.error("Error in StorageService.uploadImage:", error);
      throw error;
    }
  }
  
  /**
   * Get image by ID
   */
  static async getImage(
    imageId: string,
    options: {
      includeVersions?: boolean;
    } = {}
  ): Promise<IImage | null> {
    try {
      const populate = options.includeVersions ? 'versions' : '';
      const image = await findDocumentById<IImage>(Image, imageId, { populate });
      return image;
    } catch (error) {
      console.error("Error in StorageService.getImage:", error);
      throw error;
    }
  }
  
  /**
   * Get images by owner ID
   */
  static async getImagesByOwner(
    ownerId: string,
    options: {
      limit?: number;
      skip?: number;
      sort?: string | Record<string, 1 | -1>;
      includeVersions?: boolean;
    } = {}
  ): Promise<IImage[]> {
    try {
      const populate = options.includeVersions ? 'versions' : '';
      const images = await findDocuments<IImage>(
        Image,
        { owner: ownerId },
        {
          populate,
          limit: options.limit,
          skip: options.skip,
          sort: options.sort || { createdAt: -1 }
        }
      );
      return images;
    } catch (error) {
      console.error("Error in StorageService.getImagesByOwner:", error);
      throw error;
    }
  }
  
  /**
   * Get public images
   */
  static async getPublicImages(
    options: {
      limit?: number;
      skip?: number;
      sort?: string | Record<string, 1 | -1>;
    } = {}
  ): Promise<IImage[]> {
    try {
      const images = await findDocuments<IImage>(
        Image,
        { isPublic: true },
        {
          limit: options.limit,
          skip: options.skip,
          sort: options.sort || { createdAt: -1 }
        }
      );
      return images;
    } catch (error) {
      console.error("Error in StorageService.getPublicImages:", error);
      throw error;
    }
  }
  
  /**
   * Update image metadata
   */
  static async updateImage(
    imageId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      isPublic?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<IImage | null> {
    try {
      const image = await updateDocument<IImage>(Image, imageId, updates);
      return image;
    } catch (error) {
      console.error("Error in StorageService.updateImage:", error);
      throw error;
    }
  }
  
  /**
   * Delete an image and all its versions
   */
  static async deleteImage(imageId: string): Promise<{ success: boolean; message: string }> {
    try {
      await connectDB();
      
      // 1. Get the image and its versions
      const image = await findDocumentById<IImage>(Image, imageId, {
        populate: 'versions'
      });
      
      if (!image) {
        return { success: false, message: "Image not found" };
      }
      
      // 2. Delete image from Cloudinary
      await deleteImage(image.publicId);
      
      // 3. Delete all versions from Cloudinary and MongoDB
      if (image.versions && image.versions.length > 0) {
        for (const versionId of image.versions) {
          const version = await findDocumentById<IVersion>(Version, versionId.toString());
          if (version) {
            await deleteImage(version.publicId);
            await deleteDocument(Version, version._id.toString());
          }
        }
      }
      
      // 4. Delete image document from MongoDB
      await deleteDocument(Image, imageId);
      
      // Remove from collections
      await Collection.updateMany(
        { images: image._id },
        { $pull: { images: image._id } }
      );
      
      return { success: true, message: "Image and all versions deleted successfully" };
    } catch (error) {
      console.error("Error in StorageService.deleteImage:", error);
      throw error;
    }
  }
  
  /**
   * Create a transformed version of an image
   */
  static async createImageVersion(
    imageId: string,
    transformation: {
      type: "crop" | "resize" | "filter" | "watermark" | "other";
      params: Record<string, any>;
    }
  ): Promise<IVersion> {
    try {
      await connectDB();
      
      // 1. Get the original image
      const image = await findDocumentById<IImage>(Image, imageId);
      
      if (!image) {
        throw new Error("Original image not found");
      }
      
      // 2. Apply transformation in Cloudinary
      const transformationParams = [];
      
      if (transformation.type === "crop") {
        transformationParams.push({
          crop: transformation.params.crop || "scale",
          width: transformation.params.width,
          height: transformation.params.height,
        });
      } else if (transformation.type === "resize") {
        transformationParams.push({
          crop: "scale",
          width: transformation.params.width,
          height: transformation.params.height,
        });
      } else if (transformation.type === "filter") {
        transformationParams.push({
          effect: transformation.params.effect,
        });
      } else if (transformation.type === "watermark") {
        transformationParams.push({
          overlay: transformation.params.overlayPublicId,
          gravity: transformation.params.gravity || "south_east",
          x: transformation.params.x || 10,
          y: transformation.params.y || 10,
          opacity: transformation.params.opacity || 70,
        });
      } else {
        // Custom transformations
        transformationParams.push(transformation.params);
      }
      
      // 3. Generate a new URL
      const transformedUrl = generateImageUrl(image.publicId, {
        ...transformation.params,
      });
      
      // 4. Create version document
      const versionData = {
        originalImage: image._id,
        publicId: `${image.publicId}_${transformation.type}`,
        url: transformedUrl,
        format: image.format,
        width: transformation.params.width || image.width,
        height: transformation.params.height || image.height,
        size: 0, // We don't know the exact size without a new upload
        transformation: {
          type: transformation.type,
          params: transformation.params,
        },
      };
      
      const version = await createDocument<IVersion>(Version, versionData);
      
      // 5. Update original image to include this version
      await updateDocument<IImage>(
        Image,
        imageId,
        { $push: { versions: version._id } }
      );
      
      return version;
    } catch (error) {
      console.error("Error in StorageService.createImageVersion:", error);
      throw error;
    }
  }
  
  /**
   * Search images by various criteria
   */
  static async searchImages(
    query: {
      text?: string;
      tags?: string[];
      ownerId?: string;
      isPublic?: boolean;
      metadata?: Record<string, any>;
    },
    options: {
      limit?: number;
      skip?: number;
      sort?: string | Record<string, 1 | -1>;
    } = {}
  ): Promise<IImage[]> {
    try {
      const searchQuery: any = {};
      
      // Build the search query
      if (query.text) {
        searchQuery.$text = { $search: query.text };
      }
      
      if (query.tags && query.tags.length > 0) {
        searchQuery.tags = { $in: query.tags };
      }
      
      if (query.ownerId) {
        searchQuery.owner = query.ownerId;
      }
      
      if (query.isPublic !== undefined) {
        searchQuery.isPublic = query.isPublic;
      }
      
      if (query.metadata) {
        for (const [key, value] of Object.entries(query.metadata)) {
          searchQuery[`metadata.${key}`] = value;
        }
      }
      
      const images = await findDocuments<IImage>(
        Image,
        searchQuery,
        {
          limit: options.limit,
          skip: options.skip,
          sort: options.sort || { createdAt: -1 }
        }
      );
      
      return images;
    } catch (error) {
      console.error("Error in StorageService.searchImages:", error);
      throw error;
    }
  }

  /**
   * Get all images for a user
   */
  static async getUserImages(userId: string, limit = 20, offset = 0) {
    try {
      await connectDB();
      
      const images = await Image.find({ ownerId: userId })
        .sort({ uploadDate: -1 })
        .skip(offset)
        .limit(limit)
        .exec();
      
      const total = await Image.countDocuments({ ownerId: userId });
      
      return {
        images,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + images.length < total,
        },
      };
    } catch (error) {
      console.error('Error getting user images:', error);
      throw error;
    }
  }
  
  /**
   * Create a new collection
   */
  static async createCollection(name: string, ownerId: string, description = '') {
    try {
      await connectDB();
      
      const collection = new Collection({
        name,
        ownerId,
        description,
        images: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      });
      
      await collection.save();
      return collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }
  
  /**
   * Add an image to a collection
   */
  static async addToCollection(collectionId: string, imageId: string) {
    try {
      await connectDB();
      
      const result = await Collection.findByIdAndUpdate(
        collectionId,
        {
          $addToSet: { images: new ObjectId(imageId) },
          $set: { lastUpdated: new Date() }
        },
        { new: true }
      );
      
      if (!result) {
        throw new Error('Collection not found');
      }
      
      return result;
    } catch (error) {
      console.error('Error adding to collection:', error);
      throw error;
    }
  }
  
  /**
   * Remove an image from a collection
   */
  static async removeFromCollection(collectionId: string, imageId: string) {
    try {
      await connectDB();
      
      const result = await Collection.findByIdAndUpdate(
        collectionId,
        {
          $pull: { images: new ObjectId(imageId) },
          $set: { lastUpdated: new Date() }
        },
        { new: true }
      );
      
      if (!result) {
        throw new Error('Collection not found');
      }
      
      return result;
    } catch (error) {
      console.error('Error removing from collection:', error);
      throw error;
    }
  }
  
  /**
   * Get all collections for a user
   */
  static async getUserCollections(userId: string) {
    try {
      await connectDB();
      
      const collections = await Collection.find({ ownerId: userId })
        .sort({ lastUpdated: -1 })
        .exec();
      
      return collections;
    } catch (error) {
      console.error('Error getting user collections:', error);
      throw error;
    }
  }

  /**
   * Get images with filtering, pagination, and sorting
   */
  static async getImages(
    query: Record<string, any> = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: string | Record<string, 1 | -1>;
    } = {}
  ): Promise<IImage[]> {
    try {
      const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
      
      const images = await Image.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
      
      return images;
    } catch (error) {
      console.error("Error in StorageService.getImages:", error);
      throw error;
    }
  }

  /**
   * Count total images that match a query
   */
  static async countImages(query: Record<string, any> = {}): Promise<number> {
    try {
      const count = await Image.countDocuments(query);
      return count;
    } catch (error) {
      console.error("Error in StorageService.countImages:", error);
      throw error;
    }
  }

  /**
   * Upload avatar image to storage
   */
  static async uploadAvatar(
    file: File,
    fileName: string,
    userId: string
  ) {
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Process the image to resize and optimize for avatar use
      const sharp = (await import('sharp')).default;
      
      // Resize to standard avatar size (250x250) and optimize
      const processedImageBuffer = await sharp(buffer)
        .resize(250, 250, {
          fit: 'cover',
          position: 'center',
        })
        .toFormat('webp', { quality: 80 })
        .toBuffer();
      
      // Create a blob to upload
      const blob = new Blob([processedImageBuffer], { type: 'image/webp' });
      const processedFile = new File([blob], fileName.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
      });
      
      // Upload to Cloudinary (or your storage provider)
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('folder', 'avatars');
      
      // Upload configuration - separate folder and transformation for avatars
      const uploadResult = await fetch(this.getUploadUrl(), {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResult.ok) {
        throw new Error(`Failed to upload avatar: ${uploadResult.statusText}`);
      }
      
      const data = await uploadResult.json();
      
      return {
        success: true,
        url: data.url,
        publicId: data.publicId,
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during avatar upload',
      };
    }
  }

  /**
   * Delete a file from storage by URL or public ID
   */
  static async deleteFile(urlOrPublicId: string) {
    try {
      // Extract the public ID from URL if a full URL was provided
      let publicId = urlOrPublicId;
      
      if (urlOrPublicId.startsWith('http')) {
        // If it's a URL, extract the path part
        const url = new URL(urlOrPublicId);
        const pathParts = url.pathname.split('/');
        
        // Remove any file extension
        const lastPart = pathParts.pop() || '';
        const fileNameWithoutExt = lastPart.split('.')[0];
        
        // Join back the path to get the public ID (format depends on your storage provider)
        pathParts.push(fileNameWithoutExt);
        publicId = pathParts.join('/').replace(/^\//, '');
      }
      
      // Call the delete API of your storage provider
      const response = await fetch(`${process.env.STORAGE_API_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STORAGE_API_KEY}`,
        },
        body: JSON.stringify({
          publicId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during file deletion',
      };
    }
  }

  /**
   * Get the URL for uploads (can be customized based on environment)
   */
  private static getUploadUrl() {
    return process.env.STORAGE_UPLOAD_URL || '/api/upload/cloudinary';
  }
} 