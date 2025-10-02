const express = require('express');
const nodemailer = require('nodemailer');
const Lead = require('../models/Lead');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Submit lead
router.post('/', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    
    // Send email notification to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Lead: ${lead.source}`,
      html: `
        <h3>New Lead Received</h3>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Course:</strong> ${lead.course}</p>
        <p><strong>Message:</strong> ${lead.message}</p>
        <p><strong>Source:</strong> ${lead.source}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ message: 'Lead submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes
router.use(protect, restrictTo('admin'));

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead status
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;