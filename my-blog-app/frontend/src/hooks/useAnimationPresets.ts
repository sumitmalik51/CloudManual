import { useCallback } from 'react';
import type { Variants } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right';

interface AnimationPresets {
  fadeIn: (delay?: number, duration?: number) => Variants;
  slideIn: (direction?: Direction, delay?: number, duration?: number) => Variants;
  scaleIn: (delay?: number, duration?: number) => Variants;
  staggerContainer: (delayChildren?: number, staggerChildren?: number) => Variants;
  staggerItem: (delay?: number, duration?: number) => Variants;
}

export const useAnimationPresets = (): AnimationPresets => {
  const fadeIn = useCallback((delay = 0, duration = 0.6) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { 
      duration, 
      delay, 
      ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smoother animation
    }
  }), []);

  const slideIn = useCallback((direction: Direction = 'up', delay = 0, duration = 0.6) => {
    const directions: Record<Direction, { x?: number; y?: number }> = {
      up: { y: 30 },
      down: { y: -30 },
      left: { x: 30 },
      right: { x: -30 }
    };

    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...directions[direction] },
      transition: { 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    };
  }, []);

  const scaleIn = useCallback((delay = 0, duration = 0.6) => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { 
      duration, 
      delay, 
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  }), []);

  const staggerContainer = useCallback((delayChildren = 0.1, staggerChildren = 0.1) => ({
    animate: {
      transition: {
        delayChildren,
        staggerChildren
      }
    }
  }), []);

  const staggerItem = useCallback((delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0
    },
    transition: {
      duration: 0.6,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }), []);

  return {
    fadeIn,
    slideIn,
    scaleIn,
    staggerContainer,
    staggerItem
  };
};

export default useAnimationPresets;
