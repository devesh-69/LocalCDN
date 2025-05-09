'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  ArrowLeft, 
  Download, 
  Share, 
  Copy, 
  Expand, 
  Edit,
  Info,
  Tag as TagIcon,
  CheckCircle,
  Calendar,
  Camera
} from 'lucide-react';
import MetadataViewer from '@/components/metadata/MetadataViewer';
import { formatDate } from '@/lib/utils';

interface ImageDetails {
  id: string;
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  metadata: Record<string, any>;
}

/**
 * Detailed image view page
 */
export default function ImagePage() {
  const params = useParams();
  const router = useRouter();
  const imageId = params.id as string;
  
  const [image, setImage] = useState<ImageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Fetch image data
  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we would fetch the image data from the API
        // const response = await fetch(`/api/images/${imageId}`);
        // if (!response.ok) throw new Error('Failed to fetch image');
        // const data = await response.json();
        
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        const mockData: ImageDetails = {
          id: imageId,
          title: 'Sample Image with a Long Title to Test Truncation',
          description: 'This is a sample image description that showcases the image details page layout and functionality.',
          url: `https://picsum.photos/seed/${imageId}/800/600`,
          width: 800,
          height: 600,
          format: 'jpg',
          size: 1024 * 1024 * 2, // 2MB
          tags: ['nature', 'landscape', 'mountains', 'water'],
          createdAt: new Date().toISOString(),
          isPublic: true,
          metadata: {
            basic: {
              width: 800,
              height: 600,
              format: 'jpg',
              size: 1024 * 1024 * 2, // 2MB
              uploadDate: new Date().toISOString(),
            },
            exif: {
              camera: 'Canon EOS R5',
              lens: 'Canon RF 24-70mm f/2.8L IS USM',
              focalLength: '35mm',
              aperture: 'f/2.8',
              shutterSpeed: '1/100s',
              iso: '100',
              captureDate: new Date().toISOString(),
            }
          }
        };
        
        setImage(mockData);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to load image details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImage();
  }, [imageId]);
  
  // Navigate back to gallery
  const handleBackClick = () => {
    router.push('/gallery');
  };
  
  // Download image
  const handleDownload = () => {
    if (!image) return;
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title || 'image'}.${image.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Copy image URL to clipboard
  const handleCopyUrl = () => {
    if (!image) return;
    
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  // Toggle fullscreen view
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Navigate to edit page
  const handleEdit = () => {
    router.push(`/image/${imageId}/edit`);
  };
  
  // Navigate to metadata page
  const handleViewMetadata = () => {
    router.push(`/image/${imageId}/metadata`);
  };
  
  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }
  
  if (error || !image) {
    return (
      <Container className="py-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error || 'Image not found'}</p>
        </div>
      </Container>
    );
  }
  
  return (
    <>
      {/* Fullscreen view */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={toggleFullscreen}
        >
          <div className="relative w-full h-full">
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-contain"
              priority
            />
            
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white border-gray-700 hover:bg-black/70"
              onClick={toggleFullscreen}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      <Container className="py-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image */}
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
              <Image
                src={image.url}
                alt={image.title}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-black/50 text-white border-gray-700 hover:bg-black/70"
                >
                  <Expand className="h-4 w-4" />
                  <span className="sr-only">Fullscreen</span>
                </Button>
              </div>
            </div>
            
            {/* Image actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                {isCopied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          
          {/* Right: Image details */}
          <div>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
                {image.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {image.description}
                  </p>
                )}
              </div>
              
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  {/* Basic image details */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                      <h3 className="font-medium flex items-center">
                        <Info className="h-4 w-4 mr-2 text-gray-500" />
                        Image Information
                      </h3>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Dimensions</span>
                        <span>{image.width} × {image.height}px</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Format</span>
                        <span>{image.format.toUpperCase()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Size</span>
                        <span>{Math.round(image.size / 1024 / 1024 * 10) / 10} MB</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                        <span>{formatDate(image.createdAt)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Visibility</span>
                        <span>{image.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {image.tags && image.tags.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                        <h3 className="font-medium flex items-center">
                          <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Tags
                        </h3>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {image.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="metadata">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Image Metadata</h3>
                      
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={handleViewMetadata}
                        className="p-0 h-auto text-primary"
                      >
                        View Full Metadata
                      </Button>
                    </div>
                    
                    <MetadataViewer 
                      metadata={image.metadata}
                      readOnly={true}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
} 