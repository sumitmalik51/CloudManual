import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && !authAPI.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && authAPI.isTokenExpired(token)) {
      // Token is expired, remove it and redirect to login
      authAPI.logout();
      console.log('🔒 Token expired before request, redirecting to login');
      
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
      return Promise.reject(new Error('Token expired'));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth token if unauthorized or forbidden (likely expired token)
      authAPI.logout();
      
      // Redirect to login if we're not already there
      if (window.location.pathname !== '/admin/login') {
        console.log('🔒 Token expired or invalid. Redirecting to login...');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorSlug?: string;
  tags: string[];
  category?: string;
  status: 'published' | 'draft';
  featuredImage?: string;
  views: number;
  likes: number;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  email: string;
  bio: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
  };
  expertise: string[];
  isActive: boolean;
  postCount: number;
  totalViews: number;
  totalLikes: number;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  status?: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
}

export interface StatsResponse {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  recentPosts: Post[];
}

// API functions
export const blogAPI = {
  // Public endpoints
  getPosts: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {}): Promise<PostsResponse> => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  getPostBySlug: async (slug: string): Promise<Post> => {
    try {
      const response = await api.get(`/posts/${slug}`);
      return response.data;
    } catch (error: any) {
      // Handle view increment errors specifically - log but allow post to be displayed
      if (error.response?.status === 500) {
        console.warn(`View increment may have failed for post '${slug}', but attempting to retrieve post data:`, error.message);
        
        // Log detailed error info for debugging
        if (error.response?.data) {
          console.warn('Backend error details:', error.response.data);
        }
        
        // Try a second request in case it was a temporary issue
        try {
          const retryResponse = await api.get(`/posts/${slug}`);
          console.log('Retry successful for post:', slug);
          return retryResponse.data;
        } catch (retryError) {
          console.error('Retry also failed for post:', slug, retryError);
          // If retry fails, still throw the original error
          throw error;
        }
      }
      
      // For other errors (404, etc.), throw as normal
      throw error;
    }
  },

  likePost: async (slug: string): Promise<{ likes: number }> => {
    try {
      const response = await api.post(`/posts/${slug}/like`);
      return response.data;
    } catch (error: any) {
      // Handle like increment errors specifically
      if (error.response?.status === 500) {
        console.warn(`Like increment failed for post '${slug}':`, error.message);
        
        // Log detailed error info for debugging
        if (error.response?.data) {
          console.warn('Backend like error details:', error.response.data);
        }
        
        // Try a second request in case it was a temporary issue
        try {
          const retryResponse = await api.post(`/posts/${slug}/like`);
          console.log('Like retry successful for post:', slug);
          return retryResponse.data;
        } catch (retryError) {
          console.error('Like retry also failed for post:', slug, retryError);
          // For now, still throw the original error
          throw error;
        }
      }
      
      // For other errors, throw as normal
      throw error;
    }
  },

  // Admin endpoints
  login: async (username: string, password: string): Promise<{ message: string; token: string; user: { username: string } }> => {
    // Use the new dedicated auth endpoint
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      authAPI.setToken(response.data.token);
      console.log('🔑 Login successful via /api/auth/login');
    }
    return response.data;
  },

  logout: () => {
    authAPI.logout();
    console.log('🔓 Logged out successfully');
  },

  isAuthenticated: (): boolean => {
    return authAPI.isAuthenticated();
  },

  getAdminPosts: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PostsResponse> => {
    const response = await api.get('/posts/admin', { params });
    return response.data;
  },

  createPost: async (postData: CreatePostData): Promise<{ message: string; post: Post }> => {
    const response = await api.post('/posts/admin', postData);
    return response.data;
  },

  updatePost: async (id: string, postData: Partial<CreatePostData>): Promise<{ message: string; post: Post }> => {
    const response = await api.put(`/posts/admin/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: string): Promise<{ message: string; deletedPost: { id: string; title: string } }> => {
    const response = await api.delete(`/posts/admin/${id}`);
    return response.data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get('/posts/admin/analytics');
    return response.data;
  },

  // Author APIs
  getAuthors: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<{ authors: Author[]; pagination: any }> => {
    const response = await api.get('/authors', { params });
    return response.data;
  },

  getAuthorBySlug: async (slug: string): Promise<Author> => {
    const response = await api.get(`/authors/${slug}`);
    return response.data;
  },

  getAuthorPosts: async (authorSlug: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ posts: Post[]; pagination: any }> => {
    const response = await api.get(`/authors/${authorSlug}/posts`, { params });
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string; environment: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Enhanced authentication API
export const authAPI = {
  setToken: (token: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('isAdmin', 'true');
    
    // Store token expiration time for reference
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        localStorage.setItem('tokenExpiry', payload.exp.toString());
        const expiryDate = new Date(payload.exp * 1000);
        console.log('🔑 Token set. Expires at:', expiryDate.toLocaleString());
      }
    } catch (error) {
      console.warn('Could not parse token expiration:', error);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('adminToken');
  },

  removeToken: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('tokenExpiry');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.warn('Could not parse token:', error);
      return true; // Treat invalid tokens as expired
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint to blacklist token server-side
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout endpoint failed:', error);
    } finally {
      authAPI.removeToken();
    }
  },

  isAuthenticated: (): boolean => {
    const token = authAPI.getToken();
    if (!token) {
      return false;
    }
    
    if (authAPI.isTokenExpired(token)) {
      authAPI.removeToken();
      console.log('🔒 Token expired, removed from storage');
      return false;
    }
    
    return true;
  },

  // Check if setup is required
  checkSetupStatus: async (): Promise<{ setupRequired: boolean; configured: boolean; version: string }> => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  // Setup admin account (first time)
  setup: async (newPassword: string, confirmPassword: string): Promise<{ message: string; code: string }> => {
    const response = await api.post('/auth/setup', { newPassword, confirmPassword });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string; code: string }> => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<{ user: { username: string; type: string }; authenticated: boolean }> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default api;
