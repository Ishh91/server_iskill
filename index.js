const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Determine uploads directory based on environment
const UPLOADS_DIR = process.env.AWS_LAMBDA_FUNCTION_NAME 
  ? '/tmp/uploads' 
  : path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create brochures subdirectory
const brochuresDir = path.join(UPLOADS_DIR, 'brochures');
if (!fs.existsSync(brochuresDir)) {
  fs.mkdirSync(brochuresDir, { recursive: true });
}

// Serve static files from the appropriate directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Database connection - remove deprecated options
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/brochures', require('./routes/brochures'));

// Export for serverless environments
module.exports = app;

// Only listen if not in Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}