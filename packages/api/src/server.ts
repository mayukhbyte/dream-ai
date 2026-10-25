import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { setupRealtime } from './realtime';
import { db } from './db';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Setup Real-time WebSockets
setupRealtime(io);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Dream Food Delivery Real-Time API',
    stats: {
      restaurants: db.getRestaurants().length,
      dishes: db.getMenuItems().length,
      orders: db.getOrders().length
    }
  });
});

// Live telemetry snapshot endpoint
app.get('/api/telemetry/live', (req: Request, res: Response) => {
  const activeOrders = db.getOrders().filter(o => o.status !== 'DELIVERED');
  res.status(200).json({
    success: true,
    activeOrdersCount: activeOrders.length,
    activeOrders: activeOrders.map(o => ({
      id: o.id,
      dish: o.dish,
      restaurant: o.restaurantName,
      status: o.status,
      telemetry: o.telemetry
    }))
  });
});

// API routes
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import orderRoutes from './routes/order.routes';
import aiRoutes from './routes/ai.routes';

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 DreamFood Real-Time API Server running on http://localhost:${PORT}`);
  console.log(`⚡ Socket.IO real-time WebSocket listening on ws://localhost:${PORT}`);
  console.log(`📦 Loaded ${db.getRestaurants().length} restaurants and ${db.getMenuItems().length} menu items from real database store.`);
});

export default app;