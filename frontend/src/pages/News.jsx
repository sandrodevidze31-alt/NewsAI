import { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { ExternalLink, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ eventType: '', stock: '' });

  useEffect(() => {
    loadNews();
  }, [filter]);

  const loadNews = async () => {
    try {
      const response = await newsAPI.getAll({
        limit: 50,
        ...(filter.eventType && { eventType: filter.eventType }),
        ...(filter.stock && { stock: filter.stock }),
      });
      setArticles(response.data.data.articles);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentIcon = (score) => {
    if (!score) return null;
    return score > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">News Feed</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={filter.eventType}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Events</option>
              <option value="product-launch">Product Launch</option>
              <option value="acquisition">Acquisition</option>
              <option value="legal-issues">Legal Issues</option>
              <option value="earnings">Earnings</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              placeholder="e.g., AAPL"
              value={filter.stock}
              onChange={(e) => setFilter({ ...filter, stock: e.target.value.toUpperCase() })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No articles found</p>
            <p className="text-sm mt-2">Try changing the filters or wait for next news aggregation</p>
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>

                  {article.content && (
                    <p className="text-gray-700 mb-4 line-clamp-3">{article.content}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy HH:mm') : 'Unknown date'}
                    </div>
                    <div>Source: {article.source || 'Unknown'}</div>
                    {article.event_type && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {article.event_type.replace('-', ' ')}
                      </div>
                    )}
                  </div>

                  {article.sentiment_score !== null && article.sentiment_score !== undefined && (
                    <div className={`flex items-center gap-2 mb-3 ${getSentimentColor(article.sentiment_score)}`}>
                      {getSentimentIcon(article.sentiment_score)}
                      <span className="text-sm font-medium">
                        Sentiment: {article.sentiment_score > 0 ? 'Positive' : article.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                        ({(article.sentiment_score * 100).toFixed(0)}%)
                      </span>
                      {article.confidence_score && (
                        <span className="text-sm text-gray-600">
                          • Confidence: {(article.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  )}

                  {article.key_insights && article.key_insights.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Insights:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {article.key_insights.slice(0, 3).map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {article.related_stocks && article.related_stocks.map((stock) => (
                      <span
                        key={stock}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      >
                        {stock}
                      </span>
                    ))}
                  </div>
                </div>

                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default News;
