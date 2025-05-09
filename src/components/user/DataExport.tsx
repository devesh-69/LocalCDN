'use client';

import React, { useState } from 'react';
import { Download, Database, FileArchive, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface ExportOptions {
  includeMetadata: boolean;
  includeOriginals: boolean;
  format: 'zip' | 'json' | 'csv';
}

export function DataExport() {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeOriginals: true,
    format: 'zip'
  });
  const [showProgress, setShowProgress] = useState(false);

  // Handle option changes
  const handleOptionChange = (
    key: keyof ExportOptions, 
    value: boolean | 'zip' | 'json' | 'csv'
  ) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Start the export process
  const handleExport = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to export data');
      return;
    }

    setIsExporting(true);
    setShowProgress(true);
    setExportProgress(0);
    
    try {
      // Simulate a progress update (in a real app, you'd get progress from the server)
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 500);

      const response = await fetch('/api/user/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `localcdn-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      // Keep progress visible briefly on success before hiding
      setTimeout(() => {
        setIsExporting(false);
        setShowProgress(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Data Export</h2>
      </div>
      
      <Card className="p-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export all your personal data and images from LocalCDN. 
            You can choose to include metadata and select different export formats.
          </p>
          
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="include-metadata" className="font-medium">Include Metadata</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export image tags, descriptions, and other metadata
                </p>
              </div>
              <Switch 
                id="include-metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) => handleOptionChange('includeMetadata', checked)}
                disabled={isExporting}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="include-originals" className="font-medium">Include Original Files</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export original image files (larger file size)
                </p>
              </div>
              <Switch 
                id="include-originals"
                checked={options.includeOriginals}
                onCheckedChange={(checked) => handleOptionChange('includeOriginals', checked)}
                disabled={isExporting}
              />
            </div>
          </div>
          
          <div className="pt-3">
            <Label className="font-medium mb-2 block">Export Format</Label>
            <RadioGroup 
              value={options.format} 
              onValueChange={(value) => handleOptionChange('format', value as 'zip' | 'json' | 'csv')}
              className="space-y-2"
              disabled={isExporting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zip" id="format-zip" />
                <Label htmlFor="format-zip" className="flex items-center">
                  <FileArchive className="h-4 w-4 mr-2" />
                  ZIP Archive (Images + Metadata)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="format-json" />
                <Label htmlFor="format-json" className="flex items-center">
                  <FileImage className="h-4 w-4 mr-2" />
                  JSON (Metadata only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  CSV (Metadata only)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Card>
      
      {showProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Preparing export...</span>
            <span>{Math.round(exportProgress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${exportProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        The export process may take a few minutes depending on the amount of data
      </p>
    </div>
  );
} 