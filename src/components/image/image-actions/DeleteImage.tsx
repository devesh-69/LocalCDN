
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteImage } from '@/api/images';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageItem } from '@/api/images';

interface DeleteImageProps {
  image: ImageItem;
  onDelete?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | 
    "ghost" | "link" | "primary" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  showIcon?: boolean;
  showText?: boolean;
}

const DeleteImage = ({ 
  image, 
  onDelete,
  className = '',
  variant = "ghost",
  size = "icon",
  showIcon = true,
  showText = false
}: DeleteImageProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
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
      
      setShowDeleteConfirm(false);
      
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        size={size} 
        variant={variant} 
        className={`hover:text-destructive ${className}`}
        onClick={confirmDelete}
        disabled={isDeleting}
        title="Delete"
      >
        {showIcon && <Trash className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
        {showText && (isDeleting ? 'Deleting...' : 'Delete')}
      </Button>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteImage;
