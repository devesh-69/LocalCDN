import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StorageService } from '@/services/StorageService';

/**
 * GET /api/images
 * Get a list of images with pagination, filtering, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    // Build query based on filters
    const query: Record<string, any> = {};
    
    if (filter === 'public') {
      query.isPublic = true;
    } else if (filter === 'private' && userId) {
      query.isPublic = false;
      query.owner = userId;
    } else if (filter !== 'all' && userId) {
      // Special filters like 'recent', 'photos', etc.
      if (filter === 'recent') {
        // Recent uploads by the user
        query.owner = userId;
      } else if (filter === 'photos') {
        // Photos (common image formats)
        query.$or = [
          { format: 'jpg' },
          { format: 'jpeg' },
          { format: 'png' },
          { format: 'gif' },
          { format: 'webp' }
        ];
      } else if (filter === 'vectors') {
        // Vector images
        query.$or = [
          { format: 'svg' },
          { format: 'ai' },
          { format: 'eps' }
        ];
      }
    }
    
    // If user is logged in, show both their private images and public images
    // If not logged in, only show public images
    if (userId) {
      if (!query.$or) {
        query.$or = [
          { owner: userId },
          { isPublic: true }
        ];
      }
    } else {
      // No user, only public images
      query.isPublic = true;
    }
    
    // Build sort options
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'a-z') {
      sortOption = { title: 1 };
    } else if (sort === 'z-a') {
      sortOption = { title: -1 };
    } else if (sort === 'largest') {
      sortOption = { size: -1 };
    } else if (sort === 'smallest') {
      sortOption = { size: 1 };
    }
    
    // Get images from database
    const images = await StorageService.getImages(query, {
      limit,
      skip,
      sort: sortOption
    });
    
    // Get total count for pagination
    const totalCount = await StorageService.countImages(query);
    
    // Format response
    const formattedImages = images.map(image => ({
      id: image._id.toString(),
      title: image.title,
      description: image.description,
      url: image.url,
      width: image.width,
      height: image.height,
      format: image.format,
      size: image.size,
      tags: image.tags,
      isPublic: image.isPublic,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      metadata: {
        // Include a subset of metadata for gallery view
        ...image.metadata?.exif ? { 
          camera: image.metadata.exif.camera,
          captureDate: image.metadata.exif.captureDate,
        } : {},
      },
    }));
    
    return NextResponse.json({
      images: formattedImages,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + images.length < totalCount,
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 