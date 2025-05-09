'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MetadataSearch from '@/components/metadata/MetadataSearch';
import ImageGrid from '@/components/gallery/ImageGrid';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/filters/FilterPanel';
import { Tag, Calendar, Filter as FilterIcon, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  filters?: {
    query?: string;
    dateRange?: {
      from?: string;
      to?: string;
    };
    fields?: Record<string, any>;
  };
}

/**
 * Search page for images
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  
  // Get the search query and filters from URL
  const searchQuery = searchParams.get('q') || '';
  const includePrivate = searchParams.get('includePrivate') === 'true';
  const sortOption = searchParams.get('sort') || 'createdAt:desc';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  
  // Extract metadata filters from URL params
  const initialFilters = Array.from(searchParams.entries())
    .filter(([key]) => 
      key !== 'q' && 
      key !== 'page' && 
      key !== 'limit' && 
      key !== 'includePrivate' &&
      key !== 'sort' &&
      key !== 'dateFrom' &&
      key !== 'dateTo'
    )
    .map(([field, value]) => ({ field, value }));
  
  // Add new state for filter panel visibility
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build search URL with all parameters
        let url = `/api/search/metadata?`;
        
        if (searchQuery) {
          url += `q=${encodeURIComponent(searchQuery)}&`;
        }
        
        // Add page and limit
        url += `page=${currentPage}&limit=${limit}&`;
        
        // Add sort option
        if (sortOption) {
          url += `sort=${encodeURIComponent(sortOption)}&`;
        }
        
        // Add date range if specified
        if (dateFrom) {
          url += `dateFrom=${encodeURIComponent(dateFrom)}&`;
        }
        
        if (dateTo) {
          url += `dateTo=${encodeURIComponent(dateTo)}&`;
        }
        
        // Add include private flag
        if (includePrivate) {
          url += 'includePrivate=true&';
        }
        
        // Add all filters from URL
        initialFilters.forEach(filter => {
          url += `${encodeURIComponent(filter.field)}=${encodeURIComponent(filter.value)}&`;
        });
        
        // Remove trailing ampersand
        url = url.replace(/&$/, '');
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data: SearchResponse = await response.json();
        setResults(data.results);
        setTotal(data.total);
        setSearchResponse(data);
        
        // Update limit if it's different in the response
        if (data.limit) {
          setLimit(data.limit);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [searchParams, currentPage, limit]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL with new page
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
  };
  
  // Handle filters from FilterPanel component
  const handleFiltersChange = (filters: Record<string, any>) => {
    // Update the URL with the new filters
    const url = new URL(window.location.href);
    
    // Clear existing filter params
    Array.from(url.searchParams.keys()).forEach(key => {
      if (
        key !== 'q' &&
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'sort' &&
        key !== 'includePrivate' &&
        key !== 'dateFrom' &&
        key !== 'dateTo'
      ) {
        url.searchParams.delete(key);
      }
    });
    
    // Add new filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values (like tags)
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value.toString());
      }
    });
    
    // Reset to page 1 when filters change
    url.searchParams.set('page', '1');
    
    // Update URL without reloading page
    window.history.pushState({}, '', url.toString());
    
    // Force refresh by setting the current page to 1
    setCurrentPage(1);
  };
  
  // Render active filters summary
  const renderActiveFilters = () => {
    if (!searchResponse?.filters) return null;
    
    return (
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
          <FilterIcon className="h-4 w-4 inline mr-1" />
          Active filters:
        </span>
        
        {searchResponse.filters.query && (
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full px-3 py-1 text-sm flex items-center">
            <span className="font-medium mr-1">Search:</span>
            <span className="mr-2">{searchResponse.filters.query}</span>
          </div>
        )}
        
        {searchResponse.filters.dateRange?.from && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full px-3 py-1 text-sm flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span className="font-medium mr-1">From:</span>
            <span className="mr-2">{new Date(searchResponse.filters.dateRange.from).toLocaleDateString()}</span>
          </div>
        )}
        
        {searchResponse.filters.dateRange?.to && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full px-3 py-1 text-sm flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span className="font-medium mr-1">To:</span>
            <span className="mr-2">{new Date(searchResponse.filters.dateRange.to).toLocaleDateString()}</span>
          </div>
        )}
        
        {searchResponse.filters.fields && Object.entries(searchResponse.filters.fields).map(([field, value]) => {
          if (field === 'tags' && Array.isArray(value)) {
            return value.map((tag, index) => (
              <div key={`tag-${index}`} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-sm flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1" />
                <span className="font-medium mr-1">Tag:</span>
                <span className="mr-2">{tag}</span>
              </div>
            ));
          }
          
          return (
            <div key={field} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-full px-3 py-1 text-sm flex items-center">
              <span className="font-medium mr-1">{field}:</span>
              <span className="mr-2">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>
          );
        })}
        
        {includePrivate && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full px-3 py-1 text-sm flex items-center">
            <span className="mr-2">Including private images</span>
          </div>
        )}
      </div>
    );
  };
  
  // Extract sort label
  const getSortLabel = () => {
    switch (sortOption) {
      case 'createdAt:desc': return 'Newest first';
      case 'createdAt:asc': return 'Oldest first';
      case 'title:asc': return 'Title (A-Z)';
      case 'title:desc': return 'Title (Z-A)';
      case 'size:desc': return 'Size (largest first)';
      case 'size:asc': return 'Size (smallest first)';
      default: return 'Sorted by: ' + sortOption;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Image Search</h1>
      
      <div className="mb-8">
        <MetadataSearch
          initialFilters={initialFilters}
          includePrivate={includePrivate}
        />
      </div>
      
      <div className="mb-8 flex items-center justify-between">
        {/* Toggle filter panel button */}
        <Button
          variant="outline"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showFilterPanel ? 'Hide Filters' : 'Show Advanced Filters'}
        </Button>
        
        {/* Sort selector (would be moved to a component in a real implementation) */}
        <div className="text-sm">
          <span className="text-gray-500 mr-2">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('sort', e.target.value);
              window.history.pushState({}, '', url.toString());
              // Force refresh
              setCurrentPage(currentPage);
            }}
            className="border rounded px-2 py-1"
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
      
      {/* Filter panel (collapsible) */}
      {showFilterPanel && (
        <div className="mb-8">
          <FilterPanel
            onFiltersChange={handleFiltersChange}
            initialFilters={initialFilters.reduce((acc, filter) => {
              acc[filter.field] = filter.value;
              return acc;
            }, {} as Record<string, any>)}
          />
        </div>
      )}
      
      {/* Show active filters */}
      {renderActiveFilters()}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Searching images...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap justify-between items-center">
            <h2 className="text-lg font-medium">
              {total} {total === 1 ? 'result' : 'results'} found
            </h2>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span>{getSortLabel()}</span>
            </div>
          </div>
          
          <ImageGrid images={results} />
          
          {total > limit && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(total / limit)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 