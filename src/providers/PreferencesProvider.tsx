'use client';

import React, { createContext, useContext } from 'react';
import { useUserPreferences, UserPreferences } from '@/lib/useUserPreferences';

type PreferencesContextType = {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<boolean>;
  resetPreferences: () => Promise<boolean>;
  defaultPreferences: UserPreferences;
};

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: {
    theme: 'system',
    defaultPrivacy: 'private',
    galleryView: 'grid',
    itemsPerPage: 12,
    autoMetadataStrip: false,
  },
  loading: false,
  error: null,
  updatePreferences: async () => false,
  resetPreferences: async () => false,
  defaultPreferences: {
    theme: 'system',
    defaultPrivacy: 'private',
    galleryView: 'grid',
    itemsPerPage: 12,
    autoMetadataStrip: false,
  },
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const preferencesData = useUserPreferences();
  
  return (
    <PreferencesContext.Provider value={preferencesData}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext); 