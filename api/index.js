// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Only load dotenv if not in production (Vercel provides env vars)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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

// Database connection helper for serverless
let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  // Set mongoose options for better serverless performance
  mongoose.set('strictQuery', true);
  
  cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  });
  
  console.log('MongoDB Connected');
  return cachedConnection;
};

// Database connectivity middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Often needed for Vercel/External APIs
}));
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
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
