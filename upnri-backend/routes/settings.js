const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Setting = require('../models/Setting');

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.findAll();
    
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.settingKey] = setting.settingValue;
    });

    res.json(settingsObject);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await Setting.upsert({
        settingKey: key,
        settingValue: value
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;