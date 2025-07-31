import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setScrollProgress(Math.min(progress, 100));
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    setIsClicked(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Reset click state after animation
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotate: [0, 5, -5, 0]
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5, 
            y: 100,
            transition: { duration: 0.2 }
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            onClick={scrollToTop}
            whileHover={{ 
              scale: 1.15,
              rotate: [0, -10, 10, 0],
              transition: { rotate: { duration: 0.5 } }
            }}
            whileTap={{ 
              scale: 0.9,
              rotate: 360,
              transition: { duration: 0.3 }
            }}
            className="relative group"
            aria-label="Back to top"
          >
            {/* Animated Ring Pulses */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md"></div>
            </motion.div>

            {/* Secondary Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 blur-lg"></div>
            </motion.div>

            {/* Progress Ring */}
            <motion.div className="absolute inset-2">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 20}` }}
                  animate={{ 
                    strokeDashoffset: `${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`,
                  }}
                  transition={{ duration: 0.1 }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            
            {/* Main Button */}
            <motion.div 
              className="relative w-16 h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/30 dark:border-gray-700/50 flex items-center justify-center overflow-hidden"
              animate={isClicked ? {
                background: ["rgba(255,255,255,0.95)", "rgba(59,130,246,0.95)", "rgba(255,255,255,0.95)"]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Sparkle Effects */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                      top: '20%',
                      left: '50%',
                      transformOrigin: '0 20px'
                    }}
                    animate={{
                      rotate: i * 60,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Arrow Icon */}
              <motion.svg 
                className="w-8 h-8 text-gray-700 dark:text-gray-200 relative z-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{
                  y: [0, -2, 0],
                  color: isClicked ? ["#374151", "#3B82F6", "#374151"] : "#374151"
                }}
                transition={{
                  y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  color: { duration: 0.6 }
                }}
              >
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                  animate={isClicked ? {
                    pathLength: [1, 0, 1]
                  } : {}}
                  transition={{ duration: 0.6 }}
                />
              </motion.svg>

              {/* Click Ripple Effect */}
              <AnimatePresence>
                {isClicked && (
                  <motion.div
                    className="absolute inset-0 bg-blue-400/30 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Enhanced Animated Tooltip */}
            <motion.div
              className="absolute bottom-full right-0 mb-4 pointer-events-none"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              whileHover={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="px-4 py-2 bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl backdrop-blur-sm border border-white/10"
                animate={{
                  boxShadow: [
                    "0 10px 25px rgba(0,0,0,0.1)",
                    "0 15px 35px rgba(59,130,246,0.2)",
                    "0 10px 25px rgba(0,0,0,0.1)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  animate={{
                    color: ["#FFFFFF", "#3B82F6", "#FFFFFF"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Back to top
                </motion.span>
                
                {/* Progress indicator in tooltip */}
                <div className="mt-1 text-xs opacity-60">
                  {Math.round(scrollProgress)}% scrolled
                </div>
                
                {/* Tooltip Arrow */}
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90 dark:border-t-white/90"></div>
              </motion.div>
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
