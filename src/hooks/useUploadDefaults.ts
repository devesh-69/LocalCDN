import { useState, useEffect } from 'react';
import { usePreferences } from '@/providers/PreferencesProvider';

export interface UploadDefaults {
  defaultPrivacy: 'public' | 'private';
  stripMetadata: boolean;
  setDefaultPrivacy: (privacy: 'public' | 'private') => void;
  setStripMetadata: (strip: boolean) => void;
}

export function useUploadDefaults(): UploadDefaults {
  const { preferences, updatePreferences } = usePreferences();
  const [settings, setSettings] = useState<{
    defaultPrivacy: 'public' | 'private';
    stripMetadata: boolean;
  }>({
    defaultPrivacy: 'private',
    stripMetadata: false,
  });

  // Initialize from user preferences
  useEffect(() => {
    setSettings({
      defaultPrivacy: preferences.defaultPrivacy,
      stripMetadata: preferences.autoMetadataStrip,
    });
  }, [preferences.defaultPrivacy, preferences.autoMetadataStrip]);

  // Update default privacy
  const setDefaultPrivacy = async (privacy: 'public' | 'private') => {
    setSettings(prev => ({
      ...prev,
      defaultPrivacy: privacy,
    }));
    
    // Update user preferences
    await updatePreferences({
      defaultPrivacy: privacy,
    });
  };

  // Update strip metadata setting
  const setStripMetadata = async (strip: boolean) => {
    setSettings(prev => ({
      ...prev,
      stripMetadata: strip,
    }));
    
    // Update user preferences
    await updatePreferences({
      autoMetadataStrip: strip,
    });
  };

  return {
    ...settings,
    setDefaultPrivacy,
    setStripMetadata,
  };
} 