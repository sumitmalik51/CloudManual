import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchSuggestions: string[];
  isSearching: boolean;
  debouncedSearch: (query: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  showSuggestions,
  setShowSuggestions,
  searchSuggestions,
  isSearching,
  debouncedSearch,
  onSuggestionClick
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <section 
      className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-32 px-6 text-center overflow-visible"
      style={{ zIndex: 1 }}
    >
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Tech Icons with enhanced animations */}
        <div className="absolute top-20 right-1/4 text-white/10 animate-float-gentle">
          <svg className="w-16 h-16 animate-rotate-in" fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.5s' }}>
            <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.5 5-6.5h-3.053c.258-3.531 3.249-6.297 6.863-6.485v2.485l6.5-5-6.5-5v2.5zm-3 20c5.621 0 10.211-4.443 10.475-10h3.025l-5-6.5-5 6.5h3.053c-.258 3.531-3.249 6.297-6.863 6.485v-2.485l-6.5 5 6.5 5v-2.5z"/>
          </svg>
        </div>
        <div className="absolute bottom-32 right-16 text-white/10 animate-float-delayed">
          <svg className="w-12 h-12 animate-slide-in-right" fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '1s' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="absolute top-1/3 left-16 text-white/10 animate-float-gentle">
          <svg className="w-14 h-14 animate-slide-in-left" fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '1.5s' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[10, 20, 30, 70, 80, 90].map((left, index) => (
            <div 
              key={index}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle-float" 
              style={{ 
                left: `${left}%`, 
                animationDelay: `${index * 1}s` 
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* AI-Powered Modern Title with enhanced animations */}
        <div className="mb-8">
          {/* Main Title with AI Effects */}
          <div className="relative text-center">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-3xl animate-enhanced-glow"></div>
            
            {/* Main CloudManual Text */}
            <h1 className="relative text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none animate-fade-in-up">
              <span className="ai-title-text">
                CloudManual
              </span>
            </h1>
            
            {/* AI Subtitle with typing effect */}
            <div className="text-center mb-6">
              <p className="text-xl md:text-2xl text-cyan-100 font-light tracking-wide opacity-90 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                Powered by AI • Guided by Experts • Built for the Future
              </p>
            </div>
          </div>
          
          {/* Live Badge - Clickable with enhanced animation */}
          <div className="flex justify-center mb-6 animate-slide-in-right" style={{ animationDelay: '1s' }}>
            <Link 
              to="/whats-new"
              className="group flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:rotate-1"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:animate-bounce"></div>
              <span className="text-sm font-semibold text-green-100 group-hover:text-white">Live & Updated Daily</span>
              <svg className="w-4 h-4 text-green-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <p className="text-xl md:text-3xl mb-12 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-lg text-blue-100 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
          Your modern guide to Cloud, AI, and DevOps — hands-on, simplified, and real-world focused.
        </p>
        
        {/* Premium Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 relative z-50">
          <div className="relative group cursor-text" onClick={() => searchInputRef.current?.focus()}>
            {/* Enhanced Animated Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-lg transition-all duration-700 animate-enhanced-glow ${
              searchFocused ? 'opacity-80 scale-110' : 'opacity-30 group-hover:opacity-60 group-hover:scale-105'
            }`}></div>
            
            {/* Moving Border Animation */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl transition-all duration-1000 ${
                searchFocused ? 'animate-[shimmer_2s_ease-in-out_infinite]' : 'group-hover:animate-[shimmer_3s_ease-in-out_infinite]'
              }`}></div>
            </div>
            
            {/* Main Search Container */}
            <div className={`relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 p-2 transition-all duration-500 transform ${
              searchFocused ? 'shadow-2xl ring-4 ring-blue-200/50 scale-110 rotate-1' : 'shadow-2xl hover:shadow-3xl hover:scale-105 hover:-rotate-1'
            }`}>
              <div className="flex items-center">
                <div className="flex-1 relative">
                  {/* Enhanced Search Icon */}
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <svg className={`h-6 w-6 transition-all duration-500 transform ${
                      searchFocused ? 'text-blue-500 scale-110 rotate-12' : 'text-gray-400 group-hover:text-blue-400 group-hover:scale-105 group-hover:rotate-6'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="e.g., GitHub Copilot, Azure Bicep, Docker, TypeScript..."
                    value={searchQuery}
                    onFocus={() => {
                      setSearchFocused(true);
                      if (searchQuery.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setSearchFocused(false);
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setShowSuggestions(false);
                        debouncedSearch(searchQuery);
                      }
                    }}
                    className="w-full pl-14 pr-6 py-4 text-lg text-gray-800 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-16 flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-16 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto backdrop-blur-xl"
                         style={{ zIndex: 999999 }}>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                          Popular Searches
                        </div>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link 
            to="/blog" 
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/20 transition-all duration-500 shadow-2xl hover:shadow-white/10 border border-white/20 hover:border-white/30 overflow-hidden transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center">
              Explore Articles
              <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm text-white rounded-2xl font-semibold border border-purple-400/30 hover:border-purple-400/50 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 hover:-translate-y-1"
          >
            <span className="flex items-center">
              Learn More
              <svg className="ml-2 w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
