
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import { uploadImage } from '@/api/images';

const Upload = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      
      setImageFile(file);
      
      // Create URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error("Please select an image to upload");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please provide a title for your image");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload to Supabase
      await uploadImage(imageFile, title, description, isPublic);
      
      toast.success("Image uploaded successfully!");
      
      // Redirect to gallery
      navigate('/gallery');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl py-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Image</CardTitle>
            <CardDescription>Share your creative work with the community</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md py-10 px-4 border-muted-foreground/25">
                {imagePreview ? (
                  <div className="relative max-h-96 overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-96 object-contain"
                    />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={48} className="text-muted-foreground mb-4" />
                    <div className="text-center">
                      <p className="font-medium">Drag and drop or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">Support for JPG, PNG, GIF (max 10MB)</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your image a title"
                  className="bg-secondary/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details about your image"
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visibility"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="visibility" className="text-sm cursor-pointer">Make this image public</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UploadIcon size={16} /> Upload Image
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
