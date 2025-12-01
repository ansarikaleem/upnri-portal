import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Try admin token first, then regular token
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('member');
      
      // Redirect to appropriate login based on current path
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  verifyToken: () => api.post('/auth/verify'),
  
  // Members
  registerMember: (data) => api.post('/members/register', data),
  getMembers: (params) => api.get('/members', { params }),
  getProfile: () => api.get('/members/profile'),
  updateProfile: (data) => api.put('/members/profile', data),
  getOfficeBearers: () => api.get('/members/office-bearers'),
  
   // Admin Member Management
  getAdminMembers: (params) => api.get('/members/admin/members', { params }),
  updateMemberStatus: (id, status) => api.put(`/members/admin/members/${id}/status`, { status }),
  updateMemberRole: (id, data) => api.put(`/members/admin/members/${id}/role`, data),
  getAdminMembers: (params) => api.get('/admin/members', { params }),
  updateMemberStatus: (id, status) => api.put(`/admin/members/${id}/status`, { status }),
  getMemberById: (id) => api.get(`/members/admin/members/${id}`),
  updateMember: (id, data) => api.put(`/members/admin/members/${id}`, data),



  // News
  getNews: (params) => api.get('/news', { params }),
  getNewsById: (id) => api.get(`/news/${id}`),
  createNews: (data) => api.post('/news', data),
  updateNews: (id, data) => api.put(`/news/${id}`, data),
  deleteNews: (id) => api.delete(`/news/${id}`),
  
  // Events
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  registerForEvent: (id, data) => api.post(`/events/${id}/register`, data),
  
  // Businesses
  getBusinesses: (params) => api.get('/businesses', { params }),
  getBusinessCategories: () => api.get('/businesses/categories'),
  registerBusiness: (data) => api.post('/businesses', data),
  getMyBusinesses: () => api.get('/businesses/my-businesses'),
  updateBusiness: (id, data) => api.put(`/businesses/${id}`, data),
  deleteBusiness: (id) => api.delete(`/businesses/${id}`),
  

  // Admin Businesses
  getAdminBusinesses: (params) => api.get('/admin/businesses', { params }),
  updateBusinessStatus: (id, status) => api.put(`/admin/businesses/${id}/status`, { status }),
  updateBusinessAdmin: (id, data) => api.put(`/admin/businesses/${id}`, data),
  deleteBusinessAdmin: (id) => api.delete(`/admin/businesses/${id}`),
  getBusinessStats: () => api.get('/admin/businesses/stats'),

  // Gallery
  getGallery: (params) => api.get('/gallery', { params }),
  uploadGalleryImage: (data) => api.post('/gallery', data),
  deleteGalleryImage: (id) => api.delete(`/gallery/${id}`),
  
  // Pages
  getPages: () => api.get('/pages'),
  getPage: (slug) => api.get(`/pages/${slug}`),
  createPage: (data) => api.post('/pages', data),
  updatePage: (id, data) => api.put(`/pages/${id}`, data),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  
  // Admin
  getAdminStats: () => api.get('/admin/stats'),
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  approveItem: (type, id, action) => api.post(`/admin/approve/${type}/${id}`, { action }),

  // Dashboard
  getDashboardStats: () => api.get('/members/dashboard/stats'),
  getDashboardActivities: () => api.get('/members/dashboard/activities'),

  // Test connection
  testConnection: () => api.get('/test'),

  // registerForEventPublic: (id, data) => api.post(`/events/${id}/register-public`, data),
  getEventBySlug: (slug) => api.get(`/events/public/${slug}`),
  registerForEvent: (id, data) => api.post(`/events/${id}/register-public`, data),
  getEventRegistrations: (id) => api.get(`/events/${id}/registrations`),
  updateEventRegistrationForm: (id, data) => api.put(`/events/${id}/registration-form`, data),

  // Connections
  sendConnectionRequest: (data) => api.post('/connections/request', data),
  getConnectionRequests: (params) => api.get('/connections/requests', { params }),
  getUnreadConnectionCount: () => api.get('/connections/requests/unread-count'),
  acceptConnectionRequest: (id) => api.put(`/connections/requests/${id}/accept`),
  rejectConnectionRequest: (id) => api.put(`/connections/requests/${id}/reject`),
  cancelConnectionRequest: (id) => api.put(`/connections/requests/${id}/cancel`),
  getConnections: () => api.get('/connections/connections'),


};

export default api;