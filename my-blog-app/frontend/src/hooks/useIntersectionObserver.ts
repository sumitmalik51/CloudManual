import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface IntersectionObserverResult {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement | null>, IntersectionObserverResult] => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);

        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, { isIntersecting, entry }];
};

// Batch intersection observer for multiple elements (performance optimization)
export const useBatchIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  const {
    threshold = 0.1,
    rootMargin = '0px'
  } = options;

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      threshold,
      rootMargin
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, threshold, rootMargin]);

  const observe = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
      elementsRef.current.add(element);
    }
  };

  const unobserve = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  };

  const disconnect = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
    }
  };

  return { observe, unobserve, disconnect };
};

// Hook for fade-in animations with intersection observer
export const useFadeInOnScroll = (options: UseIntersectionObserverOptions = {}) => {
  const [ref, { isIntersecting }] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    ...options
  });

  return {
    ref,
    isVisible: isIntersecting,
    animationClass: isIntersecting 
      ? 'opacity-100 translate-y-0 transform transition-all duration-700 ease-out' 
      : 'opacity-0 translate-y-8 transform transition-all duration-700 ease-out'
  };
};
