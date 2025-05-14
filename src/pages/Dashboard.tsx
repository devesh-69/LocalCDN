
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Eye, EyeOff, Upload, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import { fetchImages, ImageItem } from '@/api/images';
import { ImageStats } from '@/types/mongodb';

const Dashboard = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [stats, setStats] = useState<ImageStats>({ totalImages: 0, publicImages: 0, privateImages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const getImages = async () => {
      setLoading(true);
      try {
        const data = await fetchImages(filter);
        setImages(data.images);
        setStats(data.stats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error("Failed to load images. Please try again.");
        setLoading(false);
      }
    };

    getImages();
  }, [filter]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your images</p>
          </div>
          <Link to="/upload">
            <Button className="bg-primary hover:bg-primary/80">
              <Upload className="h-4 w-4 mr-2" /> Upload Images
            </Button>
          </Link>
        </div>
        
        <div className="glass-card p-4 sm:p-6 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.totalImages}
              </div>
              <div className="text-sm text-muted-foreground">Total Images</div>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.publicImages}
              </div>
              <div className="text-sm text-muted-foreground">Public Images</div>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats.privateImages}
              </div>
              <div className="text-sm text-muted-foreground">Private Images</div>
            </div>
          </div>
        </div>
        
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
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <Card key={image.id} className="overflow-hidden">
                  <AspectRatio ratio={1}>
                    <img 
                      src={image.url} 
                      alt={image.title} 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm truncate">{image.title}</h3>
                      <div className="flex items-center">
                        {image.isPublic ? 
                          <Eye className="h-4 w-4 text-muted-foreground" /> : 
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
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
              <Link to="/upload">
                <Button className="bg-primary hover:bg-primary/80">Upload Images</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
