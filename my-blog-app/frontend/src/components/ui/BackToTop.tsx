import React, { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 group transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-75'
      }`}
      aria-label="Back to top"
    >
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-300 animate-pulse"></div>
      
      {/* Button Container */}
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full p-4 shadow-2xl border border-white/20 dark:border-gray-700/30 group-hover:scale-110 group-hover:shadow-3xl transition-all duration-300">
        {/* Arrow Icon */}
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
        
        {/* Ripple Effect on Click */}
        <div className="absolute inset-0 rounded-full bg-blue-400/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
      </div>
      
      {/* Floating Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
        Back to top
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90 dark:border-t-white/90"></div>
      </div>
    </button>
  );
};

export default BackToTop;
