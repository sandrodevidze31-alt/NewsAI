import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI } from '../services/api';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', minConfidence: 0.5 });

  useEffect(() => {
    loadRecommendations();
  }, [filter]);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getAll({
        limit: 100,
        ...(filter.action && { action: filter.action }),
        minConfidence: filter.minConfidence,
      });
      setRecommendations(response.data.data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-5 h-5" />;
      case 'SELL':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stock Recommendations</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Actions</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="HOLD">Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Confidence: {(filter.minConfidence * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={filter.minConfidence}
              onChange={(e) => setFilter({ ...filter, minConfidence: parseFloat(e.target.value) })}
              className="block w-full"
            />
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No recommendations found</p>
            <p className="text-sm mt-2">Try adjusting the filters or wait for next news aggregation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-l-primary-500"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/stock/${rec.stock_symbol}`}
                        className="text-2xl font-bold text-primary-600 hover:text-primary-700"
                      >
                        {rec.stock_symbol}
                      </Link>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold ${getActionColor(rec.action)}`}>
                        {getActionIcon(rec.action)}
                        {rec.action}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {(rec.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{rec.stock_name}</p>
                    <p className="text-gray-800">{rec.reasoning}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Target Change</p>
                      <p className={`text-lg font-semibold ${rec.target_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rec.target_change > 0 ? '+' : ''}{rec.target_change}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Timeframe</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {rec.timeframe?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Risk Level</p>
                      <p className={`text-lg font-semibold ${getRiskColor(rec.risk_level)}`}>
                        {rec.risk_level || 'MEDIUM'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Event Type</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {rec.event_type?.replace('-', ' ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {rec.key_insights && rec.key_insights.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">Key Insights</p>
                      <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                        {rec.key_insights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.article_title && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 uppercase mb-1">Based on Article</p>
                      <p className="text-sm text-gray-700">{rec.article_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {rec.article_date && new Date(rec.article_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
