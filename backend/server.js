import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedData } from './seed.js';
import { Listing } from './models/Listing.js';
import authRoutes from './routes/authRoutes.js';

import listingRoutes from './routes/listingRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const listingCount = await Listing.countDocuments();
    if (listingCount === 0 && process.env.NODE_ENV !== 'test') {
      console.log('🌱 Database is empty. Auto-seeding initial demo items...');
      await seedData(false);
    }
  } catch (err) {
    console.error('Auto-seed check error:', err.message);
  }
});


// CORS configuration (allow Vite dev client, Render/Vercel URLs)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads folder for locally uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CampusX API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Root API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CampusX API',
    version: '1.0.0',
    status: 'online',
    message: 'CampusX Backend REST API is running. Access API endpoints under /api/*',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      listings: '/api/listings',
      wishlist: '/api/wishlist',
      conversations: '/api/conversations',
      reports: '/api/reports',
      users: '/api/users',
    },
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 CampusX API server is running on http://localhost:${PORT}`);
  });
}

export { server };
export default app;

