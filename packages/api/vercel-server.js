/**
 * Vercel Serverless Function Adapter for Express App
 * This file adapts our Express API to work with Vercel's serverless functions
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Initialize Prisma Client (will be reused across invocations in warm containers)
let prisma;

// Initialize Prisma lazily to avoid connection issues
const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Dream Food Delivery API (Vercel Serverless)'
  });
});

// Import and mount routes
try {
  const authRoutes = require('./src/routes/auth.routes');
  const restaurantRoutes = require('./src/routes/restaurant.routes');
  const orderRoutes = require('./src/routes/order.routes');
  const aiRoutes = require('./src/routes/ai.routes');

  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/ai', aiRoutes);
} catch (routeError) {
  console.error('Error loading routes:', routeError);
  // Fallback routes for basic functionality
  app.get('/api/*', (req, res) => {
    res.status(500).json({
      error: 'Routes not properly loaded',
      details: routeError.message
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Vercel Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export the Express app as a Vercel serverless function
module.exports = app;