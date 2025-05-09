import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
}

/**
 * Pagination component for navigating through multi-page content
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageButtons = 5,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      // If we have fewer pages than buttons, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate range to show
    const leftSide = Math.floor(maxPageButtons / 2);
    const rightSide = maxPageButtons - leftSide;
    
    // Default case: show pages centered around current page
    let startPage = Math.max(currentPage - leftSide, 1);
    let endPage = Math.min(currentPage + rightSide, totalPages);
    
    // Adjust if we're near the beginning
    if (currentPage - 1 < leftSide) {
      endPage = Math.min(maxPageButtons, totalPages);
    }
    
    // Adjust if we're near the end
    if (totalPages - currentPage < rightSide) {
      startPage = Math.max(totalPages - maxPageButtons + 1, 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };
  
  // Handler for page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  // Don't render pagination for a single page
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-1">
        {/* Previous Page Button */}
        <li>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        
        {/* First Page (if not in view) */}
        {pageNumbers[0] > 1 && (
          <>
            <li>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(1)}
                aria-label="Page 1"
              >
                1
              </Button>
            </li>
            {pageNumbers[0] > 2 && (
              <li className="px-2 text-gray-400">...</li>
            )}
          </>
        )}
        
        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          </li>
        ))}
        
        {/* Last Page (if not in view) */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li className="px-2 text-gray-400">...</li>
            )}
            <li>
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                aria-label={`Page ${totalPages}`}
              >
                {totalPages}
              </Button>
            </li>
          </>
        )}
        
        {/* Next Page Button */}
        <li>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 