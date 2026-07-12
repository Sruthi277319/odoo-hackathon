import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3.5 ${className}`}>
      {/* Description text */}
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
      </span>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="!p-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            className="w-8 h-8 !p-0"
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="!p-1.5"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
