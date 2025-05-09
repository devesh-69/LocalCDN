'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HardDrive, FileType, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

// Types for storage statistics
interface StorageStats {
  totalUsed: number;
  totalLimit: number;
  fileTypes: {
    type: string;
    count: number;
    size: number;
  }[];
  recentUploads: {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: string;
  }[];
}

// Helper function to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function UserDataStatistics() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  
  // Fetch storage statistics
  useEffect(() => {
    const fetchStorageStats = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/user/storage-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch storage statistics');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching storage statistics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load storage statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStorageStats();
  }, [session]);
  
  // Calculate usage percentage
  const usagePercentage = stats ? (stats.totalUsed / stats.totalLimit) * 100 : 0;
  const isNearingLimit = usagePercentage > 80;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No storage statistics available
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <HardDrive className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Storage Usage</h2>
      </div>
      
      {/* Storage Usage Progress Bar */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>You've used {formatBytes(stats.totalUsed)} of {formatBytes(stats.totalLimit)}</span>
            <span className={isNearingLimit ? 'text-amber-600 dark:text-amber-400' : ''}>
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 80 ? 'bg-amber-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            ></div>
          </div>
          
          {isNearingLimit && (
            <div className="text-amber-600 dark:text-amber-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>
                You're approaching your storage limit. Consider removing unused files.
              </span>
            </div>
          )}
        </div>
      </Card>
      
      {/* File Type Breakdown */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">File Type Breakdown</h3>
        <div className="space-y-4">
          {stats.fileTypes.map((fileType) => (
            <div key={fileType.type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <FileType className="h-4 w-4 mr-2" />
                  <span className="capitalize">{fileType.type} ({fileType.count} files)</span>
                </div>
                <span>{formatBytes(fileType.size)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(fileType.size / stats.totalUsed) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Recent Uploads */}
      {stats.recentUploads.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Recent Uploads</h3>
          <div className="space-y-3">
            {stats.recentUploads.map((file) => (
              <div key={file.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="truncate max-w-[70%]">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(file.size)} · {new Date(file.uploadDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {file.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 