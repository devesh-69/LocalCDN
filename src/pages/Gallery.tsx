
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Lock } from 'lucide-react';
import NavbarThemed from '@/components/layout/NavbarThemed';
import ImageGallery from '@/components/image/ImageGallery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Gallery = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <NavbarThemed />
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
          
          {!isAuthenticated && (
            <Alert className="bg-secondary/30">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Private images are blurred. <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Log in</Link> to view all images.
              </AlertDescription>
            </Alert>
          )}
          
          <ImageGallery />
        </div>
      </main>
    </div>
  );
};

export default Gallery;
