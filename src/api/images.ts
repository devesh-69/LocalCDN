
import { Image, ImageStats } from '@/types/mongodb';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface ImageResponse {
  images: ImageData[];
  stats: ImageStats;
}

export interface ImageData {
  id: string;
  url: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
}

export async function fetchImages(filter: string = 'all'): Promise<ImageResponse> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // In a real app, we would get the userId from the session
    // For now, let's use a mock userId
    const mockUserId = new ObjectId('60d0fe4f5311236168a109ca');
    
    // Build query based on filter
    const query: any = { userId: mockUserId };
    if (filter === 'public') query.isPublic = true;
    if (filter === 'private') query.isPublic = false;
    
    // Get images
    const images = await db
      .collection('images')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
      
    // Transform MongoDB documents to the format expected by the frontend
    const transformedImages: ImageData[] = images.map(img => ({
      id: img._id.toString(),
      url: img.url,
      title: img.title,
      isPublic: img.isPublic,
      createdAt: img.createdAt.toISOString()
    }));
    
    // Get image stats
    const stats: ImageStats = {
      totalImages: await db.collection('images').countDocuments({ userId: mockUserId }),
      publicImages: await db.collection('images').countDocuments({ userId: mockUserId, isPublic: true }),
      privateImages: await db.collection('images').countDocuments({ userId: mockUserId, isPublic: false }),
    };
    
    return { images: transformedImages, stats };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw new Error('Failed to fetch images');
  }
}
