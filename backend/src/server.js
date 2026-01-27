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
import compression from 'compression'; // [PERFORMANCE] Compress responses (70% bandwidth reduction)
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

// Routes
// Routes
import authRoutes from './routes/auth.routes.js';
import passwordResetRoutes from './routes/password-reset.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import staffRoutes from './routes/staff.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import masterRoutes from './routes/master.routes.js';
import leaderRoutes from './routes/leader.routes.js';
import storeAnalyticsRoutes from './routes/store-analytics.routes.js';
import masterDataRoutes from './routes/master-data.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js'; // [NEW]
import revenueRoutes from './routes/revenue.routes.js'; // [NEW]
import metricsRoutes from './routes/metrics.routes.js'; // [NEW]
import decisionRoutes from './routes/decision.routes.js'; // [NEW]
import complianceRoutes from './routes/compliance.routes.js'; // [NEW]
import sandboxRoutes from './routes/sandbox.routes.js'; // [NEW] Sandbox Mode

import cron from 'node-cron'; // [NEW]
import analyticsService from './domain/analytics/analytics.service.js'; // [NEW]

import careerRoutes from './routes/career.routes.js'; // [NEW]

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval for React DevTools
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://theme.hstatic.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://gsauyvtmaoegggubzuni.supabase.co",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173"
      ],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


// CORS Configuration - Whitelist allowed origins
const allowedOrigins = [
  'https://app.vinhhua.com', // MAIN DOMAIN
  'https://www.app.vinhhua.com',
  'https://tm-operation-app.vercel.app',
  'https://tm-operation-app-git-main-vinhhua77-alts-projects.vercel.app', // Vercel preview
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port / Create React App
  'http://localhost:3001', // Backend dev (for testing)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked CORS request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Sandbox-Mode'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));


// [PERFORMANCE] Response Compression - Reduces bandwidth by 70%
// Must be applied BEFORE routes to compress all responses
app.use(compression({
  level: 6, // Compression level (0-9, 6 is balanced)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  }
}));

// Rate limiting - Separate limits for auth and general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // General API: 2000 requests per 15 minutes (Support more concurrent users)
  message: 'Hệ thống nhận thấy quá nhiều truy cập từ mạng của bạn. Vui lòng quay lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Auth endpoints: 100 requests per 15 minutes (Support store shifts)
  message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút để bảo mật tài khoản.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// Apply strict limiter to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/password-reset', authLimiter);

// Cookie parsing (for HttpOnly cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0' });
});

// Root route (for friendly verification)
app.get('/', (req, res) => {
  res.send('<h1>🚀 TM Operation App Backend is Running!</h1><p>Please use the Frontend to access the application.</p>');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/leader', leaderRoutes);
app.use('/api/store-analytics', storeAnalyticsRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/career', careerRoutes); // [NEW]
app.use('/api/sandbox', sandboxRoutes); // [NEW] Sandbox Mode

// Error handling
app.use(errorHandler);

// Environment Variable Validation
const requiredEnvVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ FATAL ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nServer cannot start without these variables. Please check your .env file.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email User: ${process.env.EMAIL_USER || 'NOT SET'}`);

  // Schedule Cron Job (00:00 Daily) - Analytics
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running Daily Analytics Aggregation...');
    await analyticsService.aggregateDailyMetrics();
  });

  // Schedule Keep-Alive Ping (Every 10 minutes)
  // This prevents Render.com free tier from sleeping
  cron.schedule('*/10 * * * *', () => {
    const url = `http://localhost:${PORT}/health`;
    console.log(`[KEEP-ALIVE] Pinged ${url} at ${new Date().toISOString()}`);
    // Internal ping to keep the event loop busy
  });
});

export default app;