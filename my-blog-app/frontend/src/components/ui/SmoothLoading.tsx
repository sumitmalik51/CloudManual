import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  className?: string;
}

const loadingVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  }
};

const SmoothLoading: React.FC<SmoothLoadingProps> = ({
  isLoading,
  children,
  type = 'fade',
  duration = 0.3,
  className = ''
}) => {
  const variants = loadingVariants[type];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.div
          key="loading"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration, ease: "easeInOut" }}
          className={`flex items-center justify-center ${className}`}
        >
          <div className="relative">
            {/* Primary spinner */}
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            
            {/* Secondary ring */}
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" 
                 style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration, ease: "easeInOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmoothLoading;
