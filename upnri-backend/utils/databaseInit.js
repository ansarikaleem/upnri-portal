const Member = require('../models/Member');
const bcrypt = require('bcryptjs');

const initializeDatabase = async () => {
  try {
    // Check if admin user exists
    const adminExists = await Member.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    
    if (!adminExists) {
      // Create default admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      await Member.create({
        fullName: 'System Administrator',
        civilId: '000000000000',
        phone: '00000000',
        email: process.env.ADMIN_EMAIL,
        gender: 'male',
        district: 'Lucknow',
        area: 'Kuwait City',
        profession: 'Administrator',
        company: 'UPNRI Forum',
        password: adminPassword,
        consent: true,
        status: 'active',
        role: 'admin'
      });

      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@upnriforum.com');
      console.log('🔑 Password: admin123');
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

module.exports = initializeDatabase;