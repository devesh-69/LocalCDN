import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  defaultPrivacy: 'public' | 'private';
  galleryView: 'grid' | 'masonry';
  itemsPerPage: number;
  autoMetadataStrip: boolean;
  showPublicGallery: boolean;
};

const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultPrivacy: 'private',
  galleryView: 'grid',
  itemsPerPage: 12,
  autoMetadataStrip: false,
  showPublicGallery: true,
};

export function useUserPreferences() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user preferences from API
  useEffect(() => {
    async function fetchPreferences() {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/user/preferences');
        
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        
        const data = await response.json();
        setPreferences({
          theme: data.theme || defaultPreferences.theme,
          defaultPrivacy: data.defaultPrivacy || defaultPreferences.defaultPrivacy,
          galleryView: data.galleryView || defaultPreferences.galleryView,
          itemsPerPage: data.itemsPerPage || defaultPreferences.itemsPerPage,
          autoMetadataStrip: data.autoMetadataStrip ?? defaultPreferences.autoMetadataStrip,
          showPublicGallery: data.showPublicGallery ?? defaultPreferences.showPublicGallery,
        });
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPreferences();
  }, [session]);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!session?.user) {
      toast.error('You must be logged in to update preferences');
      return false;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update preferences');
      }
      
      const updatedPrefs = await response.json();
      
      setPreferences(prev => ({
        ...prev,
        ...updatedPrefs,
      }));
      
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      toast.error(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);
  
  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    return await updatePreferences(defaultPreferences);
  }, [updatePreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    defaultPreferences,
  };
} 