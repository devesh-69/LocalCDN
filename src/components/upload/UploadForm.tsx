'use client';

import React, { useState, useRef } from 'react';
import { useUploadDefaults } from '@/hooks/useUploadDefaults';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface UploadFormProps {
  onSuccess?: (imageId: string) => void;
  className?: string;
  maxFiles?: number;
  maxSize?: number;
}

export default function UploadForm({ onSuccess, className = '', maxFiles = 1, maxSize = 5 * 1024 * 1024 }: UploadFormProps) {
  const { defaultPrivacy, stripMetadata } = useUploadDefaults();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: defaultPrivacy === 'public',
    stripMetadata: stripMetadata,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    // Reset form when a new file is selected
    setFile(selectedFile);
    setFormData(prev => ({
      ...prev,
      title: selectedFile.name.split('.')[0] || '',
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle checkbox/switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('isPublic', formData.isPublic.toString());
      uploadData.append('stripMetadata', formData.stripMetadata.toString());
      
      // Send the upload request
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }
      
      const data = await response.json();
      toast.success('Image uploaded successfully');
      
      // Reset form
      setFile(null);
      setPreview(null);
      setFormData({
        title: '',
        description: '',
        isPublic: defaultPrivacy === 'public',
        stripMetadata: stripMetadata,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess && data.id) {
        onSuccess(data.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${dragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
            ${preview ? 'h-auto' : 'h-64 flex flex-col items-center justify-center'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="mx-auto max-h-64 object-contain" 
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
              >
                <AlertCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop an image, or click to select
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Supports JPEG, PNG, GIF, and WebP up to 5MB
                </p>
              </div>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Image Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a title for your image"
              className="mt-1"
              disabled={uploading}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add a description (optional)"
              className="mt-1 h-20"
              disabled={uploading}
            />
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium">Upload Settings</h3>
            
            <div>
              <p className="text-sm font-medium mb-2">Visibility</p>
              <RadioGroup
                value={formData.isPublic ? 'public' : 'private'}
                onValueChange={(value) => handleSwitchChange('isPublic', value === 'public')}
                disabled={uploading}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="visibility-private" />
                  <Label htmlFor="visibility-private" className="cursor-pointer">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="visibility-public" />
                  <Label htmlFor="visibility-public" className="cursor-pointer">Public</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="strip-metadata" className="text-sm font-medium">Strip Metadata</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Remove EXIF data and other metadata from image
                </p>
              </div>
              <Switch
                id="strip-metadata"
                checked={formData.stripMetadata}
                onCheckedChange={(checked) => handleSwitchChange('stripMetadata', checked)}
                disabled={uploading}
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </>
          )}
        </Button>
      </form>
    </div>
  );
} 