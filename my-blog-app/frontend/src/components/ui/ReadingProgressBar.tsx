import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrolled / maxHeight) * 100;
      setProgress(scrollProgress);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/30 dark:bg-gray-700/30">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
      {/* Glowing effect */}
      <motion.div
        className="absolute top-0 h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-sm opacity-50"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

export default ReadingProgressBar;
