import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    rotateX: 5
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0
  },
  out: {
    opacity: 0,
    y: -30,
    scale: 1.05,
    rotateX: -5
  }
};

const containerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.1
    }
  },
  in: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  out: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const childVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -10,
    scale: 1.1
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
        transition={{ 
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth animation
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;
