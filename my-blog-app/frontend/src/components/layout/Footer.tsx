import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-gray-300 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/3 to-pink-600/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="group inline-block">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                CloudManual
              </h2>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md leading-relaxed">
              Your comprehensive guide to cloud technologies, tutorials, and best practices. 
              Master cloud computing with expert insights and practical guides.
            </p>
            <div className="mt-6 flex space-x-4">
              {/* Social Media Links */}
              <a
                href="#"
                className="group relative p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-800/50 backdrop-blur-sm"
                aria-label="Twitter"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="relative z-10 h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="group relative p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-800/50 backdrop-blur-sm"
                aria-label="GitHub"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="relative z-10 h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="#"
                className="group relative p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-800/50 backdrop-blur-sm"
                aria-label="LinkedIn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="relative z-10 h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 relative">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Quick Links
              </span>
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></span>
                  All Posts
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></span>
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 relative">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Categories
              </span>
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/blog?category=technology" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                  Technology
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog?category=programming" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                  Programming
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog?category=design" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                  Design
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog?category=lifestyle" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center"
                >
                  <span className="mr-2 w-1 h-1 bg-gray-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                  Lifestyle
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} CloudManual. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-y-[-1px]"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-y-[-1px]"
              >
                Terms of Service
              </Link>
              <a 
                href="mailto:contact@cloudmanual.com" 
                className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-y-[-1px]"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
