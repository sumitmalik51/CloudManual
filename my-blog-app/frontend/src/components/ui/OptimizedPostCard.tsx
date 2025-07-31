import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LazyImage from './LazyImage';
import { useFadeInOnScroll } from '../../hooks/useIntersectionObserver';

interface OptimizedPostCardProps {
  post: {
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
  };
  index: number;
  viewMode: 'grid' | 'list';
  onLike?: (slug: string, event: React.MouseEvent) => void;
  onShare?: (slug: string, event: React.MouseEvent) => void;
  estimateReadingTime: (content: string) => number;
}

const OptimizedPostCard: React.FC<OptimizedPostCardProps> = memo(({
  post,
  index,
  viewMode,
  onLike,
  estimateReadingTime
}) => {
  const { ref, isVisible, animationClass } = useFadeInOnScroll({
    threshold: 0.1,
    triggerOnce: true
  });

  const readingTime = estimateReadingTime(post.content || post.excerpt || '');

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.slug, e);
  }, [onLike, post.slug]);

  // Generate blur placeholder (simple base64 for performance)
  const blurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  )}`;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={animationClass}>
      <Link to={`/blog/${post.slug}`} className="block">
        <motion.article
          initial={false}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 h-full flex flex-col ${
            viewMode === 'list' ? 'md:flex-row md:h-64' : ''
          }`}
        >
          {/* Post Image with Enhanced Loading */}
          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
            <LazyImage
              src={post.featuredImage || `https://picsum.photos/400/240?random=${post.id}`}
              alt={post.title}
              blurDataURL={blurDataURL}
              aspectRatio={viewMode === 'list' ? 'tall' : 'video'}
              className={`group-hover:scale-110 transition-transform duration-700 ${
                viewMode === 'list' ? 'h-full' : 'h-48'
              }`}
            />
            
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Enhanced Tag Overlay */}
            {post.tags && post.tags.length > 0 && (
              <motion.div 
                className="absolute top-4 left-4"
                whileHover={{ scale: 1.05 }}
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg border border-white/20">
                  {post.tags[0]}
                </span>
              </motion.div>
            )}

            {/* Enhanced Reading Time Badge */}
            <motion.div 
              className="absolute top-4 right-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-black/70 backdrop-blur-sm text-white shadow-lg">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readingTime} min
              </span>
            </motion.div>
          </div>

          {/* Enhanced Post Content */}
          <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' ? 'md:flex-1 md:justify-between' : ''}`}>
            <div className="flex-1 mb-4">
              <motion.h3 
                className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {post.title}
              </motion.h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {post.excerpt || post.content?.substring(0, 120) + '...'}
              </p>
            </div>
            
            {/* Enhanced Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Enhanced Author Avatar */}
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {(post.author || 'Admin').charAt(0).toUpperCase()}
                </motion.div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {post.author || 'Admin'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="truncate">{post.views || Math.floor(Math.random() * 500) + 50} views</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Action Buttons - More Compact */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Enhanced Like Button */}
                <motion.button 
                  onClick={handleLike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                >
                  <motion.svg 
                    className="w-3 h-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </motion.svg>
                  <span className="hidden sm:inline">{post.likes || 0}</span>
                </motion.button>

                {/* Enhanced Read More Indicator - Compact */}
                <motion.div 
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-xs"
                  whileHover={{ x: 2 }}
                >
                  <span className="hidden sm:inline">Read</span>
                  <motion.svg 
                    className="ml-1 w-3 h-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </div>
  );
});

OptimizedPostCard.displayName = 'OptimizedPostCard';

export default OptimizedPostCard;
