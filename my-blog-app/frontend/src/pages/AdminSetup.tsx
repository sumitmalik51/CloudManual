import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const AdminSetup: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string[]>([]);
  const navigate = useNavigate();

  // Check if setup is actually required
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const status = await authAPI.checkSetupStatus();
        if (!status.setupRequired) {
          // Setup not required, redirect to login
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
      }
    };

    checkSetupStatus();
  }, [navigate]);

  // Validate password strength in real-time
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength([]);
      return;
    }

    const errors = [];
    
    if (newPassword.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(newPassword)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(newPassword)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      errors.push('Password must contain at least one special character');
    }

    const weakPasswords = ['password', 'admin123', '123456', 'qwerty', 'letmein'];
    if (weakPasswords.includes(newPassword.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    setPasswordStrength(errors);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('Password is required');
      return;
    }
    
    if (passwordStrength.length > 0) {
      setError('Please fix password strength issues before continuing');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await authAPI.setup(newPassword, confirmPassword);
      
      // Redirect to login after successful setup
      navigate('/admin/login?setup=complete');
    } catch (err: any) {
      if (err.response?.data?.code === 'VALIDATION_ERROR') {
        const validationErrors = err.response.data.errors?.map((e: any) => e.msg).join(', ');
        setError(validationErrors || 'Validation failed');
      } else if (err.response?.data?.code === 'WEAK_PASSWORD') {
        setError(err.response.data.errors?.join('; ') || 'Password is too weak');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

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
            First-Time Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your secure admin password
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

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Admin Password
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter a strong password"
                  disabled={loading}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  {passwordStrength.length === 0 ? (
                    <p className="text-sm text-green-600">✓ Password meets all requirements</p>
                  ) : (
                    <div className="text-sm text-red-600">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="mt-1 list-disc list-inside">
                        {passwordStrength.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || passwordStrength.length > 0 || newPassword !== confirmPassword}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading || passwordStrength.length > 0 || newPassword !== confirmPassword
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
                    Setting up...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>

          {/* Security Information */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Security Features</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Password encryption with bcrypt
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                JWT token-based authentication
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Rate limiting and security headers
              </div>
            </div>
          </div>

          {/* Back to Home */}
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

export default AdminSetup;