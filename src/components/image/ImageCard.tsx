
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageItem } from '@/api/images';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ShareImage from './image-sharing/ShareImage';
import DownloadImage from './image-actions/DownloadImage';
import DeleteImage from './image-actions/DeleteImage';

interface ImageCardProps {
  image: ImageItem;
  onDelete?: () => void;
}

const ImageCard = ({ image, onDelete }: ImageCardProps) => {
  const { isAuthenticated } = useAuth();
  const [showFullImage, setShowFullImage] = useState(false);
  
  const isPrivateAndNotAuthenticated = !isAuthenticated && !image.isPublic;

  const handleViewImage = () => {
    if (isPrivateAndNotAuthenticated) {
      toast.error("You need to log in to view private images");
      return;
    }
    setShowFullImage(true);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg glass-card animate-scale-in">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={image.url}
            alt={image.title}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              isPrivateAndNotAuthenticated ? 'blur-md' : ''
            }`}
          />
          
          {isPrivateAndNotAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 text-white px-4 py-2 rounded-md text-center">
                <Eye className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm">Login to view</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 w-full p-3">
            <div className="flex justify-between items-end">
              <div className="max-w-[70%]">
                <h3 className="text-white font-medium truncate">{image.title || 'Untitled'}</h3>
                <p className="text-white/70 text-xs">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-white/80 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewImage();
                  }}
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <DownloadImage 
                  image={image}
                  isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
                  className="h-8 w-8 text-white/80 hover:text-white"
                />
                
                <ShareImage 
                  image={image}
                  isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
                  className="h-8 w-8 text-white/80 hover:text-white"
                />
                
                {/* Only show delete button if user is the owner */}
                {image.isOwner && (
                  <DeleteImage 
                    image={image} 
                    onDelete={onDelete}
                    className="h-8 w-8 text-white/80 hover:text-white hover:text-destructive"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Visibility Badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full ${image.isPublic ? 'bg-primary/90' : 'bg-secondary/90'}`}>
            {image.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {/* Full image dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl glass-modal">
          <DialogHeader>
            <DialogTitle>{image.title || 'Untitled'}</DialogTitle>
            {image.description && (
              <DialogDescription>{image.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex justify-center items-center">
            <img 
              src={image.url} 
              alt={image.title} 
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4 sm:justify-end">
            <Button variant="outline" onClick={() => setShowFullImage(false)}>
              Close
            </Button>
            
            <ShareImage 
              image={image}
              isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
              variant="default"
              size="default"
              showIcon={true}
              showText={true}
            />
            
            <DownloadImage 
              image={image}
              isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
              variant="default"
              size="default"
              showIcon={true}
              showText={true}
            />
            
            {image.isOwner && (
              <DeleteImage 
                image={image}
                onDelete={onDelete}
                variant="destructive"
                size="default"
                showIcon={true}
                showText={true}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCard;
