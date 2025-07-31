import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollProgressProps {
  showScrollToTop?: boolean;
  showProgress?: boolean;
  className?: string;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({
  showScrollToTop = true,
  showProgress = true,
  className = ''
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    setScrollProgress(Math.min(progress, 100));
    
    // Determine scroll direction
    if (scrollTop > lastScrollY && scrollTop > 100) {
      setScrollDirection('down');
    } else if (scrollTop < lastScrollY) {
      setScrollDirection('up');
    }
    setLastScrollY(scrollTop);
    
    // Show/hide scroll to top button
    setIsVisible(scrollTop > 400);
  }, [lastScrollY]);

  useEffect(() => {
    const throttledScrollHandler = throttle(calculateScrollProgress, 16); // 60fps
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [calculateScrollProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          className={`fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left ${className}`}
          style={{ scaleX: scrollProgress / 100 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: scrollProgress / 100 }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <AnimatePresence>
          {isVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                rotate: scrollDirection === 'up' ? 0 : 180
              }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            >
              {/* Progress circle */}
              <svg className="absolute inset-0 w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              
              {/* Arrow icon */}
              <svg 
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                />
              </svg>
              
              {/* Percentage indicator */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {Math.round(scrollProgress)}%
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

// Throttle function for performance
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export default ScrollProgress;
