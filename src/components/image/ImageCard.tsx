
import React from 'react';
import { Eye, Download, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageItem } from '@/api/images';
import { useToast } from '@/hooks/use-toast';
import { deleteImage } from '@/api/images';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface ImageCardProps {
  image: ImageItem;
  onDelete?: () => void;
}

const ImageCard = ({ image, onDelete }: ImageCardProps) => {
  const { toast } = useToast();
  const [showFullImage, setShowFullImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewImage = () => {
    setShowFullImage(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your image download has started."
    });
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteImage(image.id);
      
      toast({
        title: "Image Deleted",
        description: "The image has been successfully deleted."
      });
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg glass-card animate-scale-in">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={image.url}
            alt={image.title}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 w-full p-3">
            <div className="flex justify-between items-end">
              <div>
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
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-white/80 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-white/80 hover:text-white hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4" />
                </Button>
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
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowFullImage(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCard;
