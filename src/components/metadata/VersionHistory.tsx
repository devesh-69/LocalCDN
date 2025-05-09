'use client';

import React, { useState } from 'react';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown,
  Download,
  Eye,
  ArrowLeftRight
} from 'lucide-react';

export interface MetadataVersion {
  id: string;
  createdAt: string | Date;
  author?: string;
  description?: string;
  changeType: 'edit' | 'strip' | 'restore' | 'initial';
}

export interface VersionHistoryProps {
  versions: MetadataVersion[];
  currentVersionId: string;
  onViewVersion: (versionId: string) => void;
  onRestoreVersion: (versionId: string) => void;
  onCompareVersions?: (versionId1: string, versionId2: string) => void;
  onExportVersion?: (versionId: string) => void;
}

/**
 * Component for displaying and interacting with metadata version history
 */
const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionId,
  onViewVersion,
  onRestoreVersion,
  onCompareVersions,
  onExportVersion,
}) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  
  // Toggle version expanded state
  const toggleVersionExpanded = (versionId: string) => {
    setExpandedVersion(prev => prev === versionId ? null : versionId);
  };
  
  // Toggle version selection
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else {
        // Only allow 2 selections at most
        const newSelection = [...prev, versionId].slice(-2);
        return newSelection;
      }
    });
  };
  
  // Helper to get change type label
  const getChangeTypeLabel = (changeType: string): string => {
    switch (changeType) {
      case 'edit': return 'Edited Metadata';
      case 'strip': return 'Stripped Metadata';
      case 'restore': return 'Restored from Version';
      case 'initial': return 'Initial Upload';
      default: return 'Changed Metadata';
    }
  };
  
  // Compare selected versions
  const handleCompare = () => {
    if (selectedVersions.length !== 2 || !onCompareVersions) return;
    onCompareVersions(selectedVersions[0], selectedVersions[1]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Clock className="mr-2 h-5 w-5 text-gray-500" /> Version History
        </h2>
        
        {onCompareVersions && selectedVersions.length === 2 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCompare}
            className="flex items-center"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Compare Versions
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <div className="flex justify-between">
            <h3 className="font-medium">Metadata Versions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {versions.length} {versions.length === 1 ? 'version' : 'versions'}
            </p>
          </div>
        </div>
        
        <div className="divide-y">
          {versions.map((version) => (
            <div key={version.id} className="bg-white dark:bg-gray-900">
              <div
                className={`px-4 py-3 flex items-center ${
                  currentVersionId === version.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                }`}
              >
                <div className="flex-1">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleVersionExpanded(version.id)}
                  >
                    {expandedVersion === version.id ? (
                      <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                    )}
                    
                    <div className="mr-3">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {getChangeTypeLabel(version.changeType)}
                        </span>
                        {currentVersionId === version.id && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(version.createdAt)}
                        {version.author && ` by ${version.author}`}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {onCompareVersions && (
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => toggleVersionSelection(version.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      aria-label={`Select version from ${formatDateTime(version.createdAt)}`}
                    />
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewVersion(version.id)}
                    title="View this version"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {currentVersionId !== version.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRestoreVersion(version.id)}
                      title="Restore this version"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onExportVersion && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onExportVersion(version.id)}
                      title="Export this version"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {expandedVersion === version.id && version.description && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm">
                  <p>{version.description}</p>
                </div>
              )}
            </div>
          ))}
          
          {versions.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No version history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory; 