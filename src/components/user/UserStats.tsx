'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Image as ImageIcon, HardDrive, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@/lib/utils';

interface UserStatsProps {
  className?: string;
}

export function UserStats({ className }: UserStatsProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    imagesCount: 0,
    storageUsed: 0,
    memberSince: '',
  });

  // Fetch user stats
  useEffect(() => {
    async function fetchUserStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile?stats=true');

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        
        setStats({
          imagesCount: data.stats?.imagesCount || 0,
          storageUsed: data.stats?.storageUsed || 0,
          memberSince: data.createdAt ? formatDistanceToNow(new Date(data.createdAt), { addSuffix: true }) : 'Unknown',
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchUserStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Statistics</h3>
      
      <div className="space-y-3">
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex-shrink-0 mr-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Images</p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.imagesCount}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex-shrink-0 mr-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{formatBytes(stats.storageUsed)}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex-shrink-0 mr-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 