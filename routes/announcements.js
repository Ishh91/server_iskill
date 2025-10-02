const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Student routes
router.use(protect);

// Get announcements for student's batch
router.get('/', async (req, res) => {
  try {
    const userBatch = req.user.batch;
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { targetBatch: userBatch },
        { targetBatch: 'all' }
      ]
    }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.use(restrictTo('admin'));

// Get all announcements
router.get('/admin/all', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;