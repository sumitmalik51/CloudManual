import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingEngagementProps {
  content: string;
  title: string;
  onEngagementUpdate?: (data: EngagementData) => void;
}

interface EngagementData {
  readingTime: number;
  timeSpent: number;
  scrollProgress: number;
  engagementScore: number;
}

const ReadingEngagement: React.FC<ReadingEngagementProps> = ({
  content,
  onEngagementUpdate
}) => {
  const [readingTime, setReadingTime] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Calculate reading time
  useEffect(() => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    setReadingTime(minutes);
  }, [content]);

  // Track reading session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsReading(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setIsReading(true);
        startTimeRef.current = Date.now();
      }
    };

    const handleFocus = () => {
      setIsReading(true);
      startTimeRef.current = Date.now();
    };

    const handleBlur = () => {
      setIsReading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update time spent
  useEffect(() => {
    if (isReading) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          // Show congratulations when user has read for expected time
          if (newTime >= readingTime * 60 && !showCongrats) {
            setShowCongrats(true);
            setTimeout(() => setShowCongrats(false), 5000);
          }

          // Report engagement data
          if (onEngagementUpdate) {
            const scrollProgress = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            const engagementScore = Math.min((newTime / (readingTime * 60)) * 100, 100);
            
            onEngagementUpdate({
              readingTime,
              timeSpent: newTime,
              scrollProgress: Math.min(scrollProgress || 0, 100),
              engagementScore
            });
          }

          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReading, readingTime, showCongrats, onEngagementUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const engagementPercentage = Math.min((timeSpent / (readingTime * 60)) * 100, 100);

  return (
    <>
      {/* Reading Time Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-4 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[140px]"
      >
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{readingTime} min read</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isReading ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
            <span>Time: {formatTime(timeSpent)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${engagementPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Congratulations Message */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Great job! 🎉</p>
                <p className="text-sm opacity-90">You've finished reading this article!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReadingEngagement;
