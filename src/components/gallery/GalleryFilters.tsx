'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Filter, ChevronDown } from 'lucide-react';

interface GalleryFiltersProps {
  currentFilter: string;
}

const filterOptions = [
  { value: 'all', label: 'All Images' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'public', label: 'Public Images' },
  { value: 'private', label: 'Private Images' },
  { value: 'photos', label: 'Photos' },
  { value: 'vectors', label: 'Vector Images' },
];

/**
 * Component for filtering gallery images
 */
const GalleryFilters: React.FC<GalleryFiltersProps> = ({ currentFilter = 'all' }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Find the current filter label
  const currentFilterLabel = filterOptions.find(option => option.value === currentFilter)?.label || 'All Images';
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };
  
  // Apply filter
  const applyFilter = (filterValue: string) => {
    // Update URL with new filter parameter
    const url = new URL(window.location.href);
    
    if (filterValue === 'all') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', filterValue);
    }
    
    // Reset page to 1 when filter changes
    url.searchParams.set('page', '1');
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Navigate to new URL
    router.push(url.toString());
  };
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center"
      >
        <Filter className="h-4 w-4 mr-2" />
        <span className="mr-1">{currentFilterLabel}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 z-10 border border-gray-200 dark:border-gray-700 py-1">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentFilter === option.value ? 'bg-gray-100 dark:bg-gray-700 text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => applyFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryFilters; 