'use client';

import React, { useState } from 'react';
import { ImageCard } from './ImageCard';
import { BatchPrivacyControl } from '@/components/image/BatchPrivacyControl';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Square, X } from 'lucide-react';

interface SelectableImageGridProps {
  images: any[];
  layout?: 'grid' | 'masonry';
  className?: string;
}

export function SelectableImageGrid({ 
  images, 
  layout = 'grid',
  className = '' 
}: SelectableImageGridProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    // Clear selections when exiting select mode
    if (isSelectMode) {
      setSelectedImages([]);
    }
  };

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Select all images
  const selectAll = () => {
    setSelectedImages(images.map(img => img.id));
  };

  // Deselect all images
  const deselectAll = () => {
    setSelectedImages([]);
  };

  // Handle privacy changes
  const handlePrivacyChange = () => {
    // In a real app, we would refresh the image list here
    // For now, just reset selection
    setSelectedImages([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSelectMode}
          className="flex items-center"
        >
          {isSelectMode ? (
            <>
              <X className="mr-2 h-4 w-4" />
              <span>Cancel Selection</span>
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Select Images</span>
            </>
          )}
        </Button>
        
        {isSelectMode && (
          <div className="flex items-center space-x-2">
            {selectedImages.length > 0 && (
              <BatchPrivacyControl 
                selectedImages={selectedImages}
                onPrivacyChange={handlePrivacyChange}
              />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="text-xs"
            >
              Select All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="text-xs"
              disabled={selectedImages.length === 0}
            >
              Deselect All
            </Button>
          </div>
        )}
      </div>
      
      {/* Image Grid */}
      <div className={layout === 'grid' ? 'grid-gallery' : 'masonry-gallery'}>
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                {isSelectMode && (
                  <div 
                    className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-gray-900/80 rounded p-0.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleImageSelection(image.id);
                    }}
                  >
                    <Checkbox 
                      checked={selectedImages.includes(image.id)} 
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      className="h-5 w-5"
                    />
                  </div>
                )}
                <ImageCard 
                  image={image} 
                  className={selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((image) => (
              <div key={image.id} className="relative group break-inside-avoid">
                {isSelectMode && (
                  <div 
                    className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-gray-900/80 rounded p-0.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleImageSelection(image.id);
                    }}
                  >
                    <Checkbox 
                      checked={selectedImages.includes(image.id)} 
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      className="h-5 w-5"
                    />
                  </div>
                )}
                <ImageCard 
                  image={image} 
                  className={selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No images to display.
          </p>
        </div>
      )}
    </div>
  );
} 