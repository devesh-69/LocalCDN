import { useState, useEffect } from 'react';
import { usePreferences } from '@/providers/PreferencesProvider';

export type GalleryLayout = 'grid' | 'masonry';

export interface GallerySettings {
  layout: GalleryLayout;
  itemsPerPage: number;
  setLayout: (layout: GalleryLayout) => void;
  setItemsPerPage: (count: number) => void;
}

export function useGallerySettings(): GallerySettings {
  const { preferences, updatePreferences } = usePreferences();
  const [settings, setSettings] = useState<{
    layout: GalleryLayout;
    itemsPerPage: number;
  }>({
    layout: 'grid',
    itemsPerPage: 12,
  });

  // Initialize from user preferences
  useEffect(() => {
    setSettings({
      layout: preferences.galleryView as GalleryLayout,
      itemsPerPage: preferences.itemsPerPage,
    });
  }, [preferences.galleryView, preferences.itemsPerPage]);

  // Update layout
  const setLayout = async (layout: GalleryLayout) => {
    setSettings(prev => ({
      ...prev,
      layout,
    }));
    
    // Update user preferences
    await updatePreferences({
      galleryView: layout,
    });
  };

  // Update items per page
  const setItemsPerPage = async (count: number) => {
    setSettings(prev => ({
      ...prev,
      itemsPerPage: count,
    }));
    
    // Update user preferences
    await updatePreferences({
      itemsPerPage: count,
    });
  };

  return {
    ...settings,
    setLayout,
    setItemsPerPage,
  };
} 