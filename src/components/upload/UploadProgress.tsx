'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadProgressProps {
  fileName: string;
  progress: number; // 0 to 100
  status: UploadStatus;
  error?: string;
  onCancel?: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  status,
  error = '',
  onCancel,
}) => {
  // Truncate long filenames
  const truncatedName = fileName.length > 25
    ? fileName.substring(0, 22) + '...'
    : fileName;
  
  return (
    <div className="w-full mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {status === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          )}
          {status === 'error' && (
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          )}
          <span className="text-sm font-medium">
            {truncatedName}
          </span>
        </div>
        
        {(status === 'uploading' || status === 'idle') && onCancel && (
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            aria-label="Cancel upload"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            status === 'error' 
              ? 'bg-red-500' 
              : status === 'success'
                ? 'bg-green-500'
                : 'bg-blue-500'
          }`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {status === 'error' && error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {status === 'success' 
            ? 'Completed' 
            : status === 'error'
              ? 'Failed'
              : `${Math.round(progress)}%`
          }
        </span>
      </div>
    </div>
  );
};

export default UploadProgress; 