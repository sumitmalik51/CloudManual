import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('darkMode');
    if (stored) {
      setIsDark(stored === 'true');
    } else {
      // Default to system preference with defensive check
      if (typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
        try {
          setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } catch (error) {
          console.warn('Error accessing matchMedia in useDarkMode:', error);
          setIsDark(false);
        }
      } else {
        setIsDark(false);
      }
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark, mounted]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle, mounted };
}