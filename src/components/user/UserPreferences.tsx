'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Switch } from '@/components/ui/Switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { UserPreferences as UserPreferencesType } from '@/lib/useUserPreferences';

interface UserPreferencesProps {
  className?: string;
}

export function UserPreferences({ className }: UserPreferencesProps) {
  const { preferences, loading, updatePreferences, resetPreferences } = usePreferences();
  const { setTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state (local copy for editing)
  const [formState, setFormState] = useState<UserPreferencesType>({
    theme: 'system',
    defaultPrivacy: 'private',
    galleryView: 'grid',
    itemsPerPage: 12,
    autoMetadataStrip: false,
  });

  // Update form state when preferences change
  useEffect(() => {
    setFormState({
      ...preferences
    });
  }, [preferences]);

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    
    // Reset changes when entering edit mode
    if (!isEditing) {
      setFormState({
        ...preferences
      });
    }
  };

  // Handle form changes
  const handleChange = (name: keyof UserPreferencesType, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cancel edits
  const handleCancel = () => {
    setFormState({ ...preferences });
    setIsEditing(false);
  };

  // Reset preferences to defaults
  const handleReset = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all preferences to defaults?');
    if (!confirmed) return;
    
    const success = await resetPreferences();
    if (success) {
      toast.success('Preferences reset to defaults');
      setIsEditing(false);
    }
  };

  // Save preferences
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await updatePreferences(formState);
      
      if (success) {
        // Update theme if it changed
        if (formState.theme !== preferences.theme) {
          setTheme(formState.theme);
        }
        
        toast.success('Preferences updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update preferences');
      }
    }
  };

  if (loading && !preferences.theme) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          User Preferences
        </h2>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={toggleEdit}>
            Edit Preferences
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <form className="space-y-8">
        {/* Theme Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <RadioGroup
                value={preferences.theme}
                onValueChange={(value) => handleChange('theme', value)}
                disabled={!isEditing}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="cursor-pointer">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="cursor-pointer">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="cursor-pointer">System</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Gallery View</Label>
              <RadioGroup
                value={preferences.galleryView}
                onValueChange={(value) => handleChange('galleryView', value)}
                disabled={!isEditing}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid" id="view-grid" />
                  <Label htmlFor="view-grid" className="cursor-pointer">Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masonry" id="view-masonry" />
                  <Label htmlFor="view-masonry" className="cursor-pointer">Masonry</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Items Per Page</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[preferences.itemsPerPage]}
                  onValueChange={(value) => handleChange('itemsPerPage', value[0])}
                  min={6}
                  max={100}
                  step={6}
                  disabled={!isEditing}
                  className="max-w-xs"
                />
                <span className="w-12 text-center">{preferences.itemsPerPage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Settings</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Default Privacy</Label>
              <RadioGroup
                value={preferences.defaultPrivacy}
                onValueChange={(value) => handleChange('defaultPrivacy', value)}
                disabled={!isEditing}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="privacy-private" />
                  <Label htmlFor="privacy-private" className="cursor-pointer">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="privacy-public" />
                  <Label htmlFor="privacy-public" className="cursor-pointer">Public</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-strip" className="text-sm font-medium">Auto-strip Metadata</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically remove EXIF data from uploaded images
                </p>
              </div>
              <Switch
                id="auto-strip"
                checked={preferences.autoMetadataStrip}
                onCheckedChange={(checked) => handleChange('autoMetadataStrip', checked)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 