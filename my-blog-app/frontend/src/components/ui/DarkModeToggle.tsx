import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Check stored preference or system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setIsDark(JSON.parse(stored));
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply dark mode class to document
    const root = document.documentElement;
    const body = document.body;
    
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    
    // Store preference
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: { isDark } }));
  }, [isDark, mounted]);

  const toggleDarkMode = () => {
    if (mounted) {
      setIsDark(!isDark);
    }
  };

  return { isDark, toggleDarkMode, mounted };
}

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const { isDark, toggleDarkMode, mounted } = useDarkMode();

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`w-14 h-7 bg-gray-200 rounded-full animate-pulse ${className}`}></div>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`group relative inline-flex items-center justify-center w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg hover:scale-105 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
      }`}></div>
      
      {/* Toggle circle */}
      <span
        className={`relative w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center text-sm z-10 ${
          isDark ? 'translate-x-3.5' : '-translate-x-3.5'
        } group-hover:scale-110`}
      >
        {isDark ? (
          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
          </svg>
        )}
      </span>
    </button>
  );
}
