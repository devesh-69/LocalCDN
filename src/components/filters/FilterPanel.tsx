'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  Filter, Save, Settings, Sliders, Tag, CalendarRange, 
  Camera, ArrowUpDown, Check, X, PlusCircle 
} from 'lucide-react';

interface FilterCategory {
  id: string;
  name: string;
  type: 'tags' | 'select' | 'range' | 'date';
  options?: { value: string; label: string }[];
  field: string;
  icon?: React.ReactNode;
}

interface FilterValue {
  category: string;
  field: string;
  value: string | number | [number, number] | [string, string];
  label?: string;
}

interface FilterPanelProps {
  onFiltersChange?: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
  className?: string;
}

/**
 * Advanced filter panel component
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = '',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Define filter categories
  const filterCategories: FilterCategory[] = [
    {
      id: 'tags',
      name: 'Tags',
      type: 'tags',
      field: 'tags',
      icon: <Tag className="h-4 w-4" />,
    },
    {
      id: 'camera',
      name: 'Camera',
      type: 'select',
      field: 'metadata.camera',
      icon: <Camera className="h-4 w-4" />,
      options: [
        // These would be dynamically loaded from an API
        { value: 'Canon EOS R5', label: 'Canon EOS R5' },
        { value: 'Sony A7IV', label: 'Sony A7IV' },
        { value: 'Nikon Z9', label: 'Nikon Z9' },
        { value: 'Fujifilm X-T4', label: 'Fujifilm X-T4' },
      ],
    },
    {
      id: 'captureDate',
      name: 'Capture Date',
      type: 'date',
      field: 'metadata.captureDate',
      icon: <CalendarRange className="h-4 w-4" />,
    },
    {
      id: 'dimensions',
      name: 'Dimensions',
      type: 'select',
      field: 'dimensions',
      icon: <ArrowUpDown className="h-4 w-4" />,
      options: [
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'square', label: 'Square' },
        { value: 'panorama', label: 'Panorama' },
      ],
    },
  ];
  
  // State for active filters
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory | null>(null);
  const [tempFilterValue, setTempFilterValue] = useState<string>('');
  
  // Load initial filters and tags
  useEffect(() => {
    // Fetch available tags 
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    
    fetchTags();
    
    // Parse URL params to set initial filter state
    const filters: FilterValue[] = [];
    
    searchParams.forEach((value, key) => {
      // Skip non-filter params
      if (['q', 'page', 'limit', 'sort', 'includePrivate'].includes(key)) {
        return;
      }
      
      // Find matching category
      const category = filterCategories.find(cat => cat.field === key);
      if (category) {
        filters.push({
          category: category.id,
          field: key,
          value: value,
          label: category.type === 'select' 
            ? category.options?.find(opt => opt.value === value)?.label
            : value
        });
      }
    });
    
    setActiveFilters(filters);
  }, []);
  
  // Update URL and notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      const filterObject: Record<string, any> = {};
      
      activeFilters.forEach(filter => {
        filterObject[filter.field] = filter.value;
      });
      
      onFiltersChange(filterObject);
    }
  }, [activeFilters, onFiltersChange]);
  
  // Handle filter selection
  const handleSelectCategory = (category: FilterCategory) => {
    setSelectedCategory(category);
    setTempFilterValue('');
  };
  
  // Add a filter
  const addFilter = () => {
    if (!selectedCategory || !tempFilterValue) return;
    
    const newFilter: FilterValue = {
      category: selectedCategory.id,
      field: selectedCategory.field,
      value: tempFilterValue,
    };
    
    // For select filters, also store the label
    if (selectedCategory.type === 'select') {
      const option = selectedCategory.options?.find(opt => opt.value === tempFilterValue);
      if (option) {
        newFilter.label = option.label;
      }
    }
    
    setActiveFilters(prev => [...prev, newFilter]);
    setTempFilterValue('');
    setSelectedCategory(null);
  };
  
  // Remove a filter
  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
  };
  
  // Render filter input based on type
  const renderFilterInput = () => {
    if (!selectedCategory) return null;
    
    switch (selectedCategory.type) {
      case 'tags':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Select Tag</label>
            <div className="relative">
              <input
                type="text"
                value={tempFilterValue}
                onChange={(e) => setTempFilterValue(e.target.value)}
                placeholder="Type or select a tag..."
                className="w-full px-3 py-2 border rounded-md"
                list="available-tags"
              />
              <datalist id="available-tags">
                {availableTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Select {selectedCategory.name}</label>
            <select
              value={tempFilterValue}
              onChange={(e) => setTempFilterValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select an option</option>
              {selectedCategory.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'date':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={tempFilterValue}
              onChange={(e) => setTempFilterValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-medium flex items-center text-gray-800 dark:text-gray-200">
          <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          Advanced Filters
        </h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="link" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs text-gray-500 dark:text-gray-400"
            disabled={activeFilters.length === 0}
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Active filters:</div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => {
                const category = filterCategories.find(c => c.id === filter.category);
                return (
                  <div 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                  >
                    {category?.icon && <span className="mr-1">{category.icon}</span>}
                    <span className="font-medium">{category?.name}:</span>
                    <span className="ml-1 mr-2">
                      {filter.label || filter.value.toString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFilter(index)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="Remove filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Filter selection */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by:</div>
          <div className="flex flex-wrap gap-2">
            {filterCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleSelectCategory(category)}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                  selectedCategory?.id === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {category.icon}
                <span className="ml-1">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter input */}
        {selectedCategory && (
          <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
            <div className="mb-3">
              <h3 className="font-medium text-sm mb-2">
                Add filter: {selectedCategory.name}
              </h3>
              {renderFilterInput()}
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="mr-2"
              >
                Cancel
              </Button>
              
              <Button
                size="sm"
                onClick={addFilter}
                disabled={!tempFilterValue}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add Filter
              </Button>
            </div>
          </div>
        )}
        
        {/* Save filter preset (future feature) */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full"
            onClick={() => alert('Save filter preset feature will be implemented in a future update.')}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Save as preset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 