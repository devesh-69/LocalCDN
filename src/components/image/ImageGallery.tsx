
import React, { useState, useEffect } from 'react';
import ImageCard from './ImageCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

// Mock data for the gallery
const getMockImages = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `img-${i}`,
    url: `https://picsum.photos/seed/${i + 100}/400/400`,
    title: `Image ${i + 1}`,
    isPublic: i % 3 === 0,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

const ImageGallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockImages = getMockImages();
        setImages(mockImages);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load images. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [toast]);

  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'public') return image.isPublic;
    if (filter === 'private') return !image.isPublic;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Images</h2>
        <Tabs defaultValue="all" className="w-auto">
          <TabsList className="glass-effect">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="public" onClick={() => setFilter('public')}>
              <Eye className="h-4 w-4 mr-1" /> Public
            </TabsTrigger>
            <TabsTrigger value="private" onClick={() => setFilter('private')}>
              <EyeOff className="h-4 w-4 mr-1" /> Private
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 glass-effect rounded-lg">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-medium mb-2">No images found</h3>
          <p className="text-muted-foreground mb-4">
            {filter !== 'all'
              ? `You don't have any ${filter} images yet`
              : "Your gallery is empty. Upload some images to get started!"}
          </p>
          <Button className="bg-primary hover:bg-primary/80">Upload Images</Button>
        </div>
      )}

      {filteredImages.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="glass-effect">Load More</Button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
