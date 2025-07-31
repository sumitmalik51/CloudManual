import { useEffect, useState, useCallback } from 'react';

export interface UserPreferences {
  readingHistory: string[]; // Post IDs
  bookmarks: string[]; // Post IDs
  favoriteCategories: string[];
  favoriteTags: string[];
  readingGoals: {
    dailyMinutes?: number;
    weeklyPosts?: number;
  };
  notifications: {
    newPosts: boolean;
    weeklyDigest: boolean;
    favoriteAuthors: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  viewPreferences: {
    defaultView: 'grid' | 'list';
    postsPerPage: number;
    showReadingTime: boolean;
    showAuthor: boolean;
  };
}

export interface ReadingSession {
  postId: string;
  startTime: number;
  endTime?: number;
  completed: boolean;
  progressPercentage: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  readingHistory: [],
  bookmarks: [],
  favoriteCategories: [],
  favoriteTags: [],
  readingGoals: {},
  notifications: {
    newPosts: true,
    weeklyDigest: true,
    favoriteAuthors: true
  },
  theme: 'system',
  viewPreferences: {
    defaultView: 'grid',
    postsPerPage: 9,
    showReadingTime: true,
    showAuthor: true
  }
};

class PersonalizationService {
  private storageKey = 'cloudmanual_user_preferences';
  private sessionsKey = 'cloudmanual_reading_sessions';
  private preferencesCache: UserPreferences | null = null;

  // Load preferences from localStorage
  getPreferences(): UserPreferences {
    if (this.preferencesCache) {
      return this.preferencesCache;
    }

    // Initialize with defaults first
    this.preferencesCache = { ...DEFAULT_PREFERENCES };

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.preferencesCache = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }

    return this.preferencesCache as UserPreferences;
  }

  // Save preferences to localStorage
  updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      this.preferencesCache = updated;
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }

    return updated;
  }

  // Reading history management
  addToReadingHistory(postId: string): void {
    const prefs = this.getPreferences();
    const history = prefs.readingHistory.filter(id => id !== postId);
    history.unshift(postId); // Add to beginning
    
    // Keep only last 100 items
    const updatedHistory = history.slice(0, 100);
    
    this.updatePreferences({ readingHistory: updatedHistory });
  }

  // Bookmark management
  toggleBookmark(postId: string): boolean {
    const prefs = this.getPreferences();
    const isBookmarked = prefs.bookmarks.includes(postId);
    
    const updatedBookmarks = isBookmarked
      ? prefs.bookmarks.filter(id => id !== postId)
      : [...prefs.bookmarks, postId];
    
    this.updatePreferences({ bookmarks: updatedBookmarks });
    return !isBookmarked;
  }

  isBookmarked(postId: string): boolean {
    return this.getPreferences().bookmarks.includes(postId);
  }

  // Reading sessions tracking
  startReadingSession(postId: string): string {
    const sessionId = `${postId}-${Date.now()}`;
    const session: ReadingSession = {
      postId,
      startTime: Date.now(),
      completed: false,
      progressPercentage: 0
    };

    this.saveReadingSession(sessionId, session);
    return sessionId;
  }

  updateReadingProgress(sessionId: string, progressPercentage: number): void {
    const session = this.getReadingSession(sessionId);
    if (session) {
      session.progressPercentage = progressPercentage;
      session.completed = progressPercentage >= 90; // Consider 90%+ as completed
      this.saveReadingSession(sessionId, session);
    }
  }

  endReadingSession(sessionId: string): void {
    const session = this.getReadingSession(sessionId);
    if (session) {
      session.endTime = Date.now();
      this.saveReadingSession(sessionId, session);
      
      // Add to reading history if significantly read
      if (session.progressPercentage >= 20) {
        this.addToReadingHistory(session.postId);
      }
    }
  }

  private saveReadingSession(sessionId: string, session: ReadingSession): void {
    try {
      const sessions = this.getReadingSessions();
      sessions[sessionId] = session;
      localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to save reading session:', error);
    }
  }

  private getReadingSession(sessionId: string): ReadingSession | null {
    const sessions = this.getReadingSessions();
    return sessions[sessionId] || null;
  }

  private getReadingSessions(): Record<string, ReadingSession> {
    try {
      const stored = localStorage.getItem(this.sessionsKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load reading sessions:', error);
      return {};
    }
  }

  // Analytics and insights
  getReadingStats(): {
    totalPostsRead: number;
    totalReadingTime: number; // in minutes
    averageReadingTime: number;
    completionRate: number;
    favoriteCategories: { category: string; count: number }[];
    readingStreak: number;
  } {
    const sessions = this.getReadingSessions();
    const completedSessions = Object.values(sessions).filter(s => s.endTime && s.completed);
    const totalReadingTime = completedSessions.reduce((total, session) => {
      return total + ((session.endTime! - session.startTime) / 1000 / 60);
    }, 0);

    // Calculate reading streak (consecutive days with reading activity)
    const readingDates = completedSessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort();

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (readingDates.includes(today) || readingDates.includes(yesterday)) {
      for (let i = readingDates.length - 1; i >= 0; i--) {
        const date = new Date(readingDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - streak);
        
        if (date.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      totalPostsRead: completedSessions.length,
      totalReadingTime,
      averageReadingTime: completedSessions.length > 0 ? totalReadingTime / completedSessions.length : 0,
      completionRate: Object.values(sessions).length > 0 
        ? (completedSessions.length / Object.values(sessions).length) * 100 
        : 0,
      favoriteCategories: [], // Would need post data to calculate
      readingStreak: streak
    };
  }

  // Recommendation engine
  getPersonalizedRecommendations(allPosts: any[]): any[] {
    const prefs = this.getPreferences();
    // const stats = this.getReadingStats(); // Removed unused variable
    
    return allPosts
      .filter(post => !prefs.readingHistory.includes(post.id)) // Exclude already read
      .map(post => {
        let score = 0;
        
        // Boost posts from favorite categories
        if (prefs.favoriteCategories.includes(post.category)) {
          score += 10;
        }
        
        // Boost posts with favorite tags
        const tagMatches = post.tags?.filter((tag: string) => prefs.favoriteTags.includes(tag)).length || 0;
        score += tagMatches * 5;
        
        // Boost popular posts
        score += (post.likes || 0) / 10;
        score += (post.views || 0) / 100;
        
        // Boost recent posts
        const daysSincePublished = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 7) score += 5;
        if (daysSincePublished < 1) score += 5;
        
        return { ...post, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);
  }

  // Smart category preferences based on reading behavior
  updateCategoryPreferences(category: string, _engagement: 'read' | 'liked' | 'shared' | 'bookmarked'): void {
    const prefs = this.getPreferences();
    // const weights = { read: 1, liked: 2, shared: 3, bookmarked: 3 }; // Removed unused variable
    
    // Simple algorithm to boost favorite categories
    if (!prefs.favoriteCategories.includes(category)) {
      // Add category if user has shown enough interest
      const readPosts = prefs.readingHistory.length;
      const threshold = Math.max(3, readPosts * 0.1);
      
      if (readPosts >= threshold) {
        prefs.favoriteCategories.push(category);
        this.updatePreferences({ favoriteCategories: prefs.favoriteCategories });
      }
    }
  }

  // Export user data (GDPR compliance)
  exportUserData(): string {
    const prefs = this.getPreferences();
    const sessions = this.getReadingSessions();
    const stats = this.getReadingStats();
    
    return JSON.stringify({
      preferences: prefs,
      sessions,
      stats,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // Clear all user data
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sessionsKey);
    this.preferencesCache = null;
  }
}

// Singleton instance
const personalizationService = new PersonalizationService();

// React hook for using personalization
export const usePersonalization = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(personalizationService.getPreferences());
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const updated = personalizationService.updatePreferences(updates);
    setPreferences(updated);
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    const isBookmarked = personalizationService.toggleBookmark(postId);
    setPreferences(personalizationService.getPreferences());
    return isBookmarked;
  }, []);

  const startReading = useCallback((postId: string) => {
    const sessionId = personalizationService.startReadingSession(postId);
    setActiveSession(sessionId);
    return sessionId;
  }, []);

  const updateProgress = useCallback((progressPercentage: number) => {
    if (activeSession) {
      personalizationService.updateReadingProgress(activeSession, progressPercentage);
    }
  }, [activeSession]);

  const endReading = useCallback(() => {
    if (activeSession) {
      personalizationService.endReadingSession(activeSession);
      setActiveSession(null);
    }
  }, [activeSession]);

  const getRecommendations = useCallback((allPosts: any[]) => {
    return personalizationService.getPersonalizedRecommendations(allPosts);
  }, []);

  const getReadingStats = useCallback(() => {
    return personalizationService.getReadingStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeSession) {
        personalizationService.endReadingSession(activeSession);
      }
    };
  }, [activeSession]);

  return {
    preferences,
    updatePreferences,
    toggleBookmark,
    isBookmarked: personalizationService.isBookmarked.bind(personalizationService),
    startReading,
    updateProgress,
    endReading,
    getRecommendations,
    getReadingStats,
    exportData: personalizationService.exportUserData.bind(personalizationService),
    clearData: personalizationService.clearAllData.bind(personalizationService)
  };
};

export default personalizationService;
