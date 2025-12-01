-- Create database
CREATE DATABASE IF NOT EXISTS upnri_forum;
USE upnri_forum;

-- Members Table
CREATE TABLE IF NOT EXISTS members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  civil_id VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE,
  gender ENUM('male', 'female', 'other') NOT NULL,
  district VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  date_of_birth DATE,
  spouse_name VARCHAR(255),
  children_info TEXT,
  anniversary DATE,
  interests TEXT,
  qualifications TEXT,
  specialty VARCHAR(255),
  professional_interests TEXT,
  professional_profile TEXT,
  privacy_settings JSON DEFAULT ('{"personal": "all", "contact": "all", "professional": "all"}'),
  status ENUM('pending', 'active', 'suspended', 'archived') DEFAULT 'pending',
  role ENUM('member', 'moderator', 'editor', 'admin') DEFAULT 'member',
  consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_district (district),
  INDEX idx_profession (profession)
);

-- Business Directory Table
CREATE TABLE IF NOT EXISTS businesses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_details TEXT,
  logo VARCHAR(500),
  website_url VARCHAR(500),
  location TEXT,
  contact_phone VARCHAR(20),
  business_type VARCHAR(100),
  nature_of_business TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_member (member_id)
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  author_id INT,
  visibility ENUM('public', 'members') DEFAULT 'public',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  INDEX idx_visibility (visibility)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  venue VARCHAR(500),
  max_participants INT,
  featured_image VARCHAR(500),
  visibility ENUM('public', 'members') DEFAULT 'public',
  status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
  registration_form JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date),
  INDEX idx_status (status),
  INDEX idx_visibility (visibility)
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  member_id INT NOT NULL,
  form_data JSON,
  status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_member (event_id, member_id),
  INDEX idx_event (event_id),
  INDEX idx_member (member_id)
);

-- Member Posts Table
CREATE TABLE IF NOT EXISTS member_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  type ENUM('idea', 'shayari', 'status', 'general') DEFAULT 'general',
  image VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member (member_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  image_path VARCHAR(500) NOT NULL,
  event_id INT,
  category VARCHAR(100),
  visibility ENUM('public', 'members') DEFAULT 'public',
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_event (event_id),
  INDEX idx_category (category)
);

-- Information Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  page_type ENUM('static', 'dynamic') DEFAULT 'static',
  visibility ENUM('public', 'members') DEFAULT 'public',
  status ENUM('draft', 'published') DEFAULT 'published',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status)
);

-- Website Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSON,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default pages
INSERT IGNORE INTO pages (title, slug, content, page_type, visibility) VALUES
('About Us', 'about', '<p>UPNRI Forum Kuwait is a community organization dedicated to uniting people from Uttar Pradesh living in Kuwait. We strive to create a supportive community that celebrates our rich cultural heritage while helping members thrive in their personal and professional lives.</p>', 'static', 'public'),
('Constitution', 'constitution', '<p>Our constitution outlines the rules, regulations, and guiding principles of UPNRI Forum Kuwait...</p>', 'static', 'public'),
('President''s Message', 'presidents-message', '<p>Welcome to UPNRI Forum Kuwait! As your president, I am committed to strengthening our community bonds and creating opportunities for growth and collaboration.</p>', 'static', 'public');

-- Insert default settings
INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('website_title', '"UPNRI Forum Kuwait"', 'Website title'),
('website_description', '"Connecting UP community in Kuwait"', 'Website description'),
('contact_email', '"info@upnriforum.com"', 'Primary contact email'),
('theme', '{"mode": "light", "primary_color": "#3b82f6"}', 'Website theme settings');

-- Create uploads directory structure
-- This should be done at the OS level, but we''ll note it here
-- mkdir -p uploads/profiles uploads/businesses uploads/news uploads/events uploads/gallery