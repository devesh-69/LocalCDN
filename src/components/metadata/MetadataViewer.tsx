'use client';

import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Info, Eye, EyeOff, Download, Edit } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface MetadataSection {
  title: string;
  data: Record<string, any>;
  expanded?: boolean;
}

export interface MetadataViewerProps {
  metadata: {
    basic: Record<string, any>;
    exif?: Record<string, any>;
    iptc?: Record<string, any>;
    xmp?: Record<string, any>;
    [key: string]: any;
  };
  onEdit?: () => void;
  onExport?: () => void;
  readOnly?: boolean;
}

/**
 * Component for displaying image metadata
 */
const MetadataViewer: React.FC<MetadataViewerProps> = ({
  metadata,
  onEdit,
  onExport,
  readOnly = false,
}) => {
  // State for expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    exif: false,
    iptc: false,
    xmp: false,
    custom: false,
  });

  // Toggle section expanded state
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Function to format metadata values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'number') {
      // Handle file size specially
      if (['size', 'fileSize'].includes(String(value))) {
        return formatFileSize(value);
      }
      return value.toString();
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Complex Object]';
      }
    }
    
    return String(value);
  };

  // Prepare metadata sections
  const sections: MetadataSection[] = [
    {
      title: 'Basic Information',
      data: metadata.basic || {},
      expanded: expandedSections.basic,
    },
  ];

  // Add EXIF section if available
  if (metadata.exif && Object.keys(metadata.exif).length > 0) {
    sections.push({
      title: 'EXIF Data',
      data: metadata.exif,
      expanded: expandedSections.exif,
    });
  }

  // Add IPTC section if available
  if (metadata.iptc && Object.keys(metadata.iptc).length > 0) {
    sections.push({
      title: 'IPTC Data',
      data: metadata.iptc,
      expanded: expandedSections.iptc,
    });
  }

  // Add XMP section if available
  if (metadata.xmp && Object.keys(metadata.xmp).length > 0) {
    sections.push({
      title: 'XMP Data',
      data: metadata.xmp,
      expanded: expandedSections.xmp,
    });
  }

  // Add custom metadata section if available
  if (metadata.custom && Object.keys(metadata.custom).length > 0) {
    sections.push({
      title: 'Custom Metadata',
      data: metadata.custom,
      expanded: expandedSections.custom,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Image Metadata</h2>
        <div className="flex space-x-2">
          {!readOnly && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Metadata
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>
      
      {sections.map((section, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 dark:bg-gray-800 px-4 py-3 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection(section.title.toLowerCase().split(' ')[0])}
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium">{section.title}</h3>
            </div>
            <Button variant="ghost" size="sm">
              {expandedSections[section.title.toLowerCase().split(' ')[0]] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {expandedSections[section.title.toLowerCase().split(' ')[0]] && (
            <div className="p-4">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-1/3">Property</Table.Head>
                    <Table.Head>Value</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.entries(section.data).map(([key, value]) => (
                    <Table.Row key={key}>
                      <Table.Cell className="font-medium">{key}</Table.Cell>
                      <Table.Cell className="truncate max-w-xs" title={formatValue(value)}>
                        {formatValue(value)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {Object.keys(section.data).length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={2} className="text-center text-gray-500 dark:text-gray-400">
                        No data available
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetadataViewer; 