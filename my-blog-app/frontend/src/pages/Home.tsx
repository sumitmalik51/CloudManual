import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ErrorMessage from '../components/ui/ErrorMessage';
import { blogAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReaders: 0,
    categories: 0
  });
  
  const observer = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const postsPerPage = 6;

  // Utility function to estimate reading time
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
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
  }, [allPosts]);

  // Enhanced fetch function
  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const data = await blogAPI.getPosts({ 
        page, 
        limit: postsPerPage,
        ...(category !== 'All' && { tag: category })
      });
      
      if (page === 1) {
        setPosts(data.posts);
        setAllPosts(data.posts);
        // Simulate stats (in real app, this would come from API)
        setStats({
          totalPosts: data.pagination?.totalPosts || data.posts.length,
          totalViews: Math.floor(Math.random() * 50000) + 10000,
          totalReaders: Math.floor(Math.random() * 5000) + 1000,
          categories: categories.length - 1
        });
      } else {
        setPosts(prev => [...prev, ...data.posts]);
        setAllPosts(prev => [...prev, ...data.posts]);
      }
      
      setHasMore(data.posts.length === postsPerPage);
      setLoading(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = ['All', 'Cloud', 'DevOps', 'AI', 'Security', 'WebDev'];

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-32 px-6 text-center overflow-hidden"
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
          {/* Enhanced Title with Better Typography */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none">
              <span className="block text-white drop-shadow-2xl">
                CloudManual
              </span>
            </h1>
            
            {/* Live Badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-100">Live & Updated Daily</span>
              </div>
            </div>
          </div>

          <p className="text-xl md:text-3xl mb-12 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-lg text-blue-100">
            Your modern guide to Cloud, AI, and DevOps — hands-on, simplified, and real-world focused.
          </p>
          
          {/* Premium Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search articles, topics, or technologies..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                      className="w-full pl-14 pr-6 py-4 text-lg text-gray-800 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-16 flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
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

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Azure', 'AWS', 'Docker', 'Kubernetes', 'AI/ML', 'DevOps'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    debouncedSearch(tag);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              to="/blog"
              className="group inline-flex items-center justify-center bg-white text-indigo-900 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-gray-50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <span>Explore Articles</span>
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button 
              className="group inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-bold px-10 py-4 rounded-2xl hover:bg-white hover:text-indigo-900 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Watch Tutorials</span>
            </button>
          </div>

          {/* Enhanced Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Articles', value: stats.totalPosts.toLocaleString(), icon: '📚', color: 'from-blue-500 to-cyan-500' },
              { label: 'Readers', value: `${Math.floor(stats.totalReaders / 1000)}K+`, icon: '👥', color: 'from-purple-500 to-pink-500' },
              { label: 'Views', value: `${Math.floor(stats.totalViews / 1000)}K+`, icon: '👁️', color: 'from-green-500 to-emerald-500' },
              { label: 'Topics', value: stats.categories.toString(), icon: '🏷️', color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <div key={index} className="group text-center transform hover:scale-110 transition-all duration-500">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500">
                    <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                    <div className="text-3xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                    <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Category Filter with Sorting */}
      <section className="bg-white dark:bg-gray-900 py-8 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Category Filters */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Filter by Category</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    category === cat 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-2 text-xs opacity-75">
                      {allPosts.filter(p => p.tags?.includes(cat)).length}
                    </span>
                  )}
                </button>
              ))}
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
                  setPage(1);
                  setPosts([]);
                  setLoading(true);
                  fetchPosts();
                }}
                className="mb-8"
              />
            )}

            <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {posts.map((post, i) => {
                const isLast = i === posts.length - 1;
                const readingTime = estimateReadingTime(post.content || post.excerpt || '');
                
                return (
                  <div 
                    ref={isLast ? lastPostRef : null} 
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
                          <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{Math.floor(Math.random() * 20) + 5}</span>
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

            {/* Load More Indicator */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-500 dark:text-gray-400">You've reached the end! 🎉</p>
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
                    href="https://discord.gg/cloudmanual"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
                  >
                    <span className="mr-2">💬</span>
                    Join Discord
                  </a>
                  <a
                    href="https://github.com/cloudmanual"
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
    </Layout>
  );
};

export default Home;
