
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define the user interface
interface User {
  id?: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

// Define the authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, avatar?: File) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is already logged in on mount
  useEffect(() => {
    // In a real app, this would check for a valid token or session
    const checkAuth = async () => {
      try {
        // Simulate checking local storage for user data
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll accept any non-empty credentials
      if (email && password) {
        const demoUser = {
          id: '1',
          username: 'demo_user',
          email,
          avatarUrl: null,
        };
        
        // Store user in state and localStorage
        setUser(demoUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        toast.success('Login successful!');
        return true;
      } else {
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
      return false;
    } finally {
      setIsLoading(false);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process avatar if provided
      let avatarUrl = null;
      if (avatar) {
        // In a real app, this would upload the file to storage
        // For demo, we'll create a temporary object URL
        avatarUrl = URL.createObjectURL(avatar);
      }
      
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        avatarUrl,
      };
      
      // Store user in state and localStorage
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      
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
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, isLoading }}>
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
