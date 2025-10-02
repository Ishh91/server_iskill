const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['admission', 'contact'],
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'enrolled', 'rejected'],
    default: 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);