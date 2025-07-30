import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../utils/api';
import { formatDate, createPostUrl, truncateText } from '../../utils/helpers';

interface BlogListCardProps {
  post: Post;
}

// Array of placeholder images for posts without featured images
const placeholderImages = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1573164713712-03790a178651?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2f71?w=400&h=250&fit=crop',
];

const getRandomPlaceholder = (id: string | number) => {
  // Use post ID to consistently get the same placeholder for each post
  const index = Math.abs(String(id).split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % placeholderImages.length;
  return placeholderImages[index];
};

const BlogListCard: React.FC<BlogListCardProps> = ({ post }) => {
  const postUrl = createPostUrl(post.slug);
  const imageUrl = post.featuredImage || getRandomPlaceholder(post.id);

  return (
    <article className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mb-6 p-4 group">
      {/* Post Thumbnail */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback to a different placeholder if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src = placeholderImages[0];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Status Badge */}
        {post.status === 'draft' && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Draft
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{post.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors duration-200">
          <Link to={postUrl} className="block">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {post.excerpt || truncateText(post.content, 120)}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="font-medium text-gray-700">{post.author}</span>
            </div>
            <span className="text-gray-300">•</span>
            <time dateTime={post.createdAt} className="text-gray-500">
              {formatDate(post.createdAt)}
            </time>
          </div>
          
          {/* View Counter - Less Prominent */}
          {post.views > 0 && (
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views}</span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <div className="pt-2">
          <Link
            to={postUrl}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200 group"
          >
            Read more
            <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogListCard;
