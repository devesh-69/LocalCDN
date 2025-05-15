
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/api/images';
import { useNavigate } from 'react-router-dom';

interface ImageUploaderProps {
  title: string;
  description: string;
  isPublic: boolean;
}

const ImageUploader = ({ title, description, isPublic }: ImageUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        setFiles(prev => [...prev, ...imageFiles]);
      } else {
        toast({
          title: "Invalid files",
          description: "Please upload image files only",
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Upload each file to Supabase
      const promises = files.map(async (file) => {
        try {
          return await uploadImage(file, title || 'Untitled', description, isPublic);
        } catch (error) {
          console.error('Error uploading image:', error);
          throw error;
        }
      });
      
      await Promise.all(promises);
      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `${files.length} ${files.length === 1 ? 'image' : 'images'} uploaded successfully`,
      });
      
      // Clear files after successful upload and navigate to gallery
      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        setUploadProgress(0);
        navigate('/gallery');
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your images. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all",
          isDragOver ? "border-primary bg-primary/10" : "border-border",
          "glass-effect"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-primary mb-2" />
          <h3 className="font-medium text-lg">Drag & drop images here</h3>
          <p className="text-muted-foreground text-sm">
            or <span className="text-primary">browse files</span>
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Supports JPG, PNG and WebP (max 10MB each)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary p-2 rounded">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div className="truncate" style={{ maxWidth: '200px' }}>
                      {file.name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="glass-effect"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              className="bg-primary hover:bg-primary/80"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
