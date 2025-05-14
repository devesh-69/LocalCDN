
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define the user interface
interface UserData {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

// Define the authentication context interface
interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  register: (email: string, username: string, password: string, avatar?: File) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to format user data
  const formatUserData = async (supabaseUser: User | null): Promise<UserData | null> => {
    if (!supabaseUser) return null;

    // Get user profile data from public.profiles table
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: profileData?.username || supabaseUser.email?.split('@')[0] || 'User',
      avatarUrl: profileData?.avatar_url || null
    };
  };

  // Check if the user is already logged in on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      setIsLoading(true);
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userData = await formatUserData(session.user);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = await formatUserData(session.user);
        setUser(userData);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      const userData = await formatUserData(data.user);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in function
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/gallery`
        }
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      // The OAuth flow will redirect and handle auth state through the onAuthStateChange listener
      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      return false;
    }
  };

  // Register function
  const register = async (
    email: string, 
    username: string, 
    password: string, 
    avatar?: File
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }

      if (!data.user) {
        toast.error('Registration failed');
        return false;
      }

      let avatarUrl = null;

      // Upload avatar if provided
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${data.user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar);
          
        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          avatarUrl = publicUrlData.publicUrl;
        }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            username, 
            email, 
            avatar_url: avatarUrl 
          }
        ]);
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
      
      // Set user state
      const userData = {
        id: data.user.id,
        username,
        email,
        avatarUrl
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signInWithGoogle, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
