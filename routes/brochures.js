const express = require('express');
const multer = require('multer');
const path = require('path');
const Brochure = require('../models/Brochure');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Multer configuration for brochures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brochures/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Public routes
// Get all active brochures
router.get('/', async (req, res) => {
  try {
    const brochures = await Brochure.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(brochures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download brochure
router.get('/download/:id', async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure || !brochure.isActive) {
      return res.status(404).json({ message: 'Brochure not found' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads', 'brochures', brochure.filename);
    res.download(filePath, brochure.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.use(protect, restrictTo('admin'));

// Get all brochures (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const brochures = await Brochure.find().sort({ createdAt: -1 });
    res.json(brochures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload brochure
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const brochure = await Brochure.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      pages: parseInt(req.body.pages),
      size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      image: req.body.image || '',
      featured: req.body.featured === 'true'
    });
    
    res.status(201).json(brochure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update brochure
router.put('/:id', async (req, res) => {
  try {
    const brochure = await Brochure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brochure) {
      return res.status(404).json({ message: 'Brochure not found' });
    }
    res.json(brochure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete brochure
router.delete('/:id', async (req, res) => {
  try {
    await Brochure.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brochure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;