import Anthropic from '@anthropic-ai/sdk';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { getStockInfo } from '../config/stocks.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Get historical pattern for a stock and event type
 */
const getHistoricalPattern = async (stockSymbol, eventType) => {
  try {
    const result = await query(`
      SELECT * FROM historical_patterns
      WHERE stock_symbol = $1 AND event_type = $2
      ORDER BY last_updated DESC
      LIMIT 1
    `, [stockSymbol, eventType]);

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to fetch historical pattern:', error);
    return null;
  }
};

/**
 * Generate analysis prompt for Claude
 */
const generateAnalysisPrompt = (article, stockSymbols, historicalData) => {
  const stockInfo = stockSymbols.map(symbol => {
    const info = getStockInfo(symbol);
    return `${symbol} (${info.name})`;
  }).join(', ');

  let prompt = `You are a financial analyst AI specialized in stock market analysis. Analyze the following news article and provide structured insights.

**News Article:**
Title: ${article.title}
Content: ${article.content}
Source: ${article.source}
Published: ${article.published_at}
Related Stocks: ${stockInfo}

**Your Task:**
Analyze this article and provide a comprehensive assessment in the following JSON format:

{
  "event_type": "product-launch | acquisition | legal-issues | earnings | partnership | executive-change | market-expansion | other",
  "sentiment_score": <number between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive>,
  "confidence_score": <number between 0 and 1 indicating your confidence in this analysis>,
  "affected_stocks": [
    {
      "symbol": "STOCK_SYMBOL",
      "impact": "positive | negative | neutral",
      "recommendation": "BUY | SELL | HOLD",
      "rationale": "brief explanation why",
      "target_change": <estimated price change percentage>,
      "timeframe": "1_week | 2_weeks | 1_month"
    }
  ],
  "key_insights": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ],
  "risk_factors": [
    "risk 1",
    "risk 2"
  ],
  "historical_context": "Compare this event to similar historical events and their outcomes",
  "overall_assessment": "A 2-3 sentence summary of the trading opportunity"
}

`;

  // Add historical context if available
  if (historicalData && historicalData.length > 0) {
    prompt += `\n**Historical Reference Data:**\n`;
    historicalData.forEach(pattern => {
      prompt += `- ${pattern.stock_symbol} during ${pattern.event_type}: Average change of ${pattern.avg_price_change}% over ${pattern.timeframe} (${pattern.sample_size} samples, ${(pattern.confidence * 100).toFixed(0)}% confidence)\n`;
    });
  }

  prompt += `\n**Important Guidelines:**
1. Be conservative with recommendations - only suggest BUY/SELL if you're confident
2. Consider both the positive and negative aspects
3. Reference historical patterns when available
4. Provide specific, actionable insights
5. Acknowledge uncertainty and risks
6. Focus on fact-based analysis, not speculation

Return ONLY the JSON object, no additional text.`;

  return prompt;
};

/**
 * Parse Claude's response
 */
const parseClaudeResponse = (content) => {
  try {
    // Extract JSON from response (in case Claude adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('Failed to parse Claude response:', error);
    throw new Error('Invalid AI response format');
  }
};

/**
 * Analyze article with Claude AI
 */
export const analyzeArticle = async (articleId, article) => {
  try {
    logger.info(`🤖 Analyzing article: ${article.title.substring(0, 50)}...`);

    // Get historical patterns for related stocks
    const historicalData = [];
    for (const symbol of article.related_stocks) {
      // We'll try to match the event type based on keywords
      const eventTypes = ['product-launch', 'acquisition', 'earnings', 'partnership', 'legal-issues'];

      for (const eventType of eventTypes) {
        const pattern = await getHistoricalPattern(symbol, eventType);
        if (pattern) {
          historicalData.push(pattern);
        }
      }
    }

    // Generate prompt
    const prompt = generateAnalysisPrompt(article, article.related_stocks, historicalData);

    // Call Claude API
    const startTime = Date.now();
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Cost-effective model
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent analysis
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const duration = Date.now() - startTime;
    logger.debug(`Claude API response time: ${duration}ms`);

    // Parse response
    const analysis = parseClaudeResponse(message.content[0].text);

    // Save analysis to database
    const analysisResult = await query(`
      INSERT INTO ai_analysis (
        article_id, event_type, sentiment_score, confidence_score,
        recommendation, rationale, risk_factors, historical_context,
        key_insights, model_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      articleId,
      analysis.event_type,
      analysis.sentiment_score,
      analysis.confidence_score,
      analysis.affected_stocks[0]?.recommendation || 'HOLD',
      analysis.overall_assessment,
      JSON.stringify(analysis.risk_factors),
      analysis.historical_context,
      JSON.stringify(analysis.key_insights),
      'claude-3-5-haiku-20241022'
    ]);

    const analysisId = analysisResult.rows[0].id;

    // Save recommendations for each affected stock
    for (const stock of analysis.affected_stocks) {
      await query(`
        INSERT INTO recommendations (
          analysis_id, stock_symbol, stock_name, action, confidence,
          target_change, timeframe, reasoning, risk_level, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '7 days')
      `, [
        analysisId,
        stock.symbol,
        getStockInfo(stock.symbol)?.name,
        stock.recommendation,
        analysis.confidence_score,
        stock.target_change,
        stock.timeframe,
        stock.rationale,
        calculateRiskLevel(analysis.risk_factors)
      ]);
    }

    logger.info(`✅ Analysis completed for article ${articleId}`);

    return {
      analysisId,
      analysis,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    };

  } catch (error) {
    logger.error(`Failed to analyze article ${articleId}:`, error);
    throw error;
  }
};

/**
 * Calculate risk level based on risk factors
 */
const calculateRiskLevel = (riskFactors) => {
  if (!riskFactors || riskFactors.length === 0) return 'LOW';
  if (riskFactors.length <= 2) return 'MEDIUM';
  return 'HIGH';
};

/**
 * Bulk analyze multiple articles
 */
export const bulkAnalyzeArticles = async (articles) => {
  logger.info(`Starting bulk analysis of ${articles.length} articles...`);

  const results = {
    success: 0,
    failed: 0,
    totalTokens: 0
  };

  for (const article of articles) {
    try {
      const result = await analyzeArticle(article.id, article);
      results.success++;
      results.totalTokens += result.tokensUsed;

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error(`Bulk analysis failed for article ${article.id}:`, error.message);
      results.failed++;
    }
  }

  logger.info(`Bulk analysis complete: ${results.success} success, ${results.failed} failed, ${results.totalTokens} tokens used`);

  return results;
};

/**
 * Re-analyze article (for testing/debugging)
 */
export const reanalyzeArticle = async (articleId) => {
  try {
    // Fetch article from database
    const articleResult = await query(`
      SELECT * FROM news_articles WHERE id = $1
    `, [articleId]);

    if (articleResult.rows.length === 0) {
      throw new Error('Article not found');
    }

    const article = {
      ...articleResult.rows[0],
      related_stocks: articleResult.rows[0].related_stocks || []
    };

    return await analyzeArticle(articleId, article);
  } catch (error) {
    logger.error(`Failed to re-analyze article ${articleId}:`, error);
    throw error;
  }
};
