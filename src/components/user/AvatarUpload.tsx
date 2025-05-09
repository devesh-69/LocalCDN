'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { toast } from 'react-hot-toast';

interface AvatarUploadProps {
  currentImageUrl?: string;
  onAvatarUpdate: (imageUrl: string) => void;
  editable?: boolean;
}

export function AvatarUpload({ 
  currentImageUrl, 
  onAvatarUpdate,
  editable = false
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get initials for avatar fallback
  const getInitials = () => {
    // Use session or current image URL to extract initials
    return 'U';
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file
    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload avatar
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }
      
      const data = await response.json();
      
      // Call the onAvatarUpdate callback with the new URL
      onAvatarUpdate(data.avatarUrl);
      
      toast.success('Avatar updated successfully');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to upload avatar');
      }
    } finally {
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block">
        <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
          {currentImageUrl ? (
            <AvatarImage src={currentImageUrl} alt="User avatar" />
          ) : null}
          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {editable && (
          <div className="absolute -bottom-2 -right-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-8 h-8 p-0 shadow-md"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
          </div>
        )}
      </div>
      
      {editable && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Click the camera icon to change your avatar
        </p>
      )}
    </div>
  );
} 