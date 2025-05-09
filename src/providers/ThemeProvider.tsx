'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserPreferences } from '@/lib/useUserPreferences';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences, updatePreferences } = useUserPreferences();
  const [theme, setThemeState] = useState<Theme>('system');
  
  // Initialize theme from user preferences
  useEffect(() => {
    if (preferences.theme) {
      setThemeState(preferences.theme);
    }
  }, [preferences.theme]);
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing classes
    root.classList.remove('light', 'dark');
    
    // Set theme based on preference
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Update theme and save to user preferences
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await updatePreferences({ theme: newTheme });
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 