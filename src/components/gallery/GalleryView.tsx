'use client';

import React, { useState, useCallback, memo, Suspense } from 'react';
import { useGallerySettings, GalleryLayout } from '@/hooks/useGallerySettings';
import { ImageCard } from './ImageCard';
import { Grid2X2, LayoutGrid, ArrowDown, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { imagePresets } from '@/lib/cloudinary/optimizations';

// Use React.memo to prevent unnecessary re-renders
const MemoizedImageCard = memo(ImageCard);

// Lazy-load ImageMasonryGrid for better initial load performance
const ImageMasonryGrid = dynamic(() => import('./ImageMasonryGrid').then(mod => mod.ImageMasonryGrid), {
  loading: () => <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>,
  ssr: false // Disable SSR for this component to reduce server load
});

interface GalleryViewProps {
  images: any[];
  className?: string;
}

export function GalleryView({ images, className = '' }: GalleryViewProps) {
  const { layout, setLayout } = useGallerySettings();
  const [sortBy, setSortBy] = useState('newest');
  const [displayCount, setDisplayCount] = useState(24);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Sort images based on the selected sort option
  const sortedImages = useCallback(() => {
    return [...images].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'a-z') {
        return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
      } else if (sortBy === 'z-a') {
        return (b.title || 'Untitled').localeCompare(a.title || 'Untitled');
      } else if (sortBy === 'largest') {
        return (b.size || 0) - (a.size || 0);
      } else { // smallest
        return (a.size || 0) - (b.size || 0);
      }
    }).slice(0, displayCount);
  }, [images, sortBy, displayCount]);
  
  // Optimize images for gallery view
  const optimizedImages = sortedImages().map(image => ({
    ...image,
    url: imagePresets.galleryItem(image.url)
  }));

  const toggleLayout = () => {
    setLayout(layout === 'grid' ? 'masonry' : 'grid');
  };
  
  const loadMore = () => {
    setDisplayCount(prev => prev + 24);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'a-z', label: 'A to Z' },
    { value: 'z-a', label: 'Z to A' },
    { value: 'largest', label: 'Largest' },
    { value: 'smallest', label: 'Smallest' }
  ];

  return (
    <div className={className}>
      <div className="glass glass-border p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-3">
          <button
            className={`p-2 rounded-md transition-all duration-300 ${layout === 'grid' ? 'bg-primary text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
            onClick={() => setLayout('grid')}
            aria-label="Grid layout"
            title="Grid layout"
          >
            <Grid2X2 className="h-5 w-5" />
          </button>
          
          <button
            className={`p-2 rounded-md transition-all duration-300 ${layout === 'masonry' ? 'bg-primary text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
            onClick={() => setLayout('masonry')}
            aria-label="Masonry layout"
            title="Masonry layout"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="glass flex items-center space-x-2 py-2 px-4 rounded-md"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
            <ArrowDown className="h-4 w-4" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 glass p-2 rounded-md z-10 shadow-glass animate-fade-in">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`w-full text-left px-4 py-2 rounded-md ${sortBy === option.value ? 'bg-primary text-white' : 'hover:bg-white hover:bg-opacity-20'}`}
                  onClick={() => {
                    setSortBy(option.value);
                    setDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Show appropriate grid layout with lazy loading */}
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        {layout === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-stagger">
            {optimizedImages.map(image => (
              <div key={image.id} className="gallery-item">
                <MemoizedImageCard image={image} />
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-stagger">
            <ImageMasonryGrid images={optimizedImages} />
          </div>
        )}
      </Suspense>
      
      {/* Load more button */}
      {displayCount < images.length && (
        <div className="flex justify-center mt-12">
          <button onClick={loadMore} className="glass glass-border flex items-center gap-2 py-3 px-6 rounded-full hover:bg-white hover:bg-opacity-30 transition-all duration-300">
            <RefreshCw className="h-5 w-5" />
            <span>Load More Images</span>
          </button>
        </div>
      )}
    </div>
  );
} 