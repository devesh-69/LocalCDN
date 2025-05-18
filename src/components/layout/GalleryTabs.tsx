
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gallery, FolderOpen } from 'lucide-react';
import ImageGallery from '@/components/image/ImageGallery';
import AlbumsView from '@/components/image/album/AlbumsView';

const GalleryTabs = () => {
  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="w-full glass-effect mb-6">
        <TabsTrigger value="images" className="flex-1">
          <Gallery className="h-4 w-4 mr-2" /> Images
        </TabsTrigger>
        <TabsTrigger value="albums" className="flex-1">
          <FolderOpen className="h-4 w-4 mr-2" /> Albums
        </TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <ImageGallery />
      </TabsContent>
      <TabsContent value="albums">
        <AlbumsView />
      </TabsContent>
    </Tabs>
  );
};

export default GalleryTabs;
