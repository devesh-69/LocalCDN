
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import ImageUploader from '@/components/image/ImageUploader';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl py-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Image</CardTitle>
            <CardDescription>Share your creative work with the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your image a title"
                className="bg-secondary/50"
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
              <Switch
                id="visibility"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="visibility" className="text-sm cursor-pointer">Make this image public</Label>
            </div>

            <ImageUploader 
              title={title}
              description={description}
              isPublic={isPublic}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
