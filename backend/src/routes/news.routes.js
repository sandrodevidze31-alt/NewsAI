import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

/**
 * @route   GET /api/news
 * @desc    Get all news articles with AI analysis
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, stock, eventType } = req.query;

  let queryText = `
    SELECT
      na.*,
      aa.event_type,
      aa.sentiment_score,
      aa.confidence_score,
      aa.key_insights,
      aa.rationale,
      aa.risk_factors,
      aa.analyzed_at
    FROM news_articles na
    LEFT JOIN ai_analysis aa ON na.id = aa.article_id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Filter by stock symbol
  if (stock) {
    queryText += ` AND na.related_stocks @> $${paramCount}::jsonb`;
    params.push(JSON.stringify([stock]));
    paramCount++;
  }

  // Filter by event type
  if (eventType) {
    queryText += ` AND aa.event_type = $${paramCount}`;
    params.push(eventType);
    paramCount++;
  }

  queryText += `
    ORDER BY na.published_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  params.push(parseInt(limit), parseInt(offset));

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: {
      articles: result.rows,
      count: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}));

/**
 * @route   GET /api/news/:id
 * @desc    Get single news article with full analysis
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(`
    SELECT
      na.*,
      aa.id as analysis_id,
      aa.event_type,
      aa.sentiment_score,
      aa.confidence_score,
      aa.recommendation,
      aa.rationale,
      aa.risk_factors,
      aa.historical_context,
      aa.key_insights,
      aa.analyzed_at,
      aa.model_version
    FROM news_articles na
    LEFT JOIN ai_analysis aa ON na.id = aa.article_id
    WHERE na.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Article not found');
  }

  // Get recommendations for this article
  const recommendations = await query(`
    SELECT r.*
    FROM recommendations r
    JOIN ai_analysis aa ON r.analysis_id = aa.id
    WHERE aa.article_id = $1 AND r.is_active = true
    ORDER BY r.confidence DESC
  `, [id]);

  const article = result.rows[0];
  article.recommendations = recommendations.rows;

  res.json({
    success: true,
    data: article
  });
}));

/**
 * @route   GET /api/news/stock/:symbol
 * @desc    Get news for specific stock
 * @access  Private
 */
router.get('/stock/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { limit = 20 } = req.query;

  const result = await query(`
    SELECT
      na.*,
      aa.event_type,
      aa.sentiment_score,
      aa.confidence_score,
      aa.key_insights,
      aa.analyzed_at
    FROM news_articles na
    LEFT JOIN ai_analysis aa ON na.id = aa.article_id
    WHERE na.related_stocks @> $1::jsonb
    ORDER BY na.published_at DESC
    LIMIT $2
  `, [JSON.stringify([symbol.toUpperCase()]), parseInt(limit)]);

  res.json({
    success: true,
    data: {
      stock: symbol.toUpperCase(),
      articles: result.rows,
      count: result.rows.length
    }
  });
}));

/**
 * @route   GET /api/news/stats/summary
 * @desc    Get news statistics summary
 * @access  Private
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const totalArticles = await query(`
    SELECT COUNT(*) as count FROM news_articles
  `);

  const analyzedArticles = await query(`
    SELECT COUNT(*) as count FROM ai_analysis
  `);

  const last24Hours = await query(`
    SELECT COUNT(*) as count
    FROM news_articles
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `);

  const byEventType = await query(`
    SELECT event_type, COUNT(*) as count
    FROM ai_analysis
    GROUP BY event_type
    ORDER BY count DESC
  `);

  res.json({
    success: true,
    data: {
      total_articles: parseInt(totalArticles.rows[0].count),
      analyzed_articles: parseInt(analyzedArticles.rows[0].count),
      last_24_hours: parseInt(last24Hours.rows[0].count),
      by_event_type: byEventType.rows
    }
  });
}));

export default router;
