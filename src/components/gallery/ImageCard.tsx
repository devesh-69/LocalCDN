'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatBytes, formatDate } from '@/lib/utils';
import { Eye, Lock, Calendar, HardDrive } from 'lucide-react';

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    title?: string;
    width?: number;
    height?: number;
    size?: number;
    uploadDate?: string;
    isPublic?: boolean;
  };
  className?: string;
}

export function ImageCard({ image, className = '' }: ImageCardProps) {
  return (
    <Link 
      href={`/images/${image.id}`}
      className={`block glass glass-border card-hover ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[12px]">
        <Image
          src={image.url}
          alt={image.title || 'Image'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          priority={false}
        />
        
        {!image.isPublic && (
          <div className="absolute top-3 right-3 glass p-2 rounded-full">
            <Lock className="h-4 w-4 text-warning" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate">
            {image.title || 'Untitled'}
          </h3>
          
          {image.isPublic && (
            <div className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>Public</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="flex items-center text-xs text-opacity-80">
            <HardDrive className="h-3 w-3 mr-1.5 opacity-70" />
            <span className="mr-2">{image.width}×{image.height}</span>
            <span>{formatBytes(image.size || 0)}</span>
          </div>
          
          {image.uploadDate && (
            <div className="flex items-center text-xs text-opacity-80">
              <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
              <span>
                Uploaded {formatDate(new Date(image.uploadDate))}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 