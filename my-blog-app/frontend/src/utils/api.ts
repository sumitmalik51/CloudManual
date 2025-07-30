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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // Clear auth token if unauthorized
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      
      // Redirect to login if we're not already there
      if (window.location.pathname !== '/admin/login') {
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
  tags: string[];
  status: 'published' | 'draft';
  featuredImage?: string;
  views: number;
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
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  // Admin endpoints
  login: async (username: string, password: string): Promise<{ message: string; token: string; user: { username: string } }> => {
    const response = await api.post('/posts/admin/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('isAdmin', 'true');
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('adminToken') !== null;
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

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string; environment: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
