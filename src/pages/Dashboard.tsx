
import React, { useState, useEffect } from 'react';
import ImageGallery from '@/components/image/ImageGallery';
import ImageUploader from '@/components/image/ImageUploader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageStats } from '@/types/mongodb';
import { getMockImages } from '@/lib/mockData';

const Dashboard = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [stats, setStats] = useState<ImageStats>({ totalImages: 0, publicImages: 0, privateImages: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Use mock data instead of MongoDB connection
    try {
      const data = getMockImages('all');
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load image statistics",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your images</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/80">
              <Upload className="h-4 w-4 mr-2" /> Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ImageUploader />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary">
              {loading ? '...' : stats.totalImages}
            </div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary">
              {loading ? '...' : stats.publicImages}
            </div>
            <div className="text-sm text-muted-foreground">Public Images</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary">
              {loading ? '...' : stats.privateImages}
            </div>
            <div className="text-sm text-muted-foreground">Private Images</div>
          </div>
        </div>
      </div>
      
      <ImageGallery />
    </div>
  );
};

export default Dashboard;
