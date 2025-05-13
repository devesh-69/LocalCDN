
import React from 'react';
import { Eye, Download, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageItem } from '@/api/images';

interface ImageCardProps {
  image: ImageItem;
}

const ImageCard = ({ image }: ImageCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg glass-card animate-scale-in">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={image.url}
          alt={image.title}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute bottom-0 w-full p-3">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-white font-medium truncate">{image.title || 'Untitled'}</h3>
              <p className="text-white/70 text-xs">
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visibility Badge */}
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-1 rounded-full ${image.isPublic ? 'bg-primary/90' : 'bg-secondary/90'}`}>
          {image.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
    </div>
  );
};

export default ImageCard;
