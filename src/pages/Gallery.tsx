
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Eye, Heart, MessageSquare, Share2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

// Mock data for gallery items
const galleryItems = [
  {
    id: 1,
    title: "Mountain Landscape",
    imageUrl: "https://source.unsplash.com/random/800x600?mountains",
    likes: 120,
    comments: 24,
    views: 1200,
    author: "nature_lover"
  },
  {
    id: 2,
    title: "City Skyline",
    imageUrl: "https://source.unsplash.com/random/800x600?city",
    likes: 95,
    comments: 18,
    views: 870,
    author: "urban_explorer"
  },
  {
    id: 3,
    title: "Beach Sunset",
    imageUrl: "https://source.unsplash.com/random/800x600?sunset",
    likes: 210,
    comments: 32,
    views: 1520,
    author: "sunset_chaser"
  },
  {
    id: 4,
    title: "Forest Path",
    imageUrl: "https://source.unsplash.com/random/800x600?forest",
    likes: 78,
    comments: 14,
    views: 650,
    author: "trail_walker"
  },
  {
    id: 5,
    title: "Abstract Art",
    imageUrl: "https://source.unsplash.com/random/800x600?abstract",
    likes: 156,
    comments: 27,
    views: 980,
    author: "art_enthusiast"
  },
  {
    id: 6,
    title: "Wildlife Photography",
    imageUrl: "https://source.unsplash.com/random/800x600?wildlife",
    likes: 189,
    comments: 31,
    views: 1340,
    author: "wildlife_photographer"
  },
];

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Image Gallery</h1>
          <p className="text-muted-foreground">Discover and share amazing images</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div>
                  <AspectRatio ratio={4/3}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">@{item.author}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <div className="flex space-x-3">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                      <Heart size={16} />
                      <span>{item.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                      <MessageSquare size={16} />
                      <span>{item.comments}</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Eye size={14} />
                    <span>{item.views}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gallery;
