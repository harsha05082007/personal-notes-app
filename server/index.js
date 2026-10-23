const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_notes';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Personal Notes API is up and running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Root friendly route
app.get('/', (req, res) => {
  res.send('Personal Notes API Server is running. Access endpoints via /api/auth and /api/notes');
});

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected successfully!`);
  } catch (error) {
    console.error(`MongoDB connection warning/error: ${error.message}`);
    console.log('Server will continue running. Ensure MongoDB is active or update MONGODB_URI in server/.env');
  }

  app.listen(PORT, () => {
    console.log(`Personal Notes Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
