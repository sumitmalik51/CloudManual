import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from '../ui/DarkModeToggle';

const Header: React.FC = () => {
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsAtTop(scrollPosition < 10);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isAtTop 
          ? 'bg-transparent backdrop-blur-none' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-blue-500/10'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl blur-sm opacity-40 group-hover:opacity-70 transition-all duration-500 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white p-3 rounded-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-black transition-all duration-500 tracking-tight ${
                    isAtTop 
                      ? 'text-white dark:text-white group-hover:text-blue-200 drop-shadow-lg' 
                      : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>
                    CloudManual
                  </span>
                  <span className={`text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0 ${
                    isAtTop 
                      ? 'text-white/80 dark:text-white/80 drop-shadow-md' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Cloud • AI • DevOps
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <nav className="flex items-center space-x-2">
                <Link
                  to="/"
                  className={`group relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveLink('/') 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : isAtTop
                        ? 'text-white dark:text-white hover:text-blue-200 dark:hover:text-blue-200 hover:bg-white/10 dark:hover:bg-white/10 drop-shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className="relative z-10">Home</span>
                  {!isActiveLink('/') && (
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isAtTop 
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    }`}></div>
                  )}
                </Link>
                <Link
                  to="/blog"
                  className={`group relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveLink('/blog') 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : isAtTop
                        ? 'text-white dark:text-white hover:text-blue-200 dark:hover:text-blue-200 hover:bg-white/10 dark:hover:bg-white/10 drop-shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className="relative z-10">Posts</span>
                  {!isActiveLink('/blog') && (
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isAtTop 
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    }`}></div>
                  )}
                </Link>
                <Link
                  to="/about"
                  className={`group relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveLink('/about') 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : isAtTop
                        ? 'text-white dark:text-white hover:text-blue-200 dark:hover:text-blue-200 hover:bg-white/10 dark:hover:bg-white/10 drop-shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className="relative z-10">About</span>
                  {!isActiveLink('/about') && (
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isAtTop 
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    }`}></div>
                  )}
                </Link>
                <Link
                  to="/contact"
                  className={`group relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveLink('/contact') 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25' 
                      : isAtTop
                        ? 'text-white dark:text-white hover:text-blue-200 dark:hover:text-blue-200 hover:bg-white/10 dark:hover:bg-white/10 drop-shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className="relative z-10">Contact</span>
                  {!isActiveLink('/contact') && (
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isAtTop 
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    }`}></div>
                  )}
                </Link>
                {/* Admin button hidden for public site */}
                {/* {isAdmin && (
                  <Link
                    to="/admin"
                    className={`group relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      isActiveLink('/admin') 
                        ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/25' 
                        : 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    <span className="relative z-10">Admin</span>
                    {!isActiveLink('/admin') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </Link>
                )} */}
              </nav>
              <div className="ml-4">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
