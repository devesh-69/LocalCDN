'use client';

import React from 'react';
import { ImageCard } from './ImageCard';
import { memo } from 'react';

// Use React.memo to prevent unnecessary re-renders
const MemoizedImageCard = memo(ImageCard);

interface ImageMasonryGridProps {
  images: any[];
}

export function ImageMasonryGrid({ images }: ImageMasonryGridProps) {
  // Create column arrays for masonry layout
  const columns = [
    images.filter((_, i) => i % 4 === 0), // First column
    images.filter((_, i) => i % 4 === 1), // Second column
    images.filter((_, i) => i % 4 === 2), // Third column
    images.filter((_, i) => i % 4 === 3), // Fourth column
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {columns.map((column, colIndex) => (
        <div key={`column-${colIndex}`} className="flex flex-col gap-4">
          {column.map((image) => (
            <MemoizedImageCard key={image.id} image={image} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Named export for dynamic import
export { ImageMasonryGrid as default }; 