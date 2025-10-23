import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.routes.js';
import newsRoutes from './routes/news.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';

// Import services
import { startNewsAggregation } from './services/newsAggregator.service.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'News-AI Trading Insights API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      news: '/api/news',
      analysis: '/api/analysis',
      recommendations: '/api/recommendations'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Schedule news aggregation (twice daily)
const morningSchedule = process.env.CRON_MORNING || '0 9 * * *'; // 9 AM
const eveningSchedule = process.env.CRON_EVENING || '0 18 * * *'; // 6 PM

cron.schedule(morningSchedule, () => {
  logger.info('Starting morning news aggregation...');
  startNewsAggregation('morning');
});

cron.schedule(eveningSchedule, () => {
  logger.info('Starting evening news aggregation...');
  startNewsAggregation('evening');
});

logger.info(`News aggregation scheduled for: Morning ${morningSchedule}, Evening ${eveningSchedule}`);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API available at http://localhost:${PORT}`);

  // Run initial news aggregation on startup (optional)
  if (process.env.NODE_ENV === 'development') {
    logger.info('Running initial news aggregation...');
    setTimeout(() => startNewsAggregation('startup'), 5000);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
