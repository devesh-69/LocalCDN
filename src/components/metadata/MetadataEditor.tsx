'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, X, Plus, Trash, AlertCircle } from 'lucide-react';
import { deepCopy } from '@/lib/utils';

interface CustomField {
  key: string;
  value: string;
}

export interface MetadataEditorProps {
  metadata: Record<string, any>;
  onSave: (metadata: Record<string, any>) => void;
  onCancel: () => void;
  allowCustomFields?: boolean;
  allowStripAll?: boolean;
}

/**
 * Component for editing image metadata
 */
const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onSave,
  onCancel,
  allowCustomFields = true,
  allowStripAll = true,
}) => {
  // State for edited metadata
  const [editedMetadata, setEditedMetadata] = useState<Record<string, any>>(deepCopy(metadata));
  // State for custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  // State for new custom field
  const [newField, setNewField] = useState<CustomField>({ key: '', value: '' });
  // State for error message
  const [error, setError] = useState<string | null>(null);
  
  // Initialize custom fields from metadata
  useEffect(() => {
    if (metadata.custom) {
      const fields = Object.entries(metadata.custom).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setCustomFields(fields);
    }
  }, [metadata]);
  
  // Handle standard field change
  const handleFieldChange = (
    section: string, 
    field: string, 
    value: string | boolean | number
  ) => {
    setEditedMetadata(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  
  // Handle custom field change
  const handleCustomFieldChange = (index: number, key: string, value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index] = { ...updatedFields[index], [key === 'key' ? 'key' : 'value']: value };
    setCustomFields(updatedFields);
  };
  
  // Add a new custom field
  const addCustomField = () => {
    if (!newField.key.trim()) {
      setError('Field name cannot be empty');
      return;
    }
    
    // Check for duplicate keys
    if (customFields.some(field => field.key === newField.key)) {
      setError('Field name already exists');
      return;
    }
    
    setCustomFields([...customFields, newField]);
    setNewField({ key: '', value: '' });
    setError(null);
  };
  
  // Remove a custom field
  const removeCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };
  
  // Handle save
  const handleSave = () => {
    // Convert custom fields to object
    const customMetadata = customFields.reduce((obj, field) => {
      obj[field.key] = field.value;
      return obj;
    }, {} as Record<string, string>);
    
    // Update custom metadata
    const updatedMetadata = {
      ...editedMetadata,
      custom: customMetadata,
    };
    
    onSave(updatedMetadata);
  };
  
  // Handle strip all metadata
  const handleStripAll = () => {
    // Keep only basic metadata
    setEditedMetadata({
      basic: editedMetadata.basic,
    });
    setCustomFields([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Edit Metadata</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      {allowStripAll && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Privacy Option</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Stripping metadata removes all EXIF, IPTC, and XMP data from the image, which may include location information and camera details.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 border-yellow-300 dark:border-yellow-600"
                onClick={handleStripAll}
              >
                Strip All Metadata
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Basic metadata section */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <h3 className="font-medium">Basic Information</h3>
        </div>
        <div className="p-4 space-y-4">
          {Object.entries(editedMetadata.basic || {}).map(([field, value]) => (
            <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label htmlFor={`basic-${field}`} className="font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <div className="md:col-span-2">
                <input
                  id={`basic-${field}`}
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value as string | number}
                  onChange={(e) => handleFieldChange(
                    'basic', 
                    field, 
                    typeof value === 'number' ? Number(e.target.value) : e.target.value
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                           focus:border-primary dark:bg-gray-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom fields section */}
      {allowCustomFields && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <h3 className="font-medium">Custom Metadata</h3>
          </div>
          <div className="p-4 space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <input
                    value={field.key}
                    onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                    placeholder="Field Name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                             shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                             focus:border-primary dark:bg-gray-900"
                  />
                </div>
                <div className="flex md:col-span-2">
                  <input
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md 
                             shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                             focus:border-primary dark:bg-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeCustomField(index)}
                    className="border-l-0 rounded-l-none"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Add new field controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <input
                  value={newField.key}
                  onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                  placeholder="New Field Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                           focus:border-primary dark:bg-gray-900"
                />
              </div>
              <div className="flex md:col-span-2">
                <input
                  value={newField.value}
                  onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md 
                           shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                           focus:border-primary dark:bg-gray-900"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addCustomField}
                  className="border-l-0 rounded-l-none"
                >
                  <Plus className="h-4 w-4 text-green-500" />
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-500 mt-2">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataEditor; 