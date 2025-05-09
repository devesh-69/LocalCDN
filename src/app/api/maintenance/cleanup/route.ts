import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StorageService } from '@/services/StorageService';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * GET /api/maintenance/cleanup
 * Scheduled maintenance task to clean up unused resources
 * This endpoint is called by Vercel cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify request source to prevent unauthorized access
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    const authHeader = request.headers.get('authorization');
    const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // Verify this is either a Vercel cron job or an authorized admin request
    if (!isVercelCron && !isAuthorized) {
      // Check if user is admin
      const session = await getServerSession(authOptions);
      if (!session?.user?.isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    await connectDB();
    
    // Initialize cleanup summary
    const summary = {
      orphanedMetadata: 0,
      unusedTags: 0,
      emptyCollections: 0,
      temporaryFiles: 0,
      cloudinaryOrphans: 0,
      totalSizeReclaimed: 0,
    };
    
    // 1. Clean up metadata for deleted images
    const metadataCleanupResult = await cleanupOrphanedMetadata();
    summary.orphanedMetadata = metadataCleanupResult.deleted;
    
    // 2. Clean up unused tags
    const tagsCleanupResult = await cleanupUnusedTags();
    summary.unusedTags = tagsCleanupResult.deleted;
    
    // 3. Clean up empty collections
    const collectionsCleanupResult = await cleanupEmptyCollections();
    summary.emptyCollections = collectionsCleanupResult.deleted;
    
    // 4. Clean up temporary files (over 24h old)
    const tempFilesCleanupResult = await cleanupTemporaryFiles();
    summary.temporaryFiles = tempFilesCleanupResult.deleted;
    summary.totalSizeReclaimed += tempFilesCleanupResult.sizeReclaimed || 0;
    
    // 5. Clean up orphaned Cloudinary resources (if enabled)
    if (process.env.ENABLE_CLOUDINARY_CLEANUP === 'true') {
      const cloudinaryCleanupResult = await cleanupCloudinaryOrphans();
      summary.cloudinaryOrphans = cloudinaryCleanupResult.deleted;
      summary.totalSizeReclaimed += cloudinaryCleanupResult.sizeReclaimed || 0;
    }
    
    // Return cleanup summary
    return NextResponse.json({
      success: true,
      message: 'Maintenance tasks completed successfully',
      summary,
    });
  } catch (error) {
    console.error('Error during maintenance cleanup:', error);
    
    return NextResponse.json(
      { error: 'Failed to run maintenance tasks' },
      { status: 500 }
    );
  }
}

/**
 * Clean up metadata for images that no longer exist
 */
async function cleanupOrphanedMetadata() {
  // TODO: Implement metadata cleanup logic based on your data model
  return { deleted: 0 };
}

/**
 * Clean up tags that are no longer associated with any images
 */
async function cleanupUnusedTags() {
  // TODO: Implement unused tags cleanup logic
  return { deleted: 0 };
}

/**
 * Clean up empty collections
 */
async function cleanupEmptyCollections() {
  // TODO: Implement empty collections cleanup
  return { deleted: 0 };
}

/**
 * Clean up temporary files older than 24 hours
 */
async function cleanupTemporaryFiles() {
  // Find temporary files older than 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  // Use your storage service to find and delete old temporary files
  const tempFiles = await StorageService.findTemporaryFiles(oneDayAgo);
  let sizeReclaimed = 0;
  
  for (const file of tempFiles) {
    await StorageService.deleteFile(file.id);
    sizeReclaimed += file.size || 0;
  }
  
  return { 
    deleted: tempFiles.length,
    sizeReclaimed
  };
}

/**
 * Clean up orphaned Cloudinary resources
 * (resources that are in Cloudinary but not in the database)
 */
async function cleanupCloudinaryOrphans() {
  // Get all image URLs from the database
  const dbImages = await StorageService.getAllImagePublicIds();
  const dbPublicIds = new Set(dbImages.map(img => extractPublicIdFromUrl(img.url)));
  
  // Get resources from Cloudinary
  const { resources } = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'localcdn/', // Use your folder prefix
    max_results: 500
  });
  
  let deleted = 0;
  let sizeReclaimed = 0;
  
  // Find and delete orphaned resources
  for (const resource of resources) {
    if (!dbPublicIds.has(resource.public_id)) {
      try {
        await cloudinary.uploader.destroy(resource.public_id);
        deleted++;
        sizeReclaimed += resource.bytes || 0;
      } catch (error) {
        console.error(`Failed to delete orphaned resource ${resource.public_id}:`, error);
      }
    }
  }
  
  return {
    deleted,
    sizeReclaimed
  };
}

/**
 * Extract the public ID from a Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string {
  // Sample URL: https://res.cloudinary.com/demo/image/upload/v1234567890/localcdn/abc123def456.jpg
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return matches ? matches[1] : '';
} 