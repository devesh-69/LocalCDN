import React from 'react';
import UploadForm from '@/components/upload/UploadForm';

export const metadata = {
  title: 'Upload Images - LocalCDN',
  description: 'Upload your images to LocalCDN for quick access and sharing',
};

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Upload Images</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload your images to LocalCDN for easy access, sharing, and management.
          Supported formats include JPEG, PNG, GIF, and WebP.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-8">
        <UploadForm 
          maxFiles={5} 
          maxSize={5 * 1024 * 1024} // 5MB 
        />
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Tips for successful uploads</h2>
        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>Make sure your images are under 5MB in size</li>
          <li>For best results, use high-quality JPG or PNG formats</li>
          <li>Images will be optimized automatically for web viewing</li>
          <li>You can upload up to 5 images at once</li>
          <li>All image metadata will be preserved unless you choose to remove it</li>
        </ul>
      </div>
    </div>
  );
} 