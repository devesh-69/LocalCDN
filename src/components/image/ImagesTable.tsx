
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Download, Trash, Share, Lock } from 'lucide-react';
import { ImageItem } from '@/api/images';
import { toast } from 'sonner';
import { deleteImage } from '@/api/images';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface ImagesTableProps {
  images: ImageItem[];
  loading: boolean;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

const ImagesTable = ({ images, loading, onFilterChange, currentFilter }: ImagesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAuthenticated } = useAuth();

  const filteredImages = searchTerm 
    ? images.filter(image => 
        image.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        image.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  const handleDownload = (image: ImageItem) => {
    if (!isAuthenticated && !image.isPublic) {
      toast.error("You need to log in to download private images");
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = image.url;
      const urlParts = image.url.split('/');
      const filename = urlParts[urlParts.length - 1] || `${image.title || 'image'}.jpg`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (image: ImageItem) => {
    if (!isAuthenticated && !image.isPublic) {
      toast.error("You need to log in to share private images");
      return;
    }
    
    try {
      let shareUrl = image.url;
      if (!shareUrl.startsWith('http')) {
        shareUrl = `https://${shareUrl}`;
      }
      shareUrl = shareUrl.replace(/\/+$/, '');
      
      if (navigator.share) {
        await navigator.share({
          title: image.title || 'Shared Image',
          text: image.description || 'Check out this image from localCDN!',
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Image URL copied to clipboard");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Failed to share image");
    }
  };

  const confirmDelete = (image: ImageItem) => {
    setSelectedImage(image);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (isDeleting || !selectedImage) return;
    
    try {
      setIsDeleting(true);
      await deleteImage(selectedImage.id);
      toast.success("Image deleted successfully");
      setShowDeleteConfirm(false);
      // Refresh the images list
      onFilterChange(currentFilter);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.message || "Failed to delete the image");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Images Table</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            placeholder="Search images..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Tabs defaultValue={currentFilter} value={currentFilter} onValueChange={onFilterChange} className="w-auto">
            <TabsList className="glass-effect">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">
                <Eye className="h-4 w-4 mr-1" /> Public
              </TabsTrigger>
              <TabsTrigger value="private">
                <EyeOff className="h-4 w-4 mr-1" /> Private
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="text-sm text-muted-foreground flex items-center space-x-1 mb-2">
          <Lock className="h-3 w-3" />
          <span>Private images require login to view, download or share</span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredImages.length > 0 ? (
              filteredImages.map((image) => {
                const isPrivateAndNotAuthenticated = !isAuthenticated && !image.isPublic;
                
                return (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden relative">
                        <img 
                          src={image.url} 
                          alt={image.title} 
                          className={`h-full w-full object-cover ${isPrivateAndNotAuthenticated ? 'blur-md' : ''}`}
                        />
                        {isPrivateAndNotAuthenticated && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Lock className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{image.title || 'Untitled'}</div>
                      {image.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{image.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {image.isPublic ? (
                          <div className="flex items-center text-green-500">
                            <Eye className="h-4 w-4 mr-1" /> Public
                          </div>
                        ) : (
                          <div className="flex items-center text-blue-500">
                            <EyeOff className="h-4 w-4 mr-1" /> Private
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDownload(image)}
                          title="Download"
                          disabled={isPrivateAndNotAuthenticated}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleShare(image)}
                          title="Share"
                          disabled={isPrivateAndNotAuthenticated}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        {image.isOwner && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => confirmDelete(image)}
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="text-4xl mb-2">🖼️</div>
                    <h3 className="text-lg font-medium">No images found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm 
                        ? "No images match your search criteria"
                        : currentFilter !== 'all'
                          ? `You don't have any ${currentFilter} images yet`
                          : "Your gallery is empty. Upload some images to get started!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
};

export default ImagesTable;
