const express = require('express');
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|mp4|avi|mkv|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Student routes
router.use(protect);

// Get materials for student's batch
router.get('/', async (req, res) => {
  try {
    const userBatch = req.user.batch;
    const materials = await Material.find({ 
      $or: [
        { batch: userBatch },
        { batch: 'all' }
      ]
    }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download material
router.get('/download/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads', material.filename);
    res.download(filePath, material.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.use(restrictTo('admin'));

// Upload material
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const material = await Material.create({
      title: req.body.title,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      batch: req.body.batch,
      category: req.body.category,
      uploadedBy: req.user.name
    });
    
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all materials
router.get('/admin/all', async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete material
router.delete('/:id', async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;