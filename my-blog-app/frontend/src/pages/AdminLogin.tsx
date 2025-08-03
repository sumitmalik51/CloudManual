import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { blogAPI, authAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  // Check authentication status and setup requirements
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (blogAPI.isAuthenticated()) {
          navigate('/admin');
          return;
        }

        // Check if setup is required
        const status = await authAPI.checkSetupStatus();
        setSetupRequired(status.setupRequired);
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If we can't check status, assume normal login
        setSetupRequired(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await blogAPI.login(username, password);
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err: any) {
      // Handle specific error codes
      if (err.response?.data?.code === 'SETUP_REQUIRED') {
        setSetupRequired(true);
        setError('First-time setup required. Please set up your admin password.');
      } else if (err.response?.data?.code === 'RATE_LIMITED') {
        setError('Too many login attempts. Please try again in 15 minutes.');
      } else if (err.response?.data?.code === 'VALIDATION_ERROR') {
        const validationErrors = err.response.data.errors?.map((e: any) => e.msg).join(', ');
        setError(validationErrors || 'Validation failed');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // If we're still checking status, show loading
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // If setup is required, redirect to setup page
  if (setupRequired) {
    navigate('/admin/setup');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-3xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            My Blog
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your admin password to access the dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter admin password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Security Information</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Enhanced security with JWT tokens and encrypted passwords
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Your credentials are securely encrypted and protected
              </p>
            </div>
          </div>

          {/* Back to Site */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
