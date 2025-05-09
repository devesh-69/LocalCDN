'use client';

import { useState, useEffect } from 'react';
import { 
  useSession, 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut 
} from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError(result.error);
        return false;
      }
      
      router.push('/dashboard');
      router.refresh();
      return true;
    } catch (err) {
      setError('Authentication failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await nextAuthSignOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Sign out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return false;
      }

      return true;
    } catch (err) {
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    status,
    signIn,
    signOut,
    register,
  };
} 