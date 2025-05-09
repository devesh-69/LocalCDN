'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession();

  if (status === 'loading') {
    // Show a loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Redirect to login page if not authenticated
    redirect('/auth/signin');
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
} 