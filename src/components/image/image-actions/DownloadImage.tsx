
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { ImageItem } from '@/api/images';

interface DownloadImageProps {
  image: ImageItem;
  isPrivateAndNotAuthenticated: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | 
    "ghost" | "link" | "primary" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  showIcon?: boolean;
  showText?: boolean;
}

const DownloadImage = ({ 
  image, 
  isPrivateAndNotAuthenticated,
  className = '',
  variant = "ghost",
  size = "icon",
  showIcon = true,
  showText = false
}: DownloadImageProps) => {
  
  const handleDownload = () => {
    if (isPrivateAndNotAuthenticated) {
      toast.error("You need to log in to download private images");
      return;
    }
    
    try {
      // Create an anchor element and set its attributes for downloading
      const link = document.createElement('a');
      
      // Set download attribute to force download rather than navigation
      link.href = image.url;
      
      // Get filename from URL or use title as fallback
      const urlParts = image.url.split('/');
      const filename = urlParts[urlParts.length - 1] || `${image.title || 'image'}.jpg`;
      
      link.download = filename;
      
      // Append to document, trigger click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image");
    }
  };

  return (
    <Button 
      size={size} 
      variant={variant} 
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        handleDownload();
      }}
      title="Download"
      disabled={isPrivateAndNotAuthenticated}
    >
      {showIcon && <Download className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
      {showText && 'Download'}
    </Button>
  );
};

export default DownloadImage;
