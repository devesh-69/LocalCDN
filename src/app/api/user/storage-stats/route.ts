import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ImageService } from '@/services/ImageService';
import { UserService } from '@/services/UserService';

// Define a reasonable storage limit for users (in bytes)
// 2GB for the demo app
const USER_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024;

/**
 * GET /api/user/storage-stats
 * Returns detailed storage statistics for the currently logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get user's images
    const images = await ImageService.getUserImages(userId);
    
    // Calculate total storage used
    const totalSize = images.reduce((total, img) => total + (img.size || 0), 0);
    
    // Get file type breakdown
    const fileTypeMap = new Map<string, { count: number; size: number }>();
    
    images.forEach(img => {
      const type = img.mimeType?.split('/')?.[1] || 'unknown';
      const size = img.size || 0;
      
      if (!fileTypeMap.has(type)) {
        fileTypeMap.set(type, { count: 0, size: 0 });
      }
      
      const current = fileTypeMap.get(type)!;
      fileTypeMap.set(type, {
        count: current.count + 1,
        size: current.size + size
      });
    });
    
    // Convert map to array and sort by size (descending)
    const fileTypes = Array.from(fileTypeMap.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        size: stats.size
      }))
      .sort((a, b) => b.size - a.size);
    
    // Get recent uploads (last 5)
    const recentUploads = images
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(img => ({
        id: img._id.toString(),
        name: img.originalFilename || 'unnamed',
        size: img.size || 0,
        type: img.mimeType?.split('/')?.[1] || 'unknown',
        uploadDate: img.createdAt.toISOString()
      }));
    
    // Return statistics
    return NextResponse.json({
      totalUsed: totalSize,
      totalLimit: USER_STORAGE_LIMIT,
      fileTypes,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching storage statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage statistics' },
      { status: 500 }
    );
  }
} 