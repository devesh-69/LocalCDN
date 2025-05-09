'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { usePreferences } from '@/providers/PreferencesProvider';
import { Shield, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PrivacySettingsProps {
  className?: string;
}

export function PrivacySettings({ className = '' }: PrivacySettingsProps) {
  const { preferences, updatePreferences } = usePreferences();
  const [defaultPrivacy, setDefaultPrivacy] = useState<'public' | 'private'>(
    preferences.defaultPrivacy
  );
  const [showGallery, setShowGallery] = useState(preferences.showPublicGallery);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when preferences change
  useEffect(() => {
    setDefaultPrivacy(preferences.defaultPrivacy);
    setShowGallery(preferences.showPublicGallery);
  }, [preferences]);

  // Update global privacy settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Update user preferences
      await updatePreferences({
        defaultPrivacy,
        showPublicGallery: showGallery,
      });
      
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Privacy Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Default Privacy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Default Upload Privacy</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the default privacy setting for newly uploaded images
          </p>
          
          <RadioGroup 
            value={defaultPrivacy} 
            onValueChange={(value: 'public' | 'private') => setDefaultPrivacy(value)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="private" id="privacy-private" />
              <div>
                <Label htmlFor="privacy-private" className="flex items-center space-x-2 cursor-pointer">
                  <EyeOff className="h-4 w-4" />
                  <span>Private (default)</span>
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Only you can see these images. You'll need to manually share links or change visibility.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="public" id="privacy-public" />
              <div>
                <Label htmlFor="privacy-public" className="flex items-center space-x-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  <span>Public</span>
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Anyone with the link can access these images. They may appear in public galleries.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* Gallery Visibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Gallery Visibility</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control who can see your public gallery
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-gallery" className="font-medium">Show my gallery to others</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                When enabled, your public images will appear in your profile gallery
              </p>
            </div>
            <Switch 
              id="show-gallery"
              checked={showGallery}
              onCheckedChange={setShowGallery}
            />
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <p>
              <strong>Note:</strong> Even when your gallery is hidden, people with direct links to your public images can still access them.
            </p>
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="flex items-center">
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Privacy Settings
            </>
          )}
        </Button>
      </form>
    </div>
  );
} 