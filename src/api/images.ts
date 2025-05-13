
import { ImageStats } from '@/types/mongodb';

export interface ImageResponse {
  images: ImageItem[];
  stats: ImageStats;
}

export interface ImageItem {
  id: string;
  url: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
}

// Mock function to fetch images - this simulates an API call
export const fetchImages = async (filter: string = 'all'): Promise<ImageResponse> => {
  // Import the mock data dynamically to avoid SSR issues
  const { getMockImages } = await import('@/lib/mockData');
  return getMockImages(filter);
};
