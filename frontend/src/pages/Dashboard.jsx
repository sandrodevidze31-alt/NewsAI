import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI, newsAPI } from '../services/api';
import { TrendingUp, TrendingDown, AlertCircle, Newspaper } from 'lucide-react';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [newsStats, setNewsStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryRes, topRecsRes, statsRes] = await Promise.all([
        recommendationsAPI.getSummary(),
        recommendationsAPI.getTop(10),
        newsAPI.getStats(),
      ]);

      setSummary(summaryRes.data.data);
      setTopRecommendations(topRecsRes.data.data);
      setNewsStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
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

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Newspaper className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold">{newsStats?.total_articles || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Buy Signals</p>
              <p className="text-2xl font-bold">
                {summary?.by_action?.find(a => a.action === 'BUY')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sell Signals</p>
              <p className="text-2xl font-bold">
                {summary?.by_action?.find(a => a.action === 'SELL')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Last 24 Hours</p>
              <p className="text-2xl font-bold">{newsStats?.last_24_hours || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Recommendations (High Confidence)
          </h2>
        </div>
        <div className="p-6">
          {topRecommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations yet</p>
              <p className="text-sm mt-2">News aggregation will run automatically at 9 AM and 6 PM</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/stock/${rec.stock_symbol}`}
                          className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                        >
                          {rec.stock_symbol}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getActionColor(rec.action)}`}>
                          {getActionIcon(rec.action)}
                          {rec.action}
                        </span>
                        <span className="text-sm text-gray-600">
                          Confidence: {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rec.stock_name}</p>
                      <p className="text-sm text-gray-700 mt-2">{rec.reasoning}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Target: {rec.target_change > 0 ? '+' : ''}{rec.target_change}%</span>
                        <span>Timeframe: {rec.timeframe?.replace('_', ' ')}</span>
                        <span>Risk: {rec.risk_level}</span>
                      </div>
                      {rec.article_title && (
                        <p className="text-xs text-gray-500 mt-2">
                          Based on: {rec.article_title.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Stocks */}
      {summary?.top_stocks && summary.top_stocks.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Most Active Stocks
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {summary.top_stocks.slice(0, 10).map((stock) => (
                <Link
                  key={stock.stock_symbol}
                  to={`/stock/${stock.stock_symbol}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
                >
                  <p className="font-semibold text-primary-600">{stock.stock_symbol}</p>
                  <p className="text-xs text-gray-500 mt-1">{stock.stock_name}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    {stock.recommendation_count} signals
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
