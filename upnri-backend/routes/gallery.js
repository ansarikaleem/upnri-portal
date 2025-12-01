const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuth } = require('../middleware/auth');
const Gallery = require('../models/Gallery');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/gallery/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get gallery images
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, eventId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (eventId) whereClause.eventId = eventId;

    const gallery = await Gallery.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      images: gallery.rows,
      totalPages: Math.ceil(gallery.count / limit),
      currentPage: parseInt(page),
      totalImages: gallery.count
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload image (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { title, description, category, eventId, visibility } = req.body;

    const galleryItem = await Gallery.create({
      title,
      description,
      imagePath: '/uploads/gallery/' + req.file.filename,
      category,
      eventId,
      visibility: visibility || 'public',
      uploadedBy: req.member.id
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: galleryItem
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete image (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Gallery.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', image.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;