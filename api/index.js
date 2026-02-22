// Vercel serverless function entry point
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('../backend/routes/auth');
const doctorRoutes = require('../backend/routes/doctor');
const patientRoutes = require('../backend/routes/patient');
const pharmacyRoutes = require('../backend/routes/pharmacy');
const hospitalRoutes = require('../backend/routes/hospital');
const localRoutes = require('../backend/routes/local');

// Import middleware
const { errorHandler } = require('../backend/middleware/errorHandler');
const { apiLimiter } = require('../backend/middleware/rateLimiter');

const app = express();

// Database connection (only connect if not already connected)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/local', localRoutes);

// Error handling
app.use(errorHandler);

// Export the Express app for Vercel
module.exports = app;
