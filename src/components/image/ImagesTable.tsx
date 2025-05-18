
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { ImageItem } from '@/api/images';
import ShareImage from './image-sharing/ShareImage';
import DownloadImage from './image-actions/DownloadImage';
import DeleteImage from './image-actions/DeleteImage';
import { useAuth } from '@/contexts/AuthContext';

interface ImagesTableProps {
  images: ImageItem[];
  loading: boolean;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

const ImagesTable = ({ images, loading, onFilterChange, currentFilter }: ImagesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const filteredImages = searchTerm 
    ? images.filter(image => 
        image.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        image.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Images Table</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            placeholder="Search images..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Tabs defaultValue={currentFilter} value={currentFilter} onValueChange={onFilterChange} className="w-auto">
            <TabsList className="glass-effect">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">
                <Eye className="h-4 w-4 mr-1" /> Public
              </TabsTrigger>
              <TabsTrigger value="private">
                <EyeOff className="h-4 w-4 mr-1" /> Private
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="text-sm text-muted-foreground flex items-center space-x-1 mb-2">
          <Lock className="h-3 w-3" />
          <span>Private images require login to view, download or share</span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredImages.length > 0 ? (
              filteredImages.map((image) => {
                const isPrivateAndNotAuthenticated = !isAuthenticated && !image.isPublic;
                
                return (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden relative">
                        <img 
                          src={image.url} 
                          alt={image.title} 
                          className={`h-full w-full object-cover ${isPrivateAndNotAuthenticated ? 'blur-md' : ''}`}
                        />
                        {isPrivateAndNotAuthenticated && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Lock className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{image.title || 'Untitled'}</div>
                      {image.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{image.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {image.isPublic ? (
                          <div className="flex items-center text-green-500">
                            <Eye className="h-4 w-4 mr-1" /> Public
                          </div>
                        ) : (
                          <div className="flex items-center text-blue-500">
                            <EyeOff className="h-4 w-4 mr-1" /> Private
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <DownloadImage 
                          image={image}
                          isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
                          size="icon"
                          variant="ghost"
                        />
                        
                        <ShareImage 
                          image={image}
                          isPrivateAndNotAuthenticated={isPrivateAndNotAuthenticated}
                          size="icon"
                          variant="ghost"
                        />
                        
                        {image.isOwner && (
                          <DeleteImage 
                            image={image}
                            onDelete={() => onFilterChange(currentFilter)}
                            className="text-destructive hover:bg-destructive/10"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="text-4xl mb-2">🖼️</div>
                    <h3 className="text-lg font-medium">No images found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm 
                        ? "No images match your search criteria"
                        : currentFilter !== 'all'
                          ? `You don't have any ${currentFilter} images yet`
                          : "Your gallery is empty. Upload some images to get started!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ImagesTable;
