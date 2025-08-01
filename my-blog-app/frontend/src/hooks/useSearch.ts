import { useState, useRef, useCallback } from 'react';

interface BlogPost {
  id: string;
  title: string;
  tags: string[];
  excerpt: string;
}

interface UseSearchOptions {
  allPosts: BlogPost[];
  popularSearches: string[];
}

export const useSearch = ({ popularSearches }: Omit<UseSearchOptions, 'allPosts'>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update suggestions
    if (query.length > 0) {
      const suggestions = popularSearches.filter(search => 
        search.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      // Filter posts logic would be handled in the parent component
      setIsSearching(false);
    }, 300);
  }, [popularSearches]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    debouncedSearch(suggestion);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    showSuggestions,
    setShowSuggestions,
    searchSuggestions,
    isSearching,
    debouncedSearch,
    handleSuggestionClick
  };
};
