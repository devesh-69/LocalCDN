'use client';

import React, { useState, useEffect } from 'react';
import { useGallerySettings } from '@/hooks/useGallerySettings';
import { SelectableImageGrid } from '@/components/gallery/SelectableImageGrid';
import { GalleryView } from '@/components/gallery/GalleryView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Shield, Grid, CheckSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GalleryPage() {
  const { layout } = useGallerySettings();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view');

  // Fetch user's images
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch('/api/images/list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    }
    
    fetchImages();
  }, []);

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Your Gallery</h1>
      
      <Tabs 
        defaultValue="view" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="view" className="flex items-center">
            <Grid className="mr-2 h-4 w-4" />
            <span>View Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center">
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Manage Privacy</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <GalleryView images={images} />
          )}
        </TabsContent>
        
        <TabsContent value="manage">
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 text-blue-700 dark:text-blue-300">
            <div className="flex items-start">
              <Shield className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium">Manage Privacy Settings</h3>
                <p className="text-sm mt-1">
                  Select multiple images to change their privacy settings. Public images can be seen by anyone with the link, while private images are only visible to you.
                </p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <SelectableImageGrid images={images} layout={layout} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 