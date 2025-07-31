import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  slug: string;
  featuredImage?: string;
  tags?: string[];
  author?: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  readingTime?: number;
}

interface BlogPostCardProps {
  post: Post;
  index: number;
  viewMode: 'grid' | 'list';
  estimateReadingTime: (content: string) => number;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ 
  post, 
  index, 
  viewMode, 
  estimateReadingTime 
}) => {
  const readingTime = estimateReadingTime(post.content || post.excerpt || '');

  return (
    <motion.div 
      key={post.id}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer ${
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
      </div>

      {/* Post Content */}
      <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </time>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {post.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt || 'Discover insights and best practices for modern cloud development...'}
          </p>
        </div>

        {/* Author and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=6366f1&color=ffffff`}
              alt={post.author?.name || 'Author'} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author?.name || 'CloudManual Team'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 group/heart">
              <svg className="w-5 h-5 group-hover/heart:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
    </motion.div>
  );
};

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  index: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ viewMode, index }) => {
  return (
    <motion.div 
      key={`skeleton-${index}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
        viewMode === 'list' ? 'md:flex md:h-64' : ''
      }`}
    >
      <div className="animate-pulse">
        <div className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_2s_infinite] ${
          viewMode === 'list' ? 'md:w-1/3 h-full md:h-64' : 'h-48'
        }`}></div>
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-4 rounded w-3/4 animate-[shimmer_2s_infinite_0.5s]"></div>
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-4 rounded w-1/2 animate-[shimmer_2s_infinite_1s]"></div>
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-3 rounded w-2/3 animate-[shimmer_2s_infinite_1.5s]"></div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 w-8 h-8 rounded-full animate-[shimmer_2s_infinite_2s]"></div>
              <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-3 rounded w-16 animate-[shimmer_2s_infinite_2.5s]"></div>
            </div>
            <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-3 rounded w-12 animate-[shimmer_2s_infinite_3s]"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface BlogPostsGridProps {
  posts: Post[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  showAllPosts: boolean;
  maxHomePosts: number;
  estimateReadingTime: (content: string) => number;
}

const BlogPostsGrid: React.FC<BlogPostsGridProps> = ({
  posts,
  loading,
  viewMode,
  showAllPosts,
  maxHomePosts,
  estimateReadingTime
}) => {
  return (
    <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
      <AnimatePresence mode="wait">
        {posts.slice(0, showAllPosts ? posts.length : maxHomePosts).map((post, i) => (
          <BlogPostCard
            key={post.id}
            post={post}
            index={i}
            viewMode={viewMode}
            estimateReadingTime={estimateReadingTime}
          />
        ))}
      </AnimatePresence>

      {/* Loading Skeletons */}
      {loading && [...Array(viewMode === 'grid' ? 4 : 2)].map((_, i) => (
        <LoadingSkeleton key={i} viewMode={viewMode} index={i} />
      ))}
    </div>
  );
};

export default BlogPostsGrid;
