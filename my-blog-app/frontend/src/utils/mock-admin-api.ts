/**
 * Mock admin API responses for development
 * This helps when the backend is not running or doesn't have admin endpoints yet
 */

// Mock data
const mockPosts = [
  {
    id: '1',
    title: 'Getting Started with Cloud Technologies',
    slug: 'getting-started-cloud-technologies',
    excerpt: 'A comprehensive guide to understanding cloud computing fundamentals.',
    content: 'Full content of the blog post...',
    author: 'CloudManual Team',
    tags: ['cloud', 'basics', 'aws'],
    category: 'Cloud',
    status: 'published',
    featuredImage: null,
    views: 1250,
    likes: 45,
    metaTitle: 'Getting Started with Cloud Technologies',
    metaDescription: 'Learn cloud computing fundamentals in this comprehensive guide.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    type: 'article'
  },
  {
    id: '2',
    title: 'Azure DevOps Best Practices',
    slug: 'azure-devops-best-practices',
    excerpt: 'Essential practices for implementing Azure DevOps in your organization.',
    content: 'Full content of the blog post...',
    author: 'DevOps Expert',
    tags: ['azure', 'devops', 'ci-cd'],
    category: 'DevOps',
    status: 'published',
    featuredImage: null,
    views: 890,
    likes: 32,
    metaTitle: 'Azure DevOps Best Practices',
    metaDescription: 'Learn essential Azure DevOps practices for your organization.',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    type: 'article'
  }
];

const mockStats = {
  totalPosts: 25,
  totalViews: 15430,
  totalLikes: 342,
  totalComments: 89,
  recentActivity: [
    { action: 'Post published', title: 'Getting Started with Cloud Technologies', time: '2 hours ago' },
    { action: 'Comment received', title: 'Azure DevOps Best Practices', time: '4 hours ago' },
    { action: 'Post updated', title: 'Kubernetes Deployment Guide', time: '1 day ago' }
  ]
};

/**
 * Intercept admin API calls and return mock data if backend is not available
 */
export const setupMockAdminAPI = () => {
  if (import.meta.env.VITE_NODE_ENV !== 'development') {
    return;
  }

  // Store original fetch
  const originalFetch = window.fetch;

  // Mock fetch function
  window.fetch = async (url: string | URL | Request, options?: RequestInit) => {
    const urlString = url.toString();
    
    // Check if this is an admin API call
    if (urlString.includes('/api/posts/admin') && !urlString.includes('/login')) {
      console.log('🔧 Intercepting admin API call:', urlString);
      
      // Check if user has admin token (real or mock)
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Return mock data based on the endpoint
      if (urlString.includes('?limit=10&sortBy=createdAt&sortOrder=desc')) {
        // Recent posts for dashboard
        return new Response(JSON.stringify({
          posts: mockPosts,
          total: mockPosts.length,
          stats: mockStats
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Default posts response
      return new Response(JSON.stringify({
        posts: mockPosts,
        total: mockPosts.length,
        page: 1,
        totalPages: 1
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For non-admin calls, use original fetch
    return originalFetch(url, options);
  };

  console.log('🔧 Mock admin API set up for development');
};

// Auto-setup in development
if (import.meta.env.VITE_NODE_ENV === 'development') {
  setupMockAdminAPI();
}
