import axios from 'axios';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { STOCK_SYMBOLS, getStockInfo } from '../config/stocks.js';
import { analyzeArticle } from './aiAnalysis.service.js';

// News API clients
const newsApiClient = axios.create({
  baseURL: 'https://newsapi.org/v2',
  params: { apiKey: process.env.NEWSAPI_KEY }
});

const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: { token: process.env.FINNHUB_KEY }
});

const alphaVantageClient = axios.create({
  baseURL: 'https://www.alphavantage.co'
});

/**
 * Fetch news from NewsAPI.org
 */
const fetchNewsAPI = async (stocks) => {
  try {
    const query = stocks.join(' OR ');
    const response = await newsApiClient.get('/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 50,
        domains: 'reuters.com,bloomberg.com,cnbc.com,wsj.com,ft.com'
      }
    });

    return response.data.articles.map(article => ({
      title: article.title,
      content: article.description || article.content,
      source: article.source.name,
      author: article.author,
      url: article.url,
      image_url: article.urlToImage,
      published_at: new Date(article.publishedAt),
      related_stocks: extractStocksFromText(article.title + ' ' + article.description)
    }));
  } catch (error) {
    logger.error('NewsAPI fetch error:', error.message);
    return [];
  }
};

/**
 * Fetch news from Finnhub
 */
const fetchFinnhub = async (symbols) => {
  try {
    const articles = [];

    // Fetch news for high-priority stocks
    for (const symbol of symbols.slice(0, 20)) { // Limit to avoid rate limits
      try {
        const response = await finnhubClient.get('/company-news', {
          params: {
            symbol: symbol,
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        });

        const symbolArticles = response.data.slice(0, 5).map(article => ({
          title: article.headline,
          content: article.summary,
          source: article.source,
          url: article.url,
          image_url: article.image,
          published_at: new Date(article.datetime * 1000),
          related_stocks: [symbol]
        }));

        articles.push(...symbolArticles);

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        logger.warn(`Finnhub fetch failed for ${symbol}:`, err.message);
      }
    }

    return articles;
  } catch (error) {
    logger.error('Finnhub fetch error:', error.message);
    return [];
  }
};

/**
 * Fetch news from Alpha Vantage
 */
const fetchAlphaVantage = async (symbols) => {
  try {
    const articles = [];

    // Alpha Vantage has strict rate limits (25/day), so we only fetch for top 5 stocks
    for (const symbol of symbols.slice(0, 5)) {
      try {
        const response = await alphaVantageClient.get('/query', {
          params: {
            function: 'NEWS_SENTIMENT',
            tickers: symbol,
            apikey: process.env.ALPHAVANTAGE_KEY,
            limit: 10
          }
        });

        if (response.data.feed) {
          const symbolArticles = response.data.feed.map(article => ({
            title: article.title,
            content: article.summary,
            source: article.source,
            url: article.url,
            image_url: article.banner_image,
            published_at: new Date(article.time_published),
            related_stocks: article.ticker_sentiment?.map(t => t.ticker) || [symbol]
          }));

          articles.push(...symbolArticles);
        }

        // Delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds between calls
      } catch (err) {
        logger.warn(`Alpha Vantage fetch failed for ${symbol}:`, err.message);
      }
    }

    return articles;
  } catch (error) {
    logger.error('Alpha Vantage fetch error:', error.message);
    return [];
  }
};

/**
 * Extract stock symbols from text
 */
const extractStocksFromText = (text) => {
  const foundStocks = [];
  const upperText = text.toUpperCase();

  STOCK_SYMBOLS.forEach(symbol => {
    const stockInfo = getStockInfo(symbol);

    // Check if symbol or company name is mentioned
    if (upperText.includes(symbol) ||
        upperText.includes(stockInfo.name.toUpperCase())) {
      foundStocks.push(symbol);
    }
  });

  return foundStocks;
};

/**
 * Remove duplicate articles
 */
const deduplicateArticles = (articles) => {
  const seen = new Set();
  return articles.filter(article => {
    if (!article.url || seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });
};

/**
 * Save article to database
 */
const saveArticle = async (article) => {
  try {
    const result = await query(`
      INSERT INTO news_articles (
        title, content, source, author, url, image_url, published_at, related_stocks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (url) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, url
    `, [
      article.title,
      article.content,
      article.source,
      article.author,
      article.url,
      article.image_url,
      article.published_at,
      JSON.stringify(article.related_stocks)
    ]);

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to save article:', error.message);
    return null;
  }
};

/**
 * Filter high-impact news
 */
const isHighImpactNews = (article) => {
  const impactKeywords = [
    'partnership', 'acquisition', 'merger', 'deal', 'invest',
    'lawsuit', 'legal', 'fine', 'settlement',
    'earnings', 'revenue', 'profit', 'loss',
    'product launch', 'release', 'announce',
    'CEO', 'executive', 'resignation', 'appointed',
    'breakthrough', 'innovation', 'patent',
    'recall', 'investigation', 'scandal'
  ];

  const text = (article.title + ' ' + article.content).toLowerCase();
  return impactKeywords.some(keyword => text.includes(keyword));
};

/**
 * Main news aggregation function
 */
export const startNewsAggregation = async (trigger = 'manual') => {
  const startTime = Date.now();
  logger.info(`🗞️  Starting news aggregation (${trigger})...`);

  try {
    // Fetch from all sources in parallel
    const [newsApiArticles, finnhubArticles, alphaVantageArticles] = await Promise.all([
      fetchNewsAPI(STOCK_SYMBOLS),
      fetchFinnhub(STOCK_SYMBOLS),
      fetchAlphaVantage(STOCK_SYMBOLS)
    ]);

    logger.info(`Fetched: NewsAPI(${newsApiArticles.length}), Finnhub(${finnhubArticles.length}), AlphaVantage(${alphaVantageArticles.length})`);

    // Combine and deduplicate
    const allArticles = [
      ...newsApiArticles,
      ...finnhubArticles,
      ...alphaVantageArticles
    ];

    const uniqueArticles = deduplicateArticles(allArticles);
    logger.info(`Total unique articles: ${uniqueArticles.length}`);

    // Filter for high-impact news only
    const highImpactArticles = uniqueArticles.filter(isHighImpactNews);
    logger.info(`High-impact articles: ${highImpactArticles.length}`);

    // Save articles and trigger AI analysis
    let savedCount = 0;
    let analyzedCount = 0;

    for (const article of highImpactArticles) {
      const saved = await saveArticle(article);

      if (saved) {
        savedCount++;

        // Trigger AI analysis asynchronously
        analyzeArticle(saved.id, article)
          .then(() => {
            analyzedCount++;
            logger.debug(`Analyzed article: ${article.title.substring(0, 50)}...`);
          })
          .catch(err => {
            logger.error(`Failed to analyze article ${saved.id}:`, err.message);
          });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info(`✅ News aggregation completed in ${duration}s`);
    logger.info(`   Articles saved: ${savedCount}`);
    logger.info(`   Articles queued for analysis: ${savedCount}`);

    return {
      success: true,
      saved: savedCount,
      analyzed: analyzedCount,
      duration: duration
    };

  } catch (error) {
    logger.error('News aggregation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
