import { connectDB } from '@/lib/db';
import User, { IUser } from '@/models/User';
import { StorageService } from '@/services/StorageService';
import { cache, cacheKeys } from '@/lib/cache';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

/**
 * Service for user-related operations
 */
export class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string, includeStats = false) {
    try {
      await connectDB();
      
      // Check the cache first
      const cacheKey = cacheKeys.user(userId) + `:profile:${includeStats}`;
      const cachedProfile = cache.get(cacheKey);
      
      if (cachedProfile) {
        return cachedProfile;
      }
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Prepare the response
      const profile = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        preferences: user.preferences || {
          theme: 'system',
          defaultPrivacy: 'private',
          galleryView: 'grid',
          itemsPerPage: 12,
          autoMetadataStrip: false,
        },
        createdAt: user.createdAt,
      };
      
      // Include stats if requested
      if (includeStats) {
        // Get image count and storage usage
        const [imagesCount, storageUsed] = await Promise.all([
          this.getUserImagesCount(userId),
          this.getUserStorageUsage(userId)
        ]);
        
        Object.assign(profile, {
          stats: {
            imagesCount,
            storageUsed
          }
        });
      }
      
      // Cache the result for 5 minutes
      cache.set(cacheKey, profile, 5 * 60 * 1000);
      
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: {
      name?: string;
      bio?: string;
      location?: string;
      website?: string;
      image?: string;
    }
  ) {
    try {
      await connectDB();
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update allowed fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.bio !== undefined) user.bio = updateData.bio;
      if (updateData.location !== undefined) user.location = updateData.location;
      if (updateData.website !== undefined) user.website = updateData.website;
      if (updateData.image) user.image = updateData.image;
      
      // Save the updated user
      await user.save();
      
      // Invalidate cache
      cache.delete(`${cacheKeys.user(userId)}:profile:true`);
      cache.delete(`${cacheKeys.user(userId)}:profile:false`);
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: {
      theme?: 'light' | 'dark' | 'system';
      defaultPrivacy?: 'public' | 'private';
      galleryView?: 'grid' | 'masonry';
      itemsPerPage?: number;
      autoMetadataStrip?: boolean;
    }
  ) {
    try {
      await connectDB();
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Ensure preferences object exists
      if (!user.preferences) {
        user.preferences = {};
      }
      
      // Update preferences
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.defaultPrivacy) user.preferences.defaultPrivacy = preferences.defaultPrivacy;
      if (preferences.galleryView) user.preferences.galleryView = preferences.galleryView;
      if (preferences.itemsPerPage) user.preferences.itemsPerPage = preferences.itemsPerPage;
      if (preferences.autoMetadataStrip !== undefined) user.preferences.autoMetadataStrip = preferences.autoMetadataStrip;
      
      // Save the updated user
      await user.save();
      
      // Invalidate cache
      cache.delete(`${cacheKeys.user(userId)}:profile:true`);
      cache.delete(`${cacheKeys.user(userId)}:profile:false`);
      
      return user.preferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      await connectDB();
      
      // Find the user with password
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Import bcrypt dynamically (server-side only)
      const bcrypt = (await import('bcryptjs')).default;
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      // Save the updated user
      await user.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
  /**
   * Invalidate all sessions for a user except the current one
   * This logs the user out from all other devices
   */
  static async invalidateAllSessions(userId: string) {
    try {
      await connectDB();
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update session version on the user model
      // This will cause the JWT middleware to reject all existing sessions
      // when the sessionVersion in the JWT doesn't match this value
      user.sessionVersion = (user.sessionVersion || 0) + 1;
      await user.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error invalidating sessions:', error);
      throw error;
    }
  }
  
  /**
   * Get user images count
   */
  static async getUserImagesCount(userId: string): Promise<number> {
    try {
      await connectDB();
      
      // Import Image model dynamically to avoid circular dependencies
      const Image = (await import('@/models/Image')).default;
      
      // Count user's images
      return await Image.countDocuments({ owner: userId });
    } catch (error) {
      console.error('Error getting user images count:', error);
      return 0;
    }
  }
  
  /**
   * Get user storage usage in bytes
   */
  static async getUserStorageUsage(userId: string): Promise<number> {
    try {
      await connectDB();
      
      // Import Image model dynamically to avoid circular dependencies
      const Image = (await import('@/models/Image')).default;
      
      // Aggregate to sum the sizes of all user's images
      const result = await Image.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]);
      
      return result.length > 0 ? result[0].totalSize : 0;
    } catch (error) {
      console.error('Error getting user storage usage:', error);
      return 0;
    }
  }
} 