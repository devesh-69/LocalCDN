'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  Search, X, Filter, Plus, Calendar, Tag, 
  Image as ImageIcon, SlidersHorizontal, ChevronDown, Save
} from 'lucide-react';
import { Popover } from '@/components/ui/Popover';
import { useDebounce } from '@/hooks/useDebounce';
import SavedSearches from '@/components/metadata/SavedSearches';

interface MetadataFilter {
  field: string;
  value: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface MetadataSearchProps {
  initialFilters?: MetadataFilter[];
  includePrivate?: boolean;
}

/**
 * Component for searching images by metadata
 */
const MetadataSearch: React.FC<MetadataSearchProps> = ({ 
  initialFilters = [],
  includePrivate = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get the initial search query and sort
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'createdAt:desc';
  
  // State for search query
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);
  // State for filters
  const [filters, setFilters] = useState<MetadataFilter[]>(initialFilters);
  // State for new filter being added
  const [newFilter, setNewFilter] = useState<MetadataFilter>({ field: '', value: '' });
  // State for including private images
  const [showPrivate, setShowPrivate] = useState(includePrivate);
  // State for sorting
  const [sortOption, setSortOption] = useState<string>(initialSort);
  // State for date range
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  // State for suggested tags
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  // Ref for the filter container
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Add state for search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const storedRecentSearches = localStorage.getItem('recentSearches');
    if (storedRecentSearches) {
      try {
        const parsedSearches = JSON.parse(storedRecentSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);
  
  // Add suggestion highlight handling
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  
  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate search suggestions based on input
  useEffect(() => {
    if (!query) {
      setSearchSuggestions([]);
      return;
    }
    
    // Generate suggestions based on query and recent searches
    const generateSuggestions = async () => {
      // Start with recent searches that match the query
      const matchingRecentSearches = recentSearches
        .filter(search => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);
      
      // Call the tags API to get matching tags
      try {
        const response = await fetch(`/api/tags?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          const tagSuggestions = data.tags.map((tag: string) => `tag:${tag}`);
          
          // Combine both sources of suggestions
          const allSuggestions = [...matchingRecentSearches, ...tagSuggestions];
          
          // Filter out duplicates and limit to 8 suggestions
          const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 8);
          
          setSearchSuggestions(uniqueSuggestions);
        }
      } catch (error) {
        console.error('Error fetching tag suggestions:', error);
      }
    };
    
    if (query.length >= 2) {
      generateSuggestions();
    } else {
      setSearchSuggestions([]);
    }
  }, [query, recentSearches]);
  
  // Update suggestions visibility based on input focus and suggestions availability
  const handleInputFocus = () => {
    if (query && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  // Handle special keys for navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape key closes suggestions
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      return;
    }
    
    // Only handle up/down/enter if suggestions are showing
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    // Up arrow
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSuggestion(prev => 
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } 
    // Down arrow
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSuggestion(prev => 
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } 
    // Enter key
    else if (e.key === 'Enter' && highlightedSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(searchSuggestions[highlightedSuggestion]);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setHighlightedSuggestion(-1);
    
    // If it's a tag suggestion, add it as a filter
    if (suggestion.startsWith('tag:')) {
      const tag = suggestion.substring(4);
      const newFilterValue = { field: 'tags', value: tag };
      setFilters(prev => [...prev, newFilterValue]);
      setQuery('');
    } else {
      // Otherwise, use as search query
      handleSearch(suggestion);
    }
  };
  
  // Track recent searches
  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery) return;
    
    // Add to recent searches (limited to 10 items)
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  // Update handle search function
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    // Update query in URL
    const params = new URLSearchParams(window.location.search);
    params.set('q', searchQuery);
    params.set('page', '1'); // Reset to first page
    
    if (showPrivate) {
      params.set('includePrivate', 'true');
    } else {
      params.delete('includePrivate');
    }
    
    // Add the selected sort option if it's not the default
    if (sortOption !== 'createdAt:desc') {
      params.set('sort', sortOption);
    } else {
      params.delete('sort');
    }
    
    // Add any date range filters
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    } else {
      params.delete('dateFrom');
    }
    
    if (dateTo) {
      params.set('dateTo', dateTo);
    } else {
      params.delete('dateTo');
    }
    
    // Add current filters to URL
    filters.forEach(filter => {
      // For tags, we need to handle multiple tags differently
      params.append(filter.field, filter.value);
    });
    
    // Navigate to search page with params
    router.push(`/search?${params.toString()}`);
    
    // Close suggestions
    setShowSuggestions(false);
    
    // Add to recent searches
    addToRecentSearches(searchQuery);
  };
  
  // Get current query string for saved searches
  const getCurrentQueryString = (): string => {
    const params = new URLSearchParams();
    
    if (query) {
      params.set('q', query);
    }
    
    if (showPrivate) {
      params.set('includePrivate', 'true');
    }
    
    if (sortOption !== 'createdAt:desc') {
      params.set('sort', sortOption);
    }
    
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    }
    
    if (dateTo) {
      params.set('dateTo', dateTo);
    }
    
    filters.forEach(filter => {
      params.append(filter.field, filter.value);
    });
    
    return `?${params.toString()}`;
  };
  
  // Common metadata fields for dropdown suggestions
  const commonFields = [
    { value: 'camera', label: 'Camera' },
    { value: 'lens', label: 'Lens' },
    { value: 'make', label: 'Make' },
    { value: 'model', label: 'Model' },
    { value: 'exif.iso', label: 'ISO' },
    { value: 'exif.focalLength', label: 'Focal Length' },
    { value: 'exif.aperture', label: 'Aperture' },
    { value: 'exif.exposureTime', label: 'Exposure Time' },
    { value: 'custom.location', label: 'Location' },
    { value: 'custom.event', label: 'Event' },
    { value: 'custom.people', label: 'People' },
    { value: 'tags', label: 'Tag' },
  ];
  
  // Sort options
  const sortOptions: SortOption[] = [
    { value: 'createdAt:desc', label: 'Newest first' },
    { value: 'createdAt:asc', label: 'Oldest first' },
    { value: 'title:asc', label: 'Title (A-Z)' },
    { value: 'title:desc', label: 'Title (Z-A)' },
    { value: 'size:desc', label: 'Size (largest first)' },
    { value: 'size:asc', label: 'Size (smallest first)' },
  ];
  
  // Fetch tag suggestions when the component mounts
  useEffect(() => {
    const fetchTagSuggestions = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setTagSuggestions(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tag suggestions:', error);
      }
    };
    
    fetchTagSuggestions();
  }, []);
  
  // Auto-search when query changes (debounced)
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      handleSearch();
    }
  }, [debouncedQuery]);
  
  // Add a new filter
  const addFilter = () => {
    if (newFilter.field && newFilter.value) {
      setFilters([...filters, { ...newFilter }]);
      setNewFilter({ field: '', value: '' });
    }
  };
  
  // Remove a filter
  const removeFilter = (index: number) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
    setDateFrom('');
    setDateTo('');
    setSortOption('createdAt:desc');
  };
  
  // Save current search as a preset
  const saveSearchPreset = () => {
    // Implementation for saving search presets would be added here
    alert('Search preset saving functionality will be implemented in a future update.');
  };
  
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Search input */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) {
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search images by title, description, tags, or metadata..."
              className="block w-full pl-10 pr-3 py-3 text-sm rounded-tl-lg rounded-bl-lg border-0 focus:ring-0 dark:bg-gray-900 dark:text-white"
            />
            
            {query && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setQuery('')}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
            
            {/* Search suggestions dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg"
              >
                <ul className="py-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center ${
                          index === highlightedSuggestion ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        {suggestion.startsWith('tag:') ? (
                          <>
                            <Tag className="h-4 w-4 mr-2 text-blue-500" />
                            <span>
                              Tag: <strong>{suggestion.substring(4)}</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2 text-gray-400" />
                            {suggestion}
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <Button
            onClick={() => handleSearch()}
            className="px-4 py-2 rounded-tr-lg rounded-br-lg"
          >
            Search
          </Button>
        </div>
      </div>
      
      {/* Advanced search options */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Active filters */}
        <div className="col-span-2">
          <div className="flex flex-wrap gap-2 items-center">
            {filters.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
                Filters:
              </span>
            )}
            
            {filters.map((filter, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs flex items-center"
              >
                <span className="mr-2">
                  {filter.field === 'tags' ? `Tag: ${filter.value}` : `${filter.field}: ${filter.value}`}
                </span>
                <button
                  onClick={() => removeFilter(index)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {filters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            )}
            
            {!showAdvanced && (
              <button
                onClick={() => setShowAdvanced(true)}
                className="ml-auto text-xs text-blue-600 dark:text-blue-400 flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add filter
              </button>
            )}
          </div>
        </div>
        
        {/* Right: Saved searches and options */}
        <div className="flex items-center space-x-2 justify-end">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePrivate"
              checked={showPrivate}
              onChange={(e) => setShowPrivate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includePrivate" className="text-sm text-gray-700 dark:text-gray-300">
              Include private
            </label>
          </div>
          
          <SavedSearches 
            currentQueryString={getCurrentQueryString()}
            className="w-40"
          />
        </div>
      </div>
      
      {/* Advanced filter section (collapsible) */}
      {showAdvanced && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {/* Filter selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Filter Type
              </label>
              <select
                value={newFilter.field}
                onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value, value: '' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              >
                <option value="">Select a filter type</option>
                <option value="tags">Tag</option>
                <option value="metadata.camera">Camera</option>
                <option value="metadata.make">Make</option>
                <option value="metadata.model">Model</option>
                <option value="metadata.lens">Lens</option>
                <option value="metadata.iso">ISO</option>
                <option value="metadata.focalLength">Focal Length</option>
                <option value="metadata.aperture">Aperture</option>
                <option value="metadata.location">Location</option>
                <option value="format">File Format</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Value
              </label>
              <input
                type="text"
                value={newFilter.value}
                onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                placeholder="Enter filter value"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={addFilter}
                disabled={!newFilter.field || !newFilter.value}
                className="mr-2"
              >
                Add Filter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Date range filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                <SlidersHorizontal className="inline-block h-4 w-4 mr-1" />
                Sort By
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="title:asc">Title (A-Z)</option>
                <option value="title:desc">Title (Z-A)</option>
                <option value="size:desc">Size (largest first)</option>
                <option value="size:asc">Size (smallest first)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataSearch; 