import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { formatDate } from '../utils/helpers';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  views: number;
  readingTime: number;
  tags: string[];
  slug: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title' | 'views'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:5000/api/posts/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchPosts();
  }, [navigate, fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/posts/admin/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Refresh posts list
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      const response = await fetch(`http://localhost:5000/api/posts/admin/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      // Refresh posts list
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update post status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>
              <p className="text-gray-600">Create, edit, and manage your blog posts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/posts/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Post
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="views-desc">Most Views</option>
                <option value="views-asc">Least Views</option>
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-600">{error}</div>
            <button
              onClick={fetchPosts}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No posts found</div>
              <Link
                to="/admin/posts/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Your First Post
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500">{post.excerpt}</div>
                            {post.tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {post.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(post.id, post.status)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            {post.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="text-gray-600 hover:text-gray-900"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </Link>
                            <Link
                              to={`/admin/posts/${post.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminPosts;
