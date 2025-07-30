import { useState, useCallback } from 'react';
import { blogAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

interface UseHomeDataOptions {
  category: string;
  showAllPosts: boolean;
  maxHomePosts: number;
}

export const useHomeData = ({ category, showAllPosts, maxHomePosts }: UseHomeDataOptions) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReaders: 0,
    categories: 0
  });

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const data = await blogAPI.getPosts({ 
        limit: showAllPosts ? undefined : maxHomePosts,
        ...(category !== 'All' && { category: category })
      });
      
      setPosts(data.posts);
      setAllPosts(data.posts);
      
      // Simulate stats (in real app, this would come from API)
      setStats({
        totalPosts: data.pagination?.totalPosts || data.posts.length,
        totalViews: Math.floor(Math.random() * 50000) + 10000,
        totalReaders: Math.floor(Math.random() * 5000) + 1000,
        categories: 5 // This would come from actual categories count
      });
      
      setLoading(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }, [category, showAllPosts, maxHomePosts]);

  return {
    posts,
    setPosts,
    allPosts,
    loading,
    error,
    setError,
    stats,
    fetchPosts
  };
};
