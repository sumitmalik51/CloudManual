import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BlogListCard from '../components/ui/BlogListCard';
import SearchBar from '../components/ui/SearchBar';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageTransition from '../components/ui/PageTransition';
import { blogAPI, type PostsResponse } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Get filter parameters from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';

  const fetchPosts = useCallback(async (params: {
    page?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogAPI.getPosts({
        page: params.page || currentPage,
        limit: 9,
        category: params.category || category,
        tag: params.tag || tag,
        search: params.search || search,
      });
      setPostsData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, tag, search]);

  // Handle filter changes
  const handleFilterChange = (filterType: 'category' | 'tag', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    newParams.delete('page'); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, category, tag, search, fetchPosts]);

  const hasActiveFilters = category || tag || search;

  return (
    <PageTransition>
      <Layout>
        {/* Top Banner with Gradient Background */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="floating-element top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="floating-element-delay top-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="floating-element-slow bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-bold font-sans text-white mb-6">
            Blog Posts
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of articles, tutorials, and insights on technology, 
            programming, and more.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:w-96">
              <SearchBar 
                onSearch={(searchValue) => {
                  setSearchTerm(searchValue);
                  const newParams = new URLSearchParams(searchParams);
                  if (searchValue) {
                    newParams.set('search', searchValue);
                  } else {
                    newParams.delete('search');
                  }
                  newParams.delete('page');
                  setSearchParams(newParams);
                }}
                initialValue={searchTerm}
                placeholder="Search CloudManual posts..."
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="lifestyle">Lifestyle</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Category: {category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {tag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Tag: {tag}
                  <button
                    onClick={() => handleFilterChange('tag', '')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Search: "{search}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleFilterChange('tag', ''); // This will clear search via the URL params
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      setSearchParams(newParams);
                    }}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg mb-6 p-4 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="bg-gray-200 h-6 w-16 rounded-full"></div>
                    <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
                  </div>
                  <div className="bg-gray-300 h-6 w-full rounded"></div>
                  <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-12 w-full rounded"></div>
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchPosts()}
            className="max-w-2xl mx-auto"
          />
        )}

        {/* Posts Grid */}
        {postsData && postsData.posts.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {postsData.posts.length} of {postsData.pagination.totalPosts} posts
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {postsData.posts.map((post) => (
                <BlogListCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {postsData.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!postsData.pagination.hasPrev}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      postsData.pagination.hasPrev
                        ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, postsData.pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > postsData.pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!postsData.pagination.hasNext}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      postsData.pagination.hasNext
                        ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {postsData && postsData.posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back soon for new content!'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
      </Layout>
    </PageTransition>
  );
};

export default Blog;
