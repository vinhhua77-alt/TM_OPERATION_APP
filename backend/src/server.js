/**
 * THÁI MẬU GROUP - OPERATION APP
 * Backend Server (Node.js + Express)
 * 
 * Entry point cho webapp backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { initSheetsClient } from './infra/sheet.repo.js'; // Legacy removed
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import passwordResetRoutes from './routes/password-reset.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import staffRoutes from './routes/staff.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import masterRoutes from './routes/master.routes.js';
import leaderRoutes from './routes/leader.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Render/Vercel
app.set('trust proxy', 1);

// TEMPORARILY DISABLE HELMET FOR DEBUGGING
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// CORS Configuration - Simplified for production
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/leader', leaderRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email User: ${process.env.EMAIL_USER || 'NOT SET'}`);
});

export default app;
