'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/DropdownMenu';
import { Eye, EyeOff, Lock, Unlock, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BatchPrivacyControlProps {
  selectedImages: string[];
  onPrivacyChange: () => void;
  className?: string;
}

export function BatchPrivacyControl({ 
  selectedImages, 
  onPrivacyChange,
  className = '' 
}: BatchPrivacyControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Update privacy for all selected images
  const updatePrivacy = async (isPublic: boolean) => {
    if (selectedImages.length === 0) {
      toast.error('No images selected');
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/images/batch-privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageIds: selectedImages,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update privacy settings');
      }

      toast.success(`${selectedImages.length} images updated to ${isPublic ? 'public' : 'private'}`);
      onPrivacyChange(); // Refresh the image list or update UI
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update privacy settings');
    } finally {
      setIsUpdating(false);
    }
  };

  // Make selected images public
  const makePublic = () => updatePrivacy(true);

  // Make selected images private
  const makePrivate = () => updatePrivacy(false);

  return (
    <div className={`${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={selectedImages.length === 0 || isUpdating}>
          <Button variant="outline" className="flex items-center">
            {isUpdating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                <span>Privacy</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={makePublic} className="flex items-center cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>Make Public</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={makePrivate} className="flex items-center cursor-pointer">
            <EyeOff className="mr-2 h-4 w-4" />
            <span>Make Private</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedImages.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
} 