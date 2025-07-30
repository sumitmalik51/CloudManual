import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/seo/SEOHead';
import ErrorMessage from '../components/ui/ErrorMessage';
import TopicsModal from '../components/ui/TopicsModal';
import PageTransition from '../components/ui/PageTransition';
import { blogAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReaders: 0,
    categories: 0
  });

  // Topics data for modal
  const topicsData = [
    {
      name: 'Cloud Architecture',
      count: Math.floor(stats.totalPosts * 0.25),
      color: 'from-blue-500 to-cyan-500',
      description: 'Azure, AWS, and multi-cloud architecture patterns and best practices'
    },
    {
      name: 'DevOps & CI/CD',
      count: Math.floor(stats.totalPosts * 0.20),
      color: 'from-green-500 to-emerald-500',
      description: 'Automation, deployment pipelines, and infrastructure as code'
    },
    {
      name: 'AI & Machine Learning',
      count: Math.floor(stats.totalPosts * 0.20),
      color: 'from-purple-500 to-pink-500',
      description: 'AI implementation, ML models, and intelligent automation'
    },
    {
      name: 'Containerization',
      count: Math.floor(stats.totalPosts * 0.20),
      color: 'from-orange-500 to-red-500',
      description: 'Docker, Kubernetes, and container orchestration'
    },
    {
      name: 'Development Tools',
      count: Math.floor(stats.totalPosts * 0.15),
      color: 'from-indigo-500 to-purple-500',
      description: 'IDEs, frameworks, and productivity tools for developers'
    }
  ];
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxHomePosts = 10; // Limit homepage to 10 posts

  // Dark mode state - you can connect this to a context or localStorage
  const [isDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Utility function to estimate reading time
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Sample search suggestions (in real app, this would come from API)
  const popularSearches = [
    'GitHub Copilot tutorial',
    'Azure container apps',
    'Docker best practices',
    'Kubernetes deployment',
    'AI model implementation',
    'DevOps automation',
    'TypeScript performance',
    'Cloud architecture patterns'
  ];

  // Enhanced debounced search function with suggestions
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
      // In a real app, this would call the API with search params
      const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content?.toLowerCase().includes(query.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setPosts(filtered);
      setIsSearching(false);
    }, 300);
  }, [allPosts, popularSearches]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    debouncedSearch(suggestion);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    
    setNewsletterStatus('loading');
    
    // Simulate API call (replace with actual newsletter service integration)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNewsletterStatus('success');
      setNewsletterEmail('');
      
      // Reset status after 3 seconds
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    } catch {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  // Enhanced fetch function
  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const data = await blogAPI.getPosts({ 
        limit: showAllPosts ? undefined : maxHomePosts,
        ...(category !== 'All' && { category: category })
      });
      
      setPosts(data.posts);
      setAllPosts(data.posts);
      // Simulate stats (in real app, this would come from API)
      setStats({
        totalPosts: data.pagination?.totalPosts || data.posts.length,
        totalViews: Math.floor(Math.random() * 50000) + 10000,
        totalReaders: Math.floor(Math.random() * 5000) + 1000,
        categories: categories.length - 1
      });
      
      setLoading(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }, [category, showAllPosts, maxHomePosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = ['All', 'Cloud', 'DevOps', 'AI', 'Security', 'WebDev'];

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPosts([]);
    setShowAllPosts(false);
    setLoading(true);
  };

  const handleViewAllPosts = () => {
    setShowAllPosts(true);
    setLoading(true);
  };

  const handleShowLess = () => {
    setShowAllPosts(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikePost = async (postSlug: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const result = await blogAPI.likePost(postSlug);
      
      // Update the posts state with the new like count
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.slug === postSlug 
            ? { ...post, likes: result.likes }
            : post
        )
      );
      
      setAllPosts(prevPosts => 
        prevPosts.map(post => 
          post.slug === postSlug 
            ? { ...post, likes: result.likes }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      // Optional: show a toast notification for errors
    }
  };

  return (
    <PageTransition>
      <Layout>
        <SEOHead
          title="CloudManual - Your Guide to Cloud Technologies"
          description="Comprehensive guides, tutorials, and best practices for cloud computing, Azure, AWS, DevOps, and modern web development."
          keywords={['cloud computing', 'Azure', 'AWS', 'DevOps', 'tutorials', 'web development', 'programming']}
          url={window.location.href}
          type="website"
        />
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-32 px-6 text-center overflow-visible"
        style={{ zIndex: 1 }}
      >
        {/* Enhanced Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Floating Tech Icons */}
          <div className="absolute top-20 right-1/4 text-white/10 animate-float">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.5 5-6.5h-3.053c.258-3.531 3.249-6.297 6.863-6.485v2.485l6.5-5-6.5-5v2.5zm-3 20c5.621 0 10.211-4.443 10.475-10h3.025l-5-6.5-5 6.5h3.053c-.258 3.531-3.249 6.297-6.863 6.485v-2.485l-6.5 5 6.5 5v-2.5z"/>
            </svg>
          </div>
          <div className="absolute bottom-32 right-16 text-white/10 animate-float-delayed">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="absolute top-1/3 left-16 text-white/10 animate-float">
            <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* AI-Powered Modern Title */}
          <div className="mb-8">
            {/* Main Title with AI Effects */}
            <div className="relative text-center">
              {/* Main CloudManual Text */}
              <h1 className="relative text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none">
                <span className="ai-title-text">
                  CloudManual
                </span>
              </h1>
              
              {/* AI Subtitle */}
              <div className="text-center mb-6">
                <p className="text-xl md:text-2xl text-cyan-100 font-light tracking-wide opacity-90">
                  Powered by AI • Guided by Experts • Built for the Future
                </p>
              </div>
            </div>
            
            {/* Live Badge - Clickable */}
            <div className="flex justify-center mb-6">
              <Link 
                to="/whats-new"
                className="group flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:animate-bounce"></div>
                <span className="text-sm font-semibold text-green-100 group-hover:text-white">Live & Updated Daily</span>
                <svg className="w-4 h-4 text-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <p className="text-xl md:text-3xl mb-12 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-lg text-blue-100">
            Your modern guide to Cloud, AI, and DevOps — hands-on, simplified, and real-world focused.
          </p>
          
          {/* Premium Search Bar with Autocomplete & Animations */}
          <div className="max-w-3xl mx-auto mb-12 relative z-50">
            <div className="relative group cursor-text" onClick={() => searchInputRef.current?.focus()}>
              {/* Animated Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-lg transition-all duration-700 ${
                searchFocused ? 'opacity-80 scale-110 animate-pulse' : 'opacity-30 group-hover:opacity-60 group-hover:scale-105'
              }`}></div>
              
              {/* Moving Border Animation */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl transition-all duration-1000 ${
                  searchFocused || 'group-hover:animate-shimmer'
                }`} style={{
                  background: searchFocused ? 
                    'linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)' :
                    'linear-gradient(-45deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: searchFocused ? 'shimmer 2s ease-in-out infinite' : undefined
                }}></div>
              </div>
              
              {/* Main Search Container */}
              <div className={`relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 p-2 transition-all duration-500 transform ${
                searchFocused ? 'shadow-2xl ring-4 ring-blue-200/50 scale-110' : 'shadow-2xl hover:shadow-3xl hover:scale-105'
              }`}>
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <svg className={`h-6 w-6 transition-all duration-500 ${
                        searchFocused ? 'text-blue-500 scale-110' : 'text-gray-400 group-hover:text-blue-400 group-hover:scale-105'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="e.g., GitHub Copilot, Azure Bicep, Docker, TypeScript..."
                      value={searchQuery}
                      onFocus={() => {
                        setSearchFocused(true);
                        if (searchQuery.length > 0) setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        setSearchFocused(false);
                        // Delay hiding suggestions to allow clicks
                        setTimeout(() => setShowSuggestions(false), 150);
                      }}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setShowSuggestions(false);
                          debouncedSearch(searchQuery);
                          // Optional: Navigate to blog page with search
                          // window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                      className="w-full pl-14 pr-6 py-4 text-lg text-gray-800 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-16 flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    )}
                    
                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-16 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto backdrop-blur-xl"
                           style={{ zIndex: 999999 }}>
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                            Popular Searches
                          </div>
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center group"
                            >
                              <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <span className="text-sm">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link 
                    to="/blog"
                    className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Explore</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Search Tags with toggleable filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Azure', 'AWS', 'Docker', 'Kubernetes', 'AI/ML', 'DevOps'].map((tag) => {
                const isActive = activeFilters.includes(tag) || searchQuery === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isActive) {
                        setActiveFilters(prev => prev.filter(f => f !== tag));
                        setSearchQuery('');
                        debouncedSearch('');
                      } else {
                        setActiveFilters(prev => [...prev, tag]);
                        setSearchQuery(tag);
                        debouncedSearch(tag);
                      }
                    }}
                    className={`group relative px-4 py-2 backdrop-blur-sm rounded-lg font-medium transition-all duration-300 border transform hover:scale-105 hover:-translate-y-1 ${
                      isActive 
                        ? 'bg-white/25 text-white border-white/40 shadow-lg' 
                        : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/20 hover:border-white/30'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-100' 
                        : 'bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100'
                    }`}></div>
                    <span className="relative z-10">{tag}</span>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              to="/blog"
              className="group inline-flex items-center justify-center bg-white text-indigo-900 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-3xl"
            >
              <span className="text-2xl mr-3">📚</span>
              <span>Explore Articles</span>
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button 
              className="group inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-2xl hover:bg-white hover:text-indigo-900 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
            >
              <span className="text-2xl mr-3">🎥</span>
              <span>Watch Tutorials</span>
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Enhanced Live Stats with Tooltips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { 
                label: 'Articles', 
                value: stats.totalPosts.toLocaleString(), 
                icon: '📚', 
                color: 'from-blue-500 to-cyan-500',
                tooltip: 'Total published articles covering cloud, AI, and DevOps topics',
                clickable: false
              },
              { 
                label: 'Readers', 
                value: `${Math.floor(stats.totalReaders / 1000)}K+`, 
                icon: '👥', 
                color: 'from-purple-500 to-pink-500',
                tooltip: 'Monthly active readers engaging with our content',
                clickable: false
              },
              { 
                label: 'Views', 
                value: `${Math.floor(stats.totalViews / 1000)}K+`, 
                icon: '👁️', 
                color: 'from-green-500 to-emerald-500',
                tooltip: 'Total unique article views in the past 30 days',
                clickable: false
              },
              { 
                label: 'Topics', 
                value: stats.categories.toString(), 
                icon: '🏷️', 
                color: 'from-orange-500 to-red-500',
                tooltip: 'Click to explore our content taxonomy and topic breakdown',
                clickable: true
              },
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`group text-center transform hover:scale-110 transition-all duration-500 relative ${
                  stat.clickable ? 'cursor-pointer' : ''
                }`}
                onClick={stat.clickable ? () => setShowTopicsModal(true) : undefined}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="relative">
                      {stat.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500">
                    <div className="text-4xl mb-3 transform group-hover:scale-125 group-hover:animate-pulse transition-all duration-500">{stat.icon}</div>
                    <div className="text-3xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                    <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Scroll indicator with bouncing animation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="relative animate-bounce cursor-pointer hover:animate-pulse" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.5s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            {/* Additional bounce indicator */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Category Filter with Sorting */}
      <section className="bg-white dark:bg-gray-900 py-8 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Category Filters with improved animations */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Filter by Category</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(cat => {
                const postCount = cat === 'All' ? allPosts.length : allPosts.filter(p => p.tags?.includes(cat)).length;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`group relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                      category === cat 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                    }`}
                  >
                    {/* Gradient background on hover for inactive buttons */}
                    {category !== cat && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    
                    <span className="relative z-10">{cat}</span>
                    
                    {/* Post count badge */}
                    <span className={`relative z-10 ml-2 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                      category === cat
                        ? 'bg-white/20 text-white/80'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}>
                      {postCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'latest', label: 'Latest', icon: '🕒' },
                  { key: 'popular', label: 'Popular', icon: '🔥' },
                  { key: 'trending', label: 'Trending', icon: '📈' }
                ].map(sort => (
                  <button
                    key={sort.key}
                    onClick={() => setSortBy(sort.key as any)}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === sort.key
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{sort.icon}</span>
                    <span>{sort.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!loading && posts.length > 0 && (
        <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Featured Post</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden md:flex group hover:shadow-3xl transition-all duration-500">
              <div className="w-full md:w-1/2 relative overflow-hidden">
                <img 
                  src={posts[0].featuredImage || `https://picsum.photos/600/400?random=${posts[0].id}`}
                  alt={posts[0].title} 
                  className="w-full h-80 md:h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
              </div>
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  {posts[0].tags && posts[0].tags.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {posts[0].tags[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
                  {posts[0].title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                  {posts[0].excerpt || posts[0].content?.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>By {posts[0].author || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(posts[0].createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link 
                    to={`/blog/${posts[0].slug}`}
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors duration-200 group/link"
                  >
                    Read more
                    <svg className="ml-2 w-5 h-5 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What's New / Recent Updates Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-semibold mb-4">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
              What's New
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Updates & Additions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Stay in the loop with our latest content and platform improvements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                date: 'July 31, 2025',
                type: 'New Article',
                title: 'Advanced GitHub Copilot Patterns',
                description: 'Deep dive into advanced prompting techniques and productivity tips',
                icon: '📝',
                badge: 'NEW'
              },
              {
                date: 'July 29, 2025',
                type: 'Updated Guide',
                title: 'Azure Container Apps Best Practices',
                description: 'Updated with latest security recommendations and scaling patterns',
                icon: '🔄',
                badge: 'UPDATED'
              },
              {
                date: 'July 28, 2025',
                type: 'Feature',
                title: 'Enhanced Search & Autocomplete',
                description: 'Improved search experience with intelligent suggestions',
                icon: '✨',
                badge: 'FEATURE'
              },
              {
                date: 'July 26, 2025',
                type: 'New Series',
                title: 'AI Implementation Roadmap',
                description: 'Complete series on enterprise AI adoption strategies',
                icon: '🤖',
                badge: 'SERIES'
              },
              {
                date: 'July 25, 2025',
                type: 'Tool Update',
                title: 'Interactive Code Examples',
                description: 'Added runnable code snippets to all Docker tutorials',
                icon: '⚡',
                badge: 'IMPROVED'
              },
              {
                date: 'July 24, 2025',
                type: 'Community',
                title: 'Reader Feedback Integration',
                description: 'New testimonials and community showcase section',
                icon: '👥',
                badge: 'COMMUNITY'
              }
            ].map((update, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{update.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{update.date}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{update.type}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    update.badge === 'NEW' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    update.badge === 'UPDATED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    update.badge === 'FEATURE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    update.badge === 'SERIES' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    update.badge === 'IMPROVED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                  }`}>
                    {update.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {update.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {update.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/changelog"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Full Changelog
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Posts Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category} Posts
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {posts.length} articles
              </div>
            </div>

            {error && (
              <ErrorMessage
                message={error}
                onRetry={() => {
                  setPosts([]);
                  setLoading(true);
                  fetchPosts();
                }}
                className="mb-8"
              />
            )}

            <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {posts.slice(0, showAllPosts ? posts.length : maxHomePosts).map((post, i) => {
                const readingTime = estimateReadingTime(post.content || post.excerpt || '');
                
                return (
                  <div 
                    key={post.id} 
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group ${
                      viewMode === 'list' ? 'md:flex md:h-64' : ''
                    }`}
                  >
                    {/* Post Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
                      <img 
                        src={post.featuredImage || `https://picsum.photos/400/240?random=${post.id}`}
                        alt={post.title} 
                        className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                          viewMode === 'list' ? 'h-full md:h-64' : 'h-48'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Enhanced Tag overlay */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg">
                            {post.tags[0]}
                          </span>
                        </div>
                      )}

                      {/* Reading Time Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-black/50 backdrop-blur-sm text-white">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {readingTime} min
                        </span>
                      </div>

                      {/* Trending Badge */}
                      {sortBy === 'trending' && i < 3 && (
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse">
                            🔥 Trending
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Post Content */}
                    <div className={`p-6 ${viewMode === 'list' ? 'md:flex-1 md:flex md:flex-col md:justify-between' : ''}`}>
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          <Link to={`/blog/${post.slug}`} className="hover:underline">
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt || post.content?.substring(0, 120) + '...'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Author Avatar */}
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {(post.author || 'Admin').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {post.author || 'Admin'}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{Math.floor(Math.random() * 500) + 50} views</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {/* Like Button */}
                          <button 
                            onClick={(e) => handleLikePost(post.slug, e)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes || 0}</span>
                          </button>

                          {/* Share Button */}
                          <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                          
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-200 group/link"
                          >
                            Read
                            <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Enhanced Loading Skeletons */}
              {loading && [...Array(viewMode === 'grid' ? 4 : 2)].map((_, i) => (
                <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                  viewMode === 'list' ? 'md:flex md:h-64' : ''
                }`}>
                  <div className="animate-pulse">
                    <div className={`bg-gray-200 dark:bg-gray-700 ${
                      viewMode === 'list' ? 'md:w-1/3 h-full md:h-64' : 'h-48'
                    }`}></div>
                    <div className="p-6 space-y-4">
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full"></div>
                          <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-16"></div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Posts Button */}
            {!showAllPosts && posts.length >= maxHomePosts && (
              <div className="text-center mt-12">
                <button
                  onClick={handleViewAllPosts}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  <span>View All Posts</span>
                  <svg className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Showing {Math.min(posts.length, maxHomePosts)} of {posts.length} posts
                </p>
              </div>
            )}

            {/* End message for when showing all posts */}
            {showAllPosts && posts.length > 0 && (
              <div className="text-center mt-12 space-y-4">
                <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You've seen all {posts.length} posts! 🎉
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleShowLess}
                    className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </button>
                  <Link 
                    to="/blog"
                    className="inline-flex items-center px-6 py-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
                  >
                    Visit Blog Page
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Newsletter Subscription */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Stay Updated</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get the latest cloud tips and updates straight to your inbox. No spam, ever.
                </p>
              </div>
              
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                />
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Trending Posts */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Trending</h4>
              </div>
              
              <ul className="space-y-4">
                {posts.slice(1, 5).map((post, index) => (
                  <li key={post.id} className="group">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                          {post.title}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: 'New article published', title: 'Advanced Docker Techniques', time: '2 hours ago', type: 'publish' },
                  { action: 'Tutorial updated', title: 'Kubernetes Basics', time: '1 day ago', type: 'update' },
                  { action: 'Community discussion', title: 'Best CI/CD Practices', time: '2 days ago', type: 'discussion' },
                  { action: 'Video uploaded', title: 'AWS Lambda Deep Dive', time: '3 days ago', type: 'video' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'publish' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'discussion' ? 'bg-purple-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/activity"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold">Join Our Community</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(stats.totalReaders / 1000).toFixed(1)}K</div>
                    <div className="text-sm opacity-90">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Support</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a
                    href="https://github.com/sumitmalik51/CloudManual"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
                  >
                    <span className="mr-2">⭐</span>
                    Star on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.filter(cat => cat !== 'All').map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      category === cat
                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Readers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Trusted by cloud professionals worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "The GitHub Copilot series completely changed how I approach development. Excellent practical examples!",
                author: "Sarah Chen",
                role: "Senior DevOps Engineer",
                company: "TechCorp",
                avatar: "SC"
              },
              {
                quote: "CloudManual's Azure guides helped me ace my certification. The step-by-step approach is perfect.",
                author: "Marcus Rodriguez",
                role: "Cloud Architect",
                company: "StartupXYZ",
                avatar: "MR"
              },
              {
                quote: "Finally, AI implementation tutorials that actually work in production. Saved me weeks of research!",
                author: "Priya Patel",
                role: "ML Engineer",
                company: "DataFlow Inc",
                avatar: "PP"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="mb-4">
                  <svg className="w-8 h-8 text-indigo-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12 border border-indigo-100 dark:border-indigo-800">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Newsletter
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Stay Updated with CloudManual
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get the latest cloud architecture guides, AI implementation tutorials, and DevOps best practices delivered to your inbox weekly.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <form onSubmit={handleNewsletterSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={newsletterStatus === 'loading'}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={newsletterStatus === 'loading' || !newsletterEmail.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center min-w-[120px]"
                  >
                    {newsletterStatus === 'loading' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              </form>
              
              {/* Status Messages */}
              {newsletterStatus === 'success' && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm text-center">
                  🎉 Welcome aboard! Check your email to confirm your subscription.
                </div>
              )}
              {newsletterStatus === 'error' && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm text-center">
                  ❌ Something went wrong. Please try again later.
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Join 2,500+ cloud professionals • Unsubscribe anytime • No spam, ever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Modal */}
      <TopicsModal
        isOpen={showTopicsModal}
        onClose={() => setShowTopicsModal(false)}
        topics={topicsData}
      />
      </Layout>
    </PageTransition>
  );
};

export default Home;
