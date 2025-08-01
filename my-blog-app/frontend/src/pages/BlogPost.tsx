import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/seo/SEOHead';
import { LoadingPage } from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageTransition from '../components/ui/PageTransition';
import ReadingProgressBar from '../components/ui/ReadingProgressBar';
import ReadingEngagement from '../components/ui/ReadingEngagement';
import Comments from '../components/ui/Comments';
import AuthorCard from '../components/ui/AuthorCard';
import { blogAPI, type Post, type Author } from '../utils/api';
import { formatDate, getErrorMessage, generateMetaTitle, generateMetaDescription } from '../utils/helpers';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  const [likeError, setLikeError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slug) {
      setError('Post not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch the post by slug
      const postData = await blogAPI.getPostBySlug(slug);
      setPost(postData);

      // Fetch author information if authorSlug exists
      if (postData.authorSlug) {
        try {
          const authorData = await blogAPI.getAuthorBySlug(postData.authorSlug);
          setAuthor(authorData);
        } catch (err) {
          console.warn('Failed to fetch author data:', err);
          // Don't break the page if author fetch fails
        }
      }

      // Fetch related posts (same tags, excluding current post)
      if (postData.tags && postData.tags.length > 0) {
        try {
          const relatedData = await blogAPI.getPosts({
            tag: postData.tags[0],
            limit: 3
          });
          const filtered = relatedData.posts.filter(p => p.id !== postData.id);
          setRelatedPosts(filtered.slice(0, 3));
        } catch (err) {
          // Related posts failure shouldn't break the main page
          console.warn('Failed to fetch related posts:', err);
        }
      }

      // Update document title and meta
      document.title = generateMetaTitle(postData.metaTitle || postData.title);
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          generateMetaDescription(postData.metaDescription || postData.excerpt || postData.content)
        );
      }

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      
      // Provide more user-friendly error messages for common issues
      if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setError('Sorry, there was a temporary issue loading this post. Please try refreshing the page.');
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        setError('Post not found. It may have been moved or deleted.');
      } else {
        setError(errorMessage);
      }
      
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [slug, fetchPost]);

  const handleLikePost = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    setLikeError(null);
    
    // Optimistically update the UI
    const originalLikes = post.likes;
    setPost(prevPost => 
      prevPost ? { ...prevPost, likes: prevPost.likes + 1 } : null
    );
    
    try {
      // Attempt to like the post on the backend
      const result = await blogAPI.likePost(post.slug);
      
      // Update with the actual result from backend
      setPost(prevPost => 
        prevPost ? { ...prevPost, likes: result.likes } : null
      );
      
      console.log('Post liked successfully');
    } catch (error: any) {
      console.error('Error liking post:', error);
      
      // Revert the optimistic update
      setPost(prevPost => 
        prevPost ? { ...prevPost, likes: originalLikes } : null
      );
      
      // Set user-friendly error message
      if (error.response?.status === 500) {
        setLikeError('Unable to save your like due to a temporary issue. Please try again.');
      } else {
        setLikeError('Failed to like post. Please try again.');
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setLikeError(null), 5000);
    } finally {
      setIsLiking(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <LoadingPage message="Loading post..." />
      </Layout>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage
            message={error || 'Post not found'}
            onRetry={error ? fetchPost : undefined}
          />
          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="btn-primary"
            >
              Browse All Posts
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <PageTransition>
      <ReadingProgressBar />
      <Layout>
        <SEOHead
          title={generateMetaTitle(post.metaTitle || post.title)}
          description={post.metaDescription || post.excerpt}
          keywords={post.tags}
          image={post.featuredImage}
          url={window.location.href}
          type="article"
          author={post.author}
          publishedTime={post.createdAt}
          modifiedTime={post.updatedAt}
          tags={post.tags}
        />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-gray-100 truncate">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Post Header */}
        <header className="mb-8">
          {/* Category Badge */}
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors mr-2 mb-2"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>By {post.authorSlug ? (
                <Link 
                  to={`/authors/${post.authorSlug}`}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {post.author}
                </Link>
              ) : (
                post.author
              )}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </div>

            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views} views</span>
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-start">
              <button 
                onClick={handleLikePost}
                disabled={isLiking}
                className={`flex items-center transition-colors duration-200 ${
                  isLiking 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                <svg 
                  className={`w-4 h-4 mr-2 ${isLiking ? 'animate-pulse' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes || 0} likes {isLiking ? '(saving...)' : ''}</span>
              </button>
              
              {likeError && (
                <div className="text-xs text-red-600 mt-1 max-w-xs">
                  {likeError}
                </div>
              )}
            </div>

            {post.views > 0 && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>

        {/* Reading Engagement Tracking */}
        <ReadingEngagement
          content={post.content}
          title={post.title}
          onEngagementUpdate={(data: { readingTime: number; timeSpent: number; scrollProgress: number; engagementScore: number }) => {
            console.log('Reading engagement data:', data);
            // Here you could send engagement data to analytics
          }}
        />

        {/* Share Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Share this post</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const url = window.location.href;
                const text = `Check out this post: ${post.title}`;
                if (navigator.share) {
                  navigator.share({ title: post.title, text, url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Author Information */}
        {author && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-12 mb-12">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">About the Author</h3>
            </div>
            <AuthorCard 
              author={author} 
              size="large" 
              showBio={true}
              showSocial={true}
            />
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="card">
                  {relatedPost.featuredImage && (
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(relatedPost.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <div className="flex justify-between">
            <Link
              to="/blog"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Posts
            </Link>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium transition-colors"
            >
              Back to Top
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3 3 3M9 19l3-3 3 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Comments postId={post.id} />
        </div>
      </article>
      </Layout>
    </PageTransition>
  );
};

export default BlogPost;
