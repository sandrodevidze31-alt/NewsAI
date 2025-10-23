import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendationsAPI, newsAPI } from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

function StockDetail() {
  const { symbol } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      const [recsRes, newsRes] = await Promise.all([
        recommendationsAPI.getByStock(symbol),
        newsAPI.getByStock(symbol, 20),
      ]);

      setRecommendations(recsRes.data.data.recommendations);
      setNews(newsRes.data.data.articles);
    } catch (error) {
      console.error('Failed to load stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading {symbol} data...</div>
      </div>
    );
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return 'text-green-700 bg-green-100';
      case 'SELL':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recommendations ({recommendations.length})
          </h2>
        </div>
        <div className="p-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recommendations available for {symbol}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${getActionColor(rec.action)}`}>
                        {rec.action === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {rec.action}
                      </span>
                      <span className="text-sm text-gray-600">
                        Confidence: {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${rec.target_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rec.target_change > 0 ? '+' : ''}{rec.target_change}%
                      </p>
                      <p className="text-xs text-gray-500">{rec.timeframe?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{rec.reasoning}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Risk: {rec.risk_level}</span>
                    <span>Event: {rec.event_type?.replace('-', ' ')}</span>
                    <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* News Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Related News ({news.length})
          </h2>
        </div>
        <div className="p-6">
          {news.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No news articles found for {symbol}
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((article) => (
                <div key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                  {article.content && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{article.content}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{article.source}</span>
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    {article.event_type && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {article.event_type.replace('-', ' ')}
                      </span>
                    )}
                    {article.sentiment_score !== null && (
                      <span className={article.sentiment_score > 0 ? 'text-green-600' : 'text-red-600'}>
                        Sentiment: {(article.sentiment_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockDetail;
