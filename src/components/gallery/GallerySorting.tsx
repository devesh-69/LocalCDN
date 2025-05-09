'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

interface GallerySortingProps {
  currentSort: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'a-z', label: 'Name (A-Z)' },
  { value: 'z-a', label: 'Name (Z-A)' },
  { value: 'largest', label: 'Size (Largest)' },
  { value: 'smallest', label: 'Size (Smallest)' },
];

/**
 * Component for sorting gallery images
 */
const GallerySorting: React.FC<GallerySortingProps> = ({ currentSort = 'newest' }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Find the current sort label
  const currentSortLabel = sortOptions.find(option => option.value === currentSort)?.label || 'Newest First';
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };
  
  // Apply sorting
  const applySort = (sortValue: string) => {
    // Update URL with new sort parameter
    const url = new URL(window.location.href);
    
    if (sortValue === 'newest') {
      url.searchParams.delete('sort');
    } else {
      url.searchParams.set('sort', sortValue);
    }
    
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
        <ArrowUpDown className="h-4 w-4 mr-2" />
        <span className="mr-1">{currentSortLabel}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 z-10 border border-gray-200 dark:border-gray-700 py-1">
          {sortOptions.map(option => (
            <button
              key={option.value}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentSort === option.value ? 'bg-gray-100 dark:bg-gray-700 text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => applySort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GallerySorting; 