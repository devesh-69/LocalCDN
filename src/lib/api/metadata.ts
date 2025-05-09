/**
 * API client for metadata operations
 */

import { MetadataVersion } from '@/components/metadata/VersionHistory';

/**
 * Get metadata for an image
 */
export async function getImageMetadata(
  imageId: string,
  versionId?: string
): Promise<{
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  metadata: {
    basic: Record<string, any>;
    exif?: Record<string, any>;
    iptc?: Record<string, any>;
    xmp?: Record<string, any>;
    custom?: Record<string, any>;
  };
}> {
  try {
    const queryParams = versionId ? `?versionId=${versionId}` : '';
    const response = await fetch(`/api/images/${imageId}/metadata${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    throw error;
  }
}

/**
 * Update metadata for an image
 */
export async function updateImageMetadata(
  imageId: string,
  metadata: Record<string, any>,
  restoreFromVersionId?: string
): Promise<void> {
  try {
    const payload: any = { metadata };
    
    if (restoreFromVersionId) {
      payload.restoreFromVersionId = restoreFromVersionId;
    }
    
    const response = await fetch(`/api/images/${imageId}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update metadata');
    }
  } catch (error) {
    console.error('Error updating image metadata:', error);
    throw error;
  }
}

/**
 * Get version history for image metadata
 */
export async function getMetadataVersions(
  imageId: string
): Promise<MetadataVersion[]> {
  try {
    const response = await fetch(`/api/images/${imageId}/metadata/versions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata versions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata versions:', error);
    throw error;
  }
}

/**
 * Export metadata to a file
 */
export async function exportMetadata(
  imageId: string,
  versionId?: string
): Promise<void> {
  try {
    const queryParams = versionId ? `?versionId=${versionId}` : '';
    const response = await fetch(`/api/images/${imageId}/metadata/export${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to export metadata');
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadata_${imageId}${versionId ? `_version_${versionId}` : ''}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting metadata:', error);
    throw error;
  }
}

/**
 * Strip metadata from an image
 */
export async function stripMetadata(
  imageId: string
): Promise<void> {
  try {
    const response = await fetch(`/api/images/${imageId}/metadata/strip`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to strip metadata');
    }
  } catch (error) {
    console.error('Error stripping metadata:', error);
    throw error;
  }
}

/**
 * Extract metadata from an image file (client-side)
 */
export async function extractMetadataFromFile(file: File): Promise<Record<string, any>> {
  try {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the file to the extraction endpoint
    const response = await fetch('/api/metadata/extract', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
} 