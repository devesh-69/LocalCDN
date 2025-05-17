
import React, { useState, useEffect } from 'react';
import ImageCard from './ImageCard';
import ImageGalleryPagination from './ImageGalleryPagination';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Upload, UserIcon } from 'lucide-react';
import { ImageStats } from '@/types/mongodb';
import { fetchImages, ImageItem } from '@/api/images';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Number of images to display per page
const IMAGES_PER_PAGE = 8;

const ImageGallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [stats, setStats] = useState<ImageStats>({ totalImages: 0, publicImages: 0, privateImages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedImages, setDisplayedImages] = useState<ImageItem[]>([]);
  
  const fetchImagesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchImages(filter);
      setImages(data.images);
      setStats(data.stats);
      
      // Reset to first page when filter changes
      setCurrentPage(1);
      
      // Calculate total pages
      const calculatedTotalPages = Math.max(1, Math.ceil(data.images.length / IMAGES_PER_PAGE));
      setTotalPages(calculatedTotalPages);
      
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError(err.message || "Failed to load images");
      toast({
        title: "Error",
        description: err.message || "Failed to load images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesData();
  }, [filter]);

  // Update displayed images when images array or current page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    setDisplayedImages(images.slice(startIndex, endIndex));
  }, [images, currentPage]);

  const handleImageDelete = () => {
    // Refetch images after deletion
    fetchImagesData();
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of gallery when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Images</h2>
        <Tabs defaultValue={filter} value={filter} onValueChange={handleFilterChange} className="w-auto">
          <TabsList className="glass-effect">
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="public">
              <Eye className="h-4 w-4 mr-1" /> Public
            </TabsTrigger>
            <TabsTrigger value="private">
              <EyeOff className="h-4 w-4 mr-1" /> Private
            </TabsTrigger>
            <TabsTrigger value="owned">
              <UserIcon className="h-4 w-4 mr-1" /> Mine
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-scale-in">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[40%]" />
            </div>
          ))}
        </div>
      ) : displayedImages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedImages.map(image => (
              <ImageCard 
                key={image.id} 
                image={image} 
                onDelete={handleImageDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <ImageGalleryPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 glass-effect rounded-lg">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-medium mb-2">No images found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'all'
              ? "Your gallery is empty. Upload some images to get started!"
              : filter === 'owned'
              ? "You haven't uploaded any images yet"
              : `You don't have any ${filter} images yet`}
          </p>
          <Link to="/upload">
            <Button className="bg-primary hover:bg-primary/80">
              <Upload className="mr-2 h-4 w-4" /> Upload Images
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
