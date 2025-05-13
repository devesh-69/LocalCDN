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

// This is now just a type definition file for the image data structure
// The actual functionality has been moved to mockData.ts for browser compatibility
