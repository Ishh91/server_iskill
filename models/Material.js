const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['notes', 'assignment', 'resource', 'video'],
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);