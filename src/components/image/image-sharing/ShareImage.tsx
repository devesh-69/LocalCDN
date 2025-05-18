
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { toast } from 'sonner';
import { formatShareableUrl } from '@/utils/urlUtils';
import { ImageItem } from '@/api/images';

interface ShareImageProps {
  image: ImageItem;
  isPrivateAndNotAuthenticated: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | 
    "ghost" | "link" | "primary" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  showIcon?: boolean;
  showText?: boolean;
}

const ShareImage = ({ 
  image, 
  isPrivateAndNotAuthenticated, 
  className = '',
  variant = "ghost",
  size = "icon",
  showIcon = true,
  showText = false
}: ShareImageProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleShare = async () => {
    if (isPrivateAndNotAuthenticated) {
      toast.error("You need to log in to share private images");
      return;
    }
    
    try {
      setIsCopying(true);
      
      // Format the URL for sharing
      const shareableUrl = formatShareableUrl(image.url);
      
      if (navigator.share && navigator.canShare) {
        // Try native sharing if available and can share URL
        const shareData = {
          title: image.title || 'Shared Image',
          text: image.description || 'Check out this image from localCDN!',
          url: shareableUrl
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success("Shared successfully!");
          return;
        }
      }
      
      // Fallback to clipboard copy
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Image URL copied to clipboard");
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(`Failed to share image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button 
      size={size} 
      variant={variant} 
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      title="Share"
      disabled={isCopying || isPrivateAndNotAuthenticated}
    >
      {showIcon && <Share className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
      {showText && (isCopying ? 'Copying...' : 'Share')}
    </Button>
  );
};

export default ShareImage;
