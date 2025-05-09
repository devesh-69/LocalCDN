'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Tag } from 'lucide-react';

interface ImageItem {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface ImageGridProps {
  images: ImageItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Component for displaying images in a grid layout
 */
const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  columns = 3,
}) => {
  const getGridColumns = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };
  
  // If there are no images, render a message
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No images to display
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid ${getGridColumns()} gap-4`}>
      {images.map((image) => (
        <Link 
          key={image.id} 
          href={`/image/${image.id}`}
          className="group"
        >
          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 aspect-square bg-gray-100 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
            {/* Image */}
            <Image
              src={image.url}
              alt={image.title || 'Image'}
              width={300}
              height={300}
              className="object-cover h-full w-full transition-transform group-hover:scale-105"
            />
            
            {/* Overlay with metadata */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <h3 className="text-white font-medium truncate">
                {image.title || 'Untitled'}
              </h3>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {image.metadata?.camera && (
                  <span className="inline-flex items-center text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                    <Camera className="h-3 w-3 mr-1" />
                    {image.metadata.camera}
                  </span>
                )}
                
                {image.tags && image.tags.length > 0 && (
                  <span className="inline-flex items-center text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                    <Tag className="h-3 w-3 mr-1" />
                    {image.tags.length} tags
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ImageGrid; 