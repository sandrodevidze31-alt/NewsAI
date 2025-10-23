import pool, { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

const createTables = async () => {
  try {
    logger.info('Starting database migration...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    logger.info('✅ Users table created');

    // Create news_articles table
    await query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT,
        summary TEXT,
        source VARCHAR(100),
        author VARCHAR(255),
        url TEXT UNIQUE,
        image_url TEXT,
        published_at TIMESTAMP,
        related_stocks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ News articles table created');

    // Create ai_analysis table
    await query(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
        event_type VARCHAR(100),
        sentiment_score DECIMAL(3,2),
        confidence_score DECIMAL(3,2),
        recommendation VARCHAR(20),
        rationale TEXT,
        risk_factors JSONB DEFAULT '[]'::jsonb,
        historical_context TEXT,
        key_insights JSONB DEFAULT '[]'::jsonb,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        model_version VARCHAR(50)
      )
    `);
    logger.info('✅ AI analysis table created');

    // Create recommendations table
    await query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        analysis_id UUID REFERENCES ai_analysis(id) ON DELETE CASCADE,
        stock_symbol VARCHAR(10) NOT NULL,
        stock_name VARCHAR(255),
        action VARCHAR(20) NOT NULL,
        confidence DECIMAL(3,2),
        target_change DECIMAL(5,2),
        timeframe VARCHAR(50),
        reasoning TEXT,
        supporting_factors JSONB DEFAULT '[]'::jsonb,
        risk_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    logger.info('✅ Recommendations table created');

    // Create historical_patterns table
    await query(`
      CREATE TABLE IF NOT EXISTS historical_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stock_symbol VARCHAR(10) NOT NULL,
        event_type VARCHAR(100),
        avg_price_change DECIMAL(5,2),
        median_price_change DECIMAL(5,2),
        timeframe VARCHAR(50),
        sample_size INTEGER,
        confidence DECIMAL(3,2),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_points JSONB DEFAULT '[]'::jsonb,
        UNIQUE(stock_symbol, event_type, timeframe)
      )
    `);
    logger.info('✅ Historical patterns table created');

    // Create user_watchlists table
    await query(`
      CREATE TABLE IF NOT EXISTS user_watchlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        stock_symbol VARCHAR(10) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(user_id, stock_symbol)
      )
    `);
    logger.info('✅ User watchlists table created');

    // Create api_logs table (for monitoring API usage)
    await query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service VARCHAR(50),
        endpoint TEXT,
        status_code INTEGER,
        response_time INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('✅ API logs table created');

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC)');
    await query('CREATE INDEX IF NOT EXISTS idx_news_stocks ON news_articles USING GIN(related_stocks)');
    await query('CREATE INDEX IF NOT EXISTS idx_analysis_article ON ai_analysis(article_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_recommendations_stock ON recommendations(stock_symbol)');
    await query('CREATE INDEX IF NOT EXISTS idx_recommendations_active ON recommendations(is_active, created_at DESC)');
    await query('CREATE INDEX IF NOT EXISTS idx_patterns_stock ON historical_patterns(stock_symbol)');

    logger.info('✅ Indexes created');

    logger.info('🎉 Database migration completed successfully!');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run migration
createTables();
