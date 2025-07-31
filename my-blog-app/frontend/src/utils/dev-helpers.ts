/**
 * Development helpers for admin authentication
 * These utilities help with testing admin functionality using the real backend
 */

const DEV_ADMIN_USERNAME = import.meta.env.VITE_DEV_ADMIN_USERNAME || 'admin';
const DEV_ADMIN_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'admin123';

// Development admin authentication helpers
const devAdminHelpers = {
  /**
   * Automatically login as admin using the real backend API
   */
  async loginAsAdmin() {
    try {
      const response = await fetch('http://localhost:5000/api/posts/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: DEV_ADMIN_USERNAME,
          password: DEV_ADMIN_PASSWORD
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store the real JWT token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      
      console.log('✅ Successfully logged in as admin');
      console.log('📝 Token stored in localStorage');
      console.log('🔄 Navigate to /admin to access dashboard');
      
      return data;
    } catch (error) {
      console.error('❌ Failed to login as admin:', error);
      throw error;
    }
  },

  /**
   * Clear admin authentication
   */
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    console.log('� Logged out from admin');
    console.log('🔄 Navigate away from admin pages');
  },

  /**
   * Check current admin authentication status
   */
  checkAuth() {
    const token = localStorage.getItem('adminToken');
    const isAdmin = localStorage.getItem('isAdmin');
    
    console.log('🔐 Admin Authentication Status:');
    console.log('  Token exists:', !!token);
    console.log('  Is Admin:', isAdmin === 'true');
    
    if (token) {
      try {
        // Decode JWT to show expiration (basic decode, not verified)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expDate = new Date(payload.exp * 1000);
        console.log('  Token expires:', expDate.toLocaleString());
        console.log('  Token valid:', expDate > new Date());
      } catch (e) {
        console.log('  Token format: Invalid JWT format');
      }
    }
    
    return { hasToken: !!token, isAdmin: isAdmin === 'true' };
  },

  /**
   * Quick admin panel access
   */
  openAdmin() {
    window.location.href = '/admin';
  }
};

// Make helpers available globally in development
if (import.meta.env.DEV) {
  (window as any).devAdmin = devAdminHelpers;
  console.log('🔧 Development admin helpers loaded');
  console.log('💡 Use these commands in console:');
  console.log('   • await window.devAdmin.loginAsAdmin() - Login with real backend');
  console.log('   • window.devAdmin.checkAuth() - Check auth status');
  console.log('   • window.devAdmin.logout() - Clear authentication');
  console.log('   • window.devAdmin.openAdmin() - Navigate to admin panel');
}
