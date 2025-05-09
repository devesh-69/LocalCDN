'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X } from 'lucide-react';

export interface FileWithPreview extends File {
  preview?: string;
}

interface DropZoneProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB by default
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  className = '',
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.errors[0].code === 'file-too-large') {
          return `${file.file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB.`;
        }
        if (file.errors[0].code === 'file-invalid-type') {
          return `${file.file.name} has an invalid file type.`;
        }
        return `${file.file.name}: ${file.errors[0].message}`;
      });
      setError(errors.join(' '));
      return;
    }
    
    // Clear error
    setError(null);
    
    // Add previews to accepted files
    const filesWithPreview = acceptedFiles.map((file) => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    
    setFiles(filesWithPreview);
    onFilesSelected(filesWithPreview);
  }, [maxSize, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  const removeFile = (e: React.MouseEvent, fileToRemove: FileWithPreview) => {
    e.stopPropagation();
    
    // Remove file from state
    const newFiles = files.filter(file => file !== fileToRemove);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    
    // Revoke the preview URL to avoid memory leaks
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700'}
          ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          hover:border-primary hover:bg-primary/5
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-10 h-10 mb-2 text-gray-400" />
          
          <p className="mb-1 text-lg font-semibold">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports JPG, PNG, GIF, WEBP images up to {maxSize / (1024 * 1024)}MB
          </p>
          
          {error && (
            <div className="mt-3 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview area */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <Image
                  src={file.preview || ''}
                  alt={file.name}
                  className="object-cover w-full h-full"
                  width={200}
                  height={200}
                />
                <button
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => removeFile(e, file)}
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="mt-1 text-xs truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropZone; 