
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Gallery, ImagePlus } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// This is a placeholder component for the Albums feature
// In a real implementation, this would connect to the backend to create and manage albums

interface Album {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  coverImage?: string;
}

const AlbumsView = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  useEffect(() => {
    // Simulate loading albums from backend
    const loadAlbums = async () => {
      // In a real implementation, this would fetch from the database
      try {
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For now, we'll just use sample data
        // In a real implementation, this would come from the backend
        setAlbums([
          {
            id: '1',
            name: 'Vacation Photos',
            description: 'My summer vacation photos',
            imageCount: 24,
            coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
          },
          {
            id: '2',
            name: 'Work Projects',
            description: 'Screenshots and diagrams',
            imageCount: 12
          }
        ]);
      } catch (error) {
        console.error('Error loading albums:', error);
        toast.error('Failed to load albums');
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, []);

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) {
      toast.error('Album name is required');
      return;
    }

    // In a real implementation, this would save to the database
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name: newAlbumName,
      description: newAlbumDescription,
      imageCount: 0
    };

    setAlbums([...albums, newAlbum]);
    toast.success(`Album "${newAlbumName}" created`);
    
    // Reset form
    setNewAlbumName('');
    setNewAlbumDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Albums</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-primary">
              <FolderPlus className="mr-2 h-4 w-4" /> Create Album
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-modal">
            <SheetHeader>
              <SheetTitle>Create New Album</SheetTitle>
              <SheetDescription>
                Group your images into collections for easier organization.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Album Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Vacation Photos"
                  value={newAlbumName}
                  onChange={e => setNewAlbumName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Describe what's in this album"
                  value={newAlbumDescription}
                  onChange={e => setNewAlbumDescription(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter>
              <Button 
                className="w-full sm:w-auto" 
                onClick={handleCreateAlbum}
              >
                Create Album
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map(album => (
            <Card key={album.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 glass-card overflow-hidden">
              <div className="h-40 w-full overflow-hidden bg-muted">
                {album.coverImage ? (
                  <img 
                    src={album.coverImage} 
                    alt={album.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary/30">
                    <Gallery className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-lg font-medium">{album.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3 pt-0">
                <p className="text-sm text-muted-foreground">{album.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs">{album.imageCount} images</span>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-effect rounded-lg">
          <Gallery className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Albums Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Create albums to organize your images into collections for easier management.
          </p>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" /> Create Your First Album
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-modal">
              {/* Same content as above */}
              <SheetHeader>
                <SheetTitle>Create New Album</SheetTitle>
                <SheetDescription>
                  Group your images into collections for easier organization.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name2">Album Name</Label>
                  <Input 
                    id="name2" 
                    placeholder="e.g., Vacation Photos"
                    value={newAlbumName}
                    onChange={e => setNewAlbumName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description2">Description (Optional)</Label>
                  <Input 
                    id="description2" 
                    placeholder="Describe what's in this album"
                    value={newAlbumDescription}
                    onChange={e => setNewAlbumDescription(e.target.value)}
                  />
                </div>
              </div>
              <SheetFooter>
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleCreateAlbum}
                >
                  Create Album
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default AlbumsView;
