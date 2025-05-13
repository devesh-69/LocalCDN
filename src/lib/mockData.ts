
import { ImageStats } from '@/types/mongodb';
import { ImageItem, ImageResponse } from '@/api/images';

// Sample mock data for images
const mockImages: ImageItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    title: 'Cute Cat',
    isPublic: true,
    createdAt: new Date(2023, 5, 15).toISOString()
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783',
    title: 'Mountain Landscape',
    isPublic: true,
    createdAt: new Date(2023, 4, 10).toISOString()
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50',
    title: 'Private Document',
    isPublic: false,
    createdAt: new Date(2023, 3, 5).toISOString()
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1534239143101-1b1c627395c5',
    title: 'Secret Photo',
    isPublic: false,
    createdAt: new Date(2023, 2, 20).toISOString()
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a',
    title: 'Sunset View',
    isPublic: true,
    createdAt: new Date(2023, 1, 12).toISOString()
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e',
    title: 'Dog Portrait',
    isPublic: true,
    createdAt: new Date(2023, 0, 5).toISOString()
  }
];

// Get stats from mock data
const getMockStats = (): ImageStats => {
  const publicImages = mockImages.filter(img => img.isPublic).length;
  const privateImages = mockImages.filter(img => !img.isPublic).length;
  
  return {
    totalImages: mockImages.length,
    publicImages,
    privateImages
  };
};

// Get filtered mock images
export const getMockImages = (filter: string = 'all'): ImageResponse => {
  let filteredImages = [...mockImages];
  
  if (filter === 'public') {
    filteredImages = mockImages.filter(img => img.isPublic);
  } else if (filter === 'private') {
    filteredImages = mockImages.filter(img => !img.isPublic);
  }
  
  // Sort by createdAt (newest first)
  filteredImages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return {
    images: filteredImages,
    stats: getMockStats()
  };
};
