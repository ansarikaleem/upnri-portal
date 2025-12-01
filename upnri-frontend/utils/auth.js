export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    try {
      const token = localStorage.getItem('token');
      return !!token && token !== 'undefined' && token !== 'null';
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    if (typeof window === 'undefined') return false;
    try {
      const member = localStorage.getItem('member');
      if (!member || member === 'undefined' || member === 'null') return false;
      
      const memberData = JSON.parse(member);
      return memberData.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const member = localStorage.getItem('member');
      if (!member || member === 'undefined' || member === 'null') return null;
      
      return JSON.parse(member);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Login with enhanced error handling
  login: (token, userData) => {
    try {
      if (!token) {
        throw new Error('Token is required for login');
      }
      
      if (!userData) {
        throw new Error('User data is required for login');
      }

      // Validate token format (basic validation)
      if (typeof token !== 'string' || token.length < 10) {
        throw new Error('Invalid token format');
      }

      // Validate user data
      if (typeof userData !== 'object' || userData === null) {
        throw new Error('Invalid user data format');
      }

      console.log('🔐 Storing auth data:', { 
        tokenLength: token.length,
        user: { id: userData.id, email: userData.email, role: userData.role }
      });

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('member', JSON.stringify(userData));

      // Verify storage
      const storedToken = localStorage.getItem('token');
      const storedMember = localStorage.getItem('member');

      if (storedToken !== token) {
        throw new Error('Token storage failed');
      }

      if (!storedMember) {
        throw new Error('User data storage failed');
      }

      console.log('✅ Login successful - data stored in localStorage');
      return true;

    } catch (error) {
      console.error('❌ Login storage error:', error);
      
      // Clear any partial data
      authService.logout();
      throw error;
    }
  },

  // Login with enhanced error handling
  adminLogin: (token, admin) => {
    try {
      if (!token) {
        throw new Error('Token is required for login');
      }
      
      if (!admin) {
        throw new Error('User data is required for login');
      }

      // Validate token format (basic validation)
      if (typeof token !== 'string' || token.length < 10) {
        throw new Error('Invalid token format');
      }

      // Validate user data
      if (typeof admin !== 'object' || admin === null) {
        throw new Error('Invalid user data format');
      }

      console.log('🔐 Storing auth data:', { 
        tokenLength: token.length,
        user: { id: admin.id, email: admin.email, role: admin.role }
      });

      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('member', JSON.stringify(admin));

      // Verify storage
      const storedToken = localStorage.getItem('adminToken');
      const storedMember = localStorage.getItem('member');

      if (storedToken !== token) {
        throw new Error('Token storage failed');
      }

      if (!storedMember) {
        throw new Error('User data storage failed');
      }

      console.log('✅ Login successful - data stored in localStorage');
      return true;

    } catch (error) {
      console.error('❌ Login storage error:', error);
      
      // Clear any partial data
      authService.logout();
      throw error;
    }
  },

  // Login from API response (convenience method)
  loginFromResponse: (responseData) => {
    try {
      if (!responseData) {
        throw new Error('Response data is required');
      }

      const { token, member, admin } = responseData;
      
      // Use member or admin data
      const userData = member || admin;
      
      if (!token || !userData) {
        throw new Error('Invalid response format: missing token or user data');
      }

      return authService.login(token, userData);
    } catch (error) {
      console.error('❌ Login from response error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('member');
      
      // Clear all related items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auth_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Logout successful - all auth data cleared');
      
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  // Get auth headers
  getAuthHeaders: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        return {};
      }
      return { Authorization: `Bearer ${token}` };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {};
    }
  },

  // Validate token (check if token exists and is valid format)
  validateToken: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        return false;
      }
      
      // Basic token format validation (JWT tokens have 3 parts separated by dots)
      const tokenParts = token.split('.');
      return tokenParts.length === 3;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  // Refresh user data (useful when user data updates)
  refreshUserData: (newUserData) => {
    try {
      if (!newUserData) {
        throw new Error('New user data is required');
      }
      
      localStorage.setItem('member', JSON.stringify(newUserData));
      console.log('✅ User data refreshed');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      return false;
    }
  }
};