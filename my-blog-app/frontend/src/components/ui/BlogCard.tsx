import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../utils/api';
import { formatDate, createPostUrl, truncateText } from '../../utils/helpers';

interface BlogCardProps {
  post: Post;
  showExcerpt?: boolean;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  post, 
  showExcerpt = true, 
  className = '' 
}) => {
  const postUrl = createPostUrl(post.slug);

  return (
    <article className={`sophisticated-card group p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${className}`}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      
      <div className="relative z-10">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative overflow-hidden rounded-xl mb-6">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Image overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        {/* Tags and Views */}
        <div className="flex items-center justify-between mb-4">
          {post.tags && post.tags.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 shadow-sm">
              {post.tags[0]}
            </span>
          )}
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views} views
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="relative">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
            <Link 
              to={postUrl}
              className="block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 group-hover:scale-[1.01] transform"
            >
              {post.title}
            </Link>
          </h2>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </div>

        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
            {post.excerpt || truncateText(post.content, 150)}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="sophisticated-tag"
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className="font-medium">{post.author}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <time dateTime={post.createdAt} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              {formatDate(post.createdAt)}
            </time>
          </div>
          {post.views > 0 && (
            <div className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views}</span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <div className="relative">
          <Link
            to={postUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 group"
          >
            <span className="relative z-10 flex items-center">
              Read more
              <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Draft Badge (for admin view) */}
        {post.status === 'draft' && (
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
              Draft
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
