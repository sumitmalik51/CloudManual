import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '../ui/BackToTop';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="floating-element top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="floating-element-delay top-40 right-32 w-48 h-48 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>
        <div className="floating-element-slow bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl"></div>
      </div>
      
      <Header />
      <main className={`flex-grow relative z-10 pt-20 ${className}`}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
