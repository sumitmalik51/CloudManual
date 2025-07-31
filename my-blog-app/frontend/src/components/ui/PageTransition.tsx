import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.4
};

const containerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.05
    }
  },
  in: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  out: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};



const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={containerVariants}
      className={className}
    >
      <motion.div
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;
