import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedPostCard from './OptimizedPostCard';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  author?: string;
  createdAt: string;
  tags?: string[];
  likes?: number;
  views?: number;
}

interface OptimizedBlogGridProps {
  posts: BlogPost[];
  viewMode: 'grid' | 'list';
  onLike?: (slug: string, event: React.MouseEvent) => void;
  onShare?: (slug: string, event: React.MouseEvent) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const OptimizedBlogGrid: React.FC<OptimizedBlogGridProps> = memo(({
  posts,
  viewMode,
  onLike,
  onShare,
  loading = false,
  hasMore = false,
  onLoadMore,
  className = ''
}) => {
  const [visiblePosts, setVisiblePosts] = useState(posts);
  const [showingMore, setShowingMore] = useState(false);

  // Update visible posts when posts prop changes
  useEffect(() => {
    setVisiblePosts(posts);
  }, [posts]);

  // Memoized reading time estimation
  const estimateReadingTime = useCallback((content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }, []);

  // Load more functionality with smooth animation
  const handleLoadMore = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
      return;
    }

    // If no external load more function, do nothing since posts are controlled by parent
    setShowingMore(false);
  }, [onLoadMore]);

  // Memoized grid layout classes
  const gridClasses = useMemo(() => {
    const baseClasses = `gap-8 ${className}`;
    
    if (viewMode === 'grid') {
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${baseClasses}`;
    }
    
    return `flex flex-col space-y-8 ${baseClasses}`;
  }, [viewMode, className]);

  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = memo(() => (
    <div className={gridClasses}>
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Image Skeleton */}
          <div className={`bg-gray-200 dark:bg-gray-700 animate-shimmer ${
            viewMode === 'list' ? 'md:w-1/3 h-64' : 'h-48'
          }`}>
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer-sweep" />
          </div>
          
          {/* Content Skeleton */}
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-shimmer" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-shimmer" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-shimmer" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 animate-shimmer" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-shimmer" />
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  ));

  // Empty state component
  const EmptyState = memo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center"
      >
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Posts Found</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        We couldn't find any blog posts. Check back later for new content!
      </p>
    </motion.div>
  ));

  if (loading && visiblePosts.length === 0) {
    return <LoadingSkeleton />;
  }

  if (visiblePosts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      {/* Main Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={gridClasses}
      >
        <AnimatePresence mode="popLayout">
          {visiblePosts.map((post, index) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              layout
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <OptimizedPostCard
                post={post}
                index={index}
                viewMode={viewMode}
                onLike={onLike}
                onShare={onShare}
                estimateReadingTime={estimateReadingTime}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Section */}
      <AnimatePresence>
        {(hasMore || visiblePosts.length < posts.length) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={handleLoadMore}
              disabled={loading || showingMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
              />
              
              <span className="relative z-10 flex items-center">
                {(loading || showingMore) ? (
                  <>
                    <motion.svg
                      className="w-5 h-5 mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Posts
                    <motion.svg
                      className="w-5 h-5 ml-2"
                      whileHover={{ y: 2 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </motion.svg>
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator for Additional Posts */}
      <AnimatePresence>
        {(loading && visiblePosts.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${gridClasses} mt-8`}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

OptimizedBlogGrid.displayName = 'OptimizedBlogGrid';

export default OptimizedBlogGrid;
