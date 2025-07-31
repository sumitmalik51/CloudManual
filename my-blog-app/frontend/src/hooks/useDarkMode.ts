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
      // Default to system preference
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
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