'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MetadataViewer from '@/components/metadata/MetadataViewer';
import MetadataEditor from '@/components/metadata/MetadataEditor';
import VersionHistory, { MetadataVersion } from '@/components/metadata/VersionHistory';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Download, Clock } from 'lucide-react';
import { getImageMetadata, updateImageMetadata, getMetadataVersions, exportMetadata } from '@/lib/api/metadata';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Image from 'next/image';

/**
 * Page for viewing and editing image metadata
 */
export default function ImageMetadataPage() {
  const params = useParams();
  const router = useRouter();
  const imageId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [versions, setVersions] = useState<MetadataVersion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string>('current');
  const [imageDetails, setImageDetails] = useState<{
    title: string;
    url: string;
    width: number;
    height: number;
  } | null>(null);

  // Fetch image metadata
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch metadata for the image
        const data = await getImageMetadata(imageId);
        setMetadata(data.metadata);
        setImageDetails({
          title: data.title,
          url: data.url,
          width: data.width,
          height: data.height,
        });
        
        // Fetch version history
        const versionHistory = await getMetadataVersions(imageId);
        setVersions(versionHistory);
        
        if (versionHistory.length > 0) {
          setCurrentVersionId(versionHistory[0].id);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load image metadata. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [imageId]);

  // Handle metadata edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle metadata save
  const handleSave = async (editedMetadata: Record<string, any>) => {
    setIsLoading(true);
    
    try {
      await updateImageMetadata(imageId, editedMetadata);
      
      // Refresh metadata after update
      const data = await getImageMetadata(imageId);
      setMetadata(data.metadata);
      
      // Refresh version history
      const versionHistory = await getMetadataVersions(imageId);
      setVersions(versionHistory);
      
      if (versionHistory.length > 0) {
        setCurrentVersionId(versionHistory[0].id);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating metadata:', err);
      setError('Failed to save metadata changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle metadata export
  const handleExport = async () => {
    try {
      await exportMetadata(imageId);
    } catch (err) {
      console.error('Error exporting metadata:', err);
      setError('Failed to export metadata. Please try again.');
    }
  };

  // Handle viewing a specific version
  const handleViewVersion = async (versionId: string) => {
    setIsLoading(true);
    
    try {
      const versionData = await getImageMetadata(imageId, versionId);
      setMetadata(versionData.metadata);
      setCurrentVersionId(versionId);
    } catch (err) {
      console.error('Error fetching version:', err);
      setError('Failed to load version. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restoring a version
  const handleRestoreVersion = async (versionId: string) => {
    setIsLoading(true);
    
    try {
      await updateImageMetadata(imageId, {}, versionId);
      
      // Refresh metadata after update
      const data = await getImageMetadata(imageId);
      setMetadata(data.metadata);
      
      // Refresh version history
      const versionHistory = await getMetadataVersions(imageId);
      setVersions(versionHistory);
      
      if (versionHistory.length > 0) {
        setCurrentVersionId(versionHistory[0].id);
      }
    } catch (err) {
      console.error('Error restoring version:', err);
      setError('Failed to restore version. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle comparing versions
  const handleCompareVersions = (versionId1: string, versionId2: string) => {
    router.push(`/image/${imageId}/metadata/compare?v1=${versionId1}&v2=${versionId2}`);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (isLoading && !metadata) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading metadata...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Image
          </Button>
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
        Back to Image
      </Button>
      
      {imageDetails && (
        <div className="flex flex-col md:flex-row mb-6 gap-6 items-start">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="border rounded-lg overflow-hidden">
              <Image
                src={imageDetails.url}
                alt={imageDetails.title}
                width={300}
                height={300}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{imageDetails.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {imageDetails.width} × {imageDetails.height} px
            </p>
            
            <Tabs defaultValue="metadata">
              <TabsList>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  Version History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="metadata" className="pt-4">
                {isEditing ? (
                  <MetadataEditor
                    metadata={metadata || {}}
                    onSave={handleSave}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <MetadataViewer
                    metadata={metadata || {}}
                    onEdit={handleEdit}
                    onExport={handleExport}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="history" className="pt-4">
                <VersionHistory
                  versions={versions}
                  currentVersionId={currentVersionId}
                  onViewVersion={handleViewVersion}
                  onRestoreVersion={handleRestoreVersion}
                  onCompareVersions={handleCompareVersions}
                  onExportVersion={(versionId) => exportMetadata(imageId, versionId)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
} 