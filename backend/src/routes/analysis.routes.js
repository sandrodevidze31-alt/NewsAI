import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { reanalyzeArticle } from '../services/aiAnalysis.service.js';
import { startNewsAggregation } from '../services/newsAggregator.service.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

/**
 * @route   GET /api/analysis/:articleId
 * @desc    Get AI analysis for specific article
 * @access  Private
 */
router.get('/:articleId', asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const result = await query(`
    SELECT * FROM ai_analysis
    WHERE article_id = $1
  `, [articleId]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * @route   POST /api/analysis/reanalyze/:articleId
 * @desc    Re-analyze an article (for testing/debugging)
 * @access  Private
 */
router.post('/reanalyze/:articleId', asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const result = await reanalyzeArticle(articleId);

  res.json({
    success: true,
    message: 'Article re-analyzed successfully',
    data: result
  });
}));

/**
 * @route   POST /api/analysis/trigger
 * @desc    Manually trigger news aggregation (for testing)
 * @access  Private
 */
router.post('/trigger', asyncHandler(async (req, res) => {
  const result = await startNewsAggregation('manual');

  res.json({
    success: true,
    message: 'News aggregation triggered',
    data: result
  });
}));

export default router;
