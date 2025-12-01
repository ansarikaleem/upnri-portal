const express = require('express');
const cors = require('./config/cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const initializeDatabase = require('./utils/databaseInit');

// Load environment variables
dotenv.config();

// Import routes
const memberRoutes = require('./routes/members');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');
const eventRoutes = require('./routes/events');
const businessRoutes = require('./routes/businesses');
const galleryRoutes = require('./routes/gallery');
const pageRoutes = require('./routes/pages');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/members-dashboard');
const testRoutes = require('./routes/test');
const connectionRoutes = require('./routes/connections');
const adminBusinessRoutes = require('./routes/admin-businesses');

// Import database connection
const { connectDB } = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB().then(() => {
  // Initialize database with default data
  initializeDatabase();
});

// API Routes
app.use('/api/members', memberRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/members/dashboard', dashboardRoutes);
app.use('/api', testRoutes); // Test routes
app.use('/api/connections', connectionRoutes);
app.use('/api/admin/businesses', adminBusinessRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'UPNRI Forum API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test route: http://localhost:${PORT}/api/test`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
});

module.exports = app;