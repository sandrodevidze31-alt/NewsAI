import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

/**
 * @route   GET /api/recommendations
 * @desc    Get all active recommendations
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 50, action, stock, minConfidence } = req.query;

  let queryText = `
    SELECT
      r.*,
      na.title as article_title,
      na.url as article_url,
      na.published_at as article_date,
      aa.event_type,
      aa.sentiment_score,
      aa.key_insights
    FROM recommendations r
    JOIN ai_analysis aa ON r.analysis_id = aa.id
    JOIN news_articles na ON aa.article_id = na.id
    WHERE r.is_active = true
      AND r.expires_at > NOW()
  `;

  const params = [];
  let paramCount = 1;

  // Filter by action (BUY/SELL/HOLD)
  if (action) {
    queryText += ` AND r.action = $${paramCount}`;
    params.push(action.toUpperCase());
    paramCount++;
  }

  // Filter by stock
  if (stock) {
    queryText += ` AND r.stock_symbol = $${paramCount}`;
    params.push(stock.toUpperCase());
    paramCount++;
  }

  // Filter by minimum confidence
  if (minConfidence) {
    queryText += ` AND r.confidence >= $${paramCount}`;
    params.push(parseFloat(minConfidence));
    paramCount++;
  }

  queryText += `
    ORDER BY r.created_at DESC, r.confidence DESC
    LIMIT $${paramCount}
  `;

  params.push(parseInt(limit));

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: {
      recommendations: result.rows,
      count: result.rows.length
    }
  });
}));

/**
 * @route   GET /api/recommendations/top
 * @desc    Get top recommendations (highest confidence)
 * @access  Private
 */
router.get('/top', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const result = await query(`
    SELECT
      r.*,
      na.title as article_title,
      na.url as article_url,
      na.published_at as article_date,
      na.source,
      aa.event_type,
      aa.sentiment_score,
      aa.key_insights,
      aa.historical_context
    FROM recommendations r
    JOIN ai_analysis aa ON r.analysis_id = aa.id
    JOIN news_articles na ON aa.article_id = na.id
    WHERE r.is_active = true
      AND r.expires_at > NOW()
      AND r.confidence >= 0.7
    ORDER BY r.confidence DESC, r.created_at DESC
    LIMIT $1
  `, [parseInt(limit)]);

  res.json({
    success: true,
    data: result.rows
  });
}));

/**
 * @route   GET /api/recommendations/stock/:symbol
 * @desc    Get recommendations for specific stock
 * @access  Private
 */
router.get('/stock/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const result = await query(`
    SELECT
      r.*,
      na.title as article_title,
      na.url as article_url,
      na.published_at as article_date,
      aa.event_type,
      aa.sentiment_score,
      aa.key_insights,
      aa.historical_context
    FROM recommendations r
    JOIN ai_analysis aa ON r.analysis_id = aa.id
    JOIN news_articles na ON aa.article_id = na.id
    WHERE r.stock_symbol = $1
      AND r.is_active = true
      AND r.expires_at > NOW()
    ORDER BY r.created_at DESC
    LIMIT 20
  `, [symbol.toUpperCase()]);

  res.json({
    success: true,
    data: {
      stock: symbol.toUpperCase(),
      recommendations: result.rows,
      count: result.rows.length
    }
  });
}));

/**
 * @route   GET /api/recommendations/summary
 * @desc    Get recommendations summary dashboard
 * @access  Private
 */
router.get('/summary/dashboard', asyncHandler(async (req, res) => {
  // Count by action
  const byAction = await query(`
    SELECT action, COUNT(*) as count
    FROM recommendations
    WHERE is_active = true AND expires_at > NOW()
    GROUP BY action
  `);

  // Average confidence by action
  const avgConfidence = await query(`
    SELECT action, ROUND(AVG(confidence)::numeric, 2) as avg_confidence
    FROM recommendations
    WHERE is_active = true AND expires_at > NOW()
    GROUP BY action
  `);

  // Top performing stocks (most recommendations)
  const topStocks = await query(`
    SELECT stock_symbol, stock_name, COUNT(*) as recommendation_count
    FROM recommendations
    WHERE is_active = true AND expires_at > NOW()
    GROUP BY stock_symbol, stock_name
    ORDER BY recommendation_count DESC
    LIMIT 10
  `);

  // Recent high-confidence recommendations
  const recentHighConfidence = await query(`
    SELECT
      r.stock_symbol,
      r.action,
      r.confidence,
      r.target_change,
      na.title
    FROM recommendations r
    JOIN ai_analysis aa ON r.analysis_id = aa.id
    JOIN news_articles na ON aa.article_id = na.id
    WHERE r.is_active = true
      AND r.expires_at > NOW()
      AND r.confidence >= 0.75
    ORDER BY r.created_at DESC
    LIMIT 5
  `);

  res.json({
    success: true,
    data: {
      by_action: byAction.rows,
      avg_confidence: avgConfidence.rows,
      top_stocks: topStocks.rows,
      recent_high_confidence: recentHighConfidence.rows
    }
  });
}));

/**
 * @route   GET /api/recommendations/historical/:symbol
 * @desc    Get historical pattern data for a stock
 * @access  Private
 */
router.get('/historical/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const result = await query(`
    SELECT * FROM historical_patterns
    WHERE stock_symbol = $1
    ORDER BY confidence DESC
  `, [symbol.toUpperCase()]);

  res.json({
    success: true,
    data: {
      stock: symbol.toUpperCase(),
      patterns: result.rows
    }
  });
}));

export default router;
