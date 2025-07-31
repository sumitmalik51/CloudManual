import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  categories: string[];
  tags: string[];
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  categories: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  sortBy: 'latest' | 'popular' | 'trending' | 'oldest';
  readingTime: {
    min?: number;
    max?: number;
  };
  author?: string;
}

const AdvancedSearchFilters: React.FC<SearchFiltersProps> = ({
  categories,
  tags,
  onFiltersChange,
  initialFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      categories: [],
      tags: [],
      dateRange: {},
      sortBy: 'latest',
      readingTime: {},
      author: undefined
    }
  );
  const [searchTags, setSearchTags] = useState('');

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const toggleCategory = useCallback((category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    handleFilterChange({ categories: newCategories });
  }, [filters.categories, handleFilterChange]);

  const toggleTag = useCallback((tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange({ tags: newTags });
  }, [filters.tags, handleFilterChange]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      categories: [],
      tags: [],
      dateRange: {},
      sortBy: 'latest',
      readingTime: {},
      author: undefined
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.readingTime.min ||
    filters.readingTime.max ||
    filters.author;

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchTags.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100">
            {filters.categories.length + filters.tags.length}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTags}
                  onChange={(e) => setSearchTags(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredTags.slice(0, 10).map(tag => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Date Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.start || ''}
                      onChange={(e) => handleFilterChange({ 
                        dateRange: { ...filters.dateRange, start: e.target.value } 
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.end || ''}
                      onChange={(e) => handleFilterChange({ 
                        dateRange: { ...filters.dateRange, end: e.target.value } 
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Reading Time */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Reading Time (minutes)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={filters.readingTime.min || ''}
                      onChange={(e) => handleFilterChange({ 
                        readingTime: { ...filters.readingTime, min: parseInt(e.target.value) || undefined } 
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="30"
                      value={filters.readingTime.max || ''}
                      onChange={(e) => handleFilterChange({ 
                        readingTime: { ...filters.readingTime, max: parseInt(e.target.value) || undefined } 
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-2">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'latest', label: 'Latest' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'trending', label: 'Trending' },
                    { value: 'oldest', label: 'Oldest' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange({ sortBy: option.value as any })}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        filters.sortBy === option.value
                          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div className="lg:col-span-2">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Author</h4>
                <input
                  type="text"
                  placeholder="Filter by author name..."
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange({ author: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-2">
                  {filters.categories.map(category => (
                    <span key={`cat-${category}`} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-800 dark:text-blue-100">
                      {category}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {filters.tags.map(tag => (
                    <span key={`tag-${tag}`} className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-800 dark:text-green-100">
                      #{tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchFilters;
