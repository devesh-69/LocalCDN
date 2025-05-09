'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, RotateCcw, Download } from 'lucide-react';
import { ImageEditor } from '@/components/image/ImageEditor';
import { toast } from 'react-hot-toast';

interface ImageDetails {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export default function ImageEditPage() {
  const params = useParams();
  const router = useRouter();
  const imageId = params.id as string;
  
  const [image, setImage] = useState<ImageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
          title: 'Sample Image',
          url: `https://picsum.photos/seed/${imageId}/800/600`,
          width: 800,
          height: 600,
          format: 'jpg',
        };
        
        setImage(mockData);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to load image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImage();
  }, [imageId]);
  
  // Go back to image view
  const handleCancel = () => {
    router.push(`/image/${imageId}`);
  };
  
  // Save the edited image
  const handleSave = async (editedImageData: Blob) => {
    setIsSaving(true);
    
    try {
      // Here we would upload the edited image to the server
      // In a real app, we would use FormData to send the image
      // const formData = new FormData();
      // formData.append('image', editedImageData);
      // const response = await fetch(`/api/images/${imageId}/edit`, {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) throw new Error('Failed to save edited image');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Image saved successfully');
      router.push(`/image/${imageId}`);
    } catch (err) {
      console.error('Error saving image:', err);
      toast.error('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Download the edited image
  const handleDownload = (editedImageData: Blob) => {
    const url = URL.createObjectURL(editedImageData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-${image?.title || 'image'}.${image?.format || 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Image
        </Button>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error || 'Image not found'}</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Image</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                canvas.toBlob((blob) => {
                  if (blob) handleSave(blob);
                });
              }
            }}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <ImageEditor 
          image={image}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </div>
    </Container>
  );
} 