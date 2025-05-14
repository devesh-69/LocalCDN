
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Heart, MessageSquare, Share2, Upload } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { fetchImages, ImageItem } from '@/api/images';
import { toast } from 'sonner';

const Gallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getImages = async () => {
      setLoading(true);
      try {
        const data = await fetchImages('all');
        setImages(data.images);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error("Failed to load images. Please try again.");
        setLoading(false);
      }
    };

    getImages();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Image Gallery</h1>
              <p className="text-muted-foreground">Discover and share amazing images</p>
            </div>
            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Image
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[300px] w-full" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {images.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div>
                    <AspectRatio ratio={4/3}>
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                        <Heart size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                        <Share2 size={16} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Eye size={14} />
                      <span>{item.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 glass-effect rounded-lg mt-6">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-medium mb-2">No images found</h3>
              <p className="text-muted-foreground mb-4">
                Your gallery is empty. Upload some images to get started!
              </p>
              <Link to="/upload">
                <Button className="bg-primary hover:bg-primary/80">Upload Images</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Gallery;
