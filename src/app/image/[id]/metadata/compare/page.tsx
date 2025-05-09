'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { getImageMetadata } from '@/lib/api/metadata';
import { diffJson } from 'diff';

/**
 * Component for displaying and comparing metadata versions
 */
export default function MetadataComparePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version1Data, setVersion1Data] = useState<Record<string, any> | null>(null);
  const [version2Data, setVersion2Data] = useState<Record<string, any> | null>(null);
  const [diffResult, setDiffResult] = useState<any[]>([]);
  
  const version1Id = searchParams.get('v1');
  const version2Id = searchParams.get('v2');
  
  useEffect(() => {
    const fetchVersions = async () => {
      if (!version1Id || !version2Id) {
        setError('Two versions are required for comparison');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch version 1
        const v1Data = await getImageMetadata(imageId, version1Id);
        setVersion1Data(v1Data);
        
        // Fetch version 2
        const v2Data = await getImageMetadata(imageId, version2Id);
        setVersion2Data(v2Data);
        
        // Generate diff
        const diff = diffJson(v1Data.metadata, v2Data.metadata);
        setDiffResult(diff);
      } catch (err) {
        console.error('Error comparing versions:', err);
        setError('Failed to load and compare versions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVersions();
  }, [imageId, version1Id, version2Id]);
  
  const handleBack = () => {
    router.push(`/image/${imageId}/metadata`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Comparing versions...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Metadata
        </Button>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Metadata
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Metadata Version Comparison</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Side-by-side comparison */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex justify-between">
            <h2 className="font-medium">Version 1</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
              {version1Id}
            </span>
          </div>
          <div className="p-4 overflow-auto max-h-[70vh]">
            <pre className="text-sm whitespace-pre-wrap">
              {version1Data?.metadata ? JSON.stringify(version1Data.metadata, null, 2) : 'No data'}
            </pre>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex justify-between">
            <h2 className="font-medium">Version 2</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
              {version2Id}
            </span>
          </div>
          <div className="p-4 overflow-auto max-h-[70vh]">
            <pre className="text-sm whitespace-pre-wrap">
              {version2Data?.metadata ? JSON.stringify(version2Data.metadata, null, 2) : 'No data'}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Unified diff view */}
      <div className="mt-8 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <h2 className="font-medium">Changes</h2>
        </div>
        <div className="p-4 overflow-auto max-h-[70vh]">
          <pre className="text-sm">
            {diffResult.map((part, index) => {
              const color = part.added 
                ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' 
                : part.removed 
                  ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' 
                  : 'text-gray-700 dark:text-gray-300';
              
              return (
                <span key={index} className={color}>
                  {part.value}
                </span>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
} 