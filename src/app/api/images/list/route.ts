import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StorageService } from '@/services/StorageService';

/**
 * GET /api/images/list
 * Get a list of images for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get images from database
    const query = { owner: userId };
    const sortOption = { createdAt: -1 }; // newest first
    
    const images = await StorageService.getImages(query, {
      limit,
      skip,
      sort: sortOption
    });
    
    // Format response
    const formattedImages = images.map(image => ({
      id: image._id.toString(),
      title: image.title || 'Untitled',
      description: image.description || '',
      url: image.url,
      width: image.width || 0,
      height: image.height || 0,
      format: image.format || 'unknown',
      size: image.size || 0,
      tags: image.tags || [],
      isPublic: image.isPublic || false,
      createdAt: image.createdAt || new Date(),
      uploadDate: image.createdAt || new Date(),
      metadata: image.metadata || {},
    }));
    
    return NextResponse.json({
      images: formattedImages
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 