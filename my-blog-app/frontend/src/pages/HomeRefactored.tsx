import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/seo/SEOHead';
import ErrorMessage from '../components/ui/ErrorMessage';
import TopicsModal from '../components/ui/TopicsModal';
import PageTransition from '../components/ui/PageTransition';
import HeroSection from '../components/home/HeroSection';
import StatsGrid from '../components/home/StatsGrid';
import BlogPostsGrid from '../components/home/BlogPostsGrid';
import NewsletterSection from '../components/home/NewsletterSection';
import { useSearch } from '../hooks/useSearch';
import { useHomeData } from '../hooks/useHomeData';
import { homeData, getStatsData } from '../data/homeData';

const Home: React.FC = () => {
  // State management
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  const maxHomePosts = 10;

  // Custom hooks
  const {
    posts,
    setPosts,
    allPosts,
    loading,
    error,
    stats,
    fetchPosts
  } = useHomeData({ category, showAllPosts, maxHomePosts });

  const {
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
  } = useSearch({ 
    allPosts, 
    popularSearches: homeData.popularSearches 
  });

  // Dark mode state
  const [isDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Utility functions
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleNewsletterSubmit = async (_email: string) => {
    // Simulate API call (replace with actual newsletter service integration)
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Search effect
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setPosts(filtered);
    } else {
      setPosts(allPosts);
    }
  }, [searchQuery, allPosts, setPosts]);

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
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFocused={searchFocused}
          setSearchFocused={setSearchFocused}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          searchSuggestions={searchSuggestions}
          isSearching={isSearching}
          debouncedSearch={debouncedSearch}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Stats Grid */}
        <StatsGrid stats={getStatsData(stats)} />

        {/* Filter Controls */}
        <section className="py-8 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-6">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Categories:</span>
                {homeData.categories.map(cat => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
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

        {/* Main Content */}
        <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
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
                  fetchPosts();
                }}
                className="mb-8"
              />
            )}

            <BlogPostsGrid
              posts={posts}
              loading={loading}
              viewMode={viewMode}
              showAllPosts={showAllPosts}
              maxHomePosts={maxHomePosts}
              estimateReadingTime={estimateReadingTime}
            />

            {/* Load More Button */}
            {!loading && posts.length > maxHomePosts && !showAllPosts && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllPosts(true)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Load More Articles
                </button>
              </div>
            )}

            {/* View All Link */}
            {!loading && posts.length >= maxHomePosts && (
              <div className="text-center mt-8">
                <Link
                  to="/blog"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
                >
                  View all articles
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection onSubmit={handleNewsletterSubmit} />

        {/* Topics Modal */}
        <TopicsModal
          isOpen={showTopicsModal}
          onClose={() => setShowTopicsModal(false)}
          topics={homeData.topicsData}
        />
      </Layout>
    </PageTransition>
  );
};

export default Home;
