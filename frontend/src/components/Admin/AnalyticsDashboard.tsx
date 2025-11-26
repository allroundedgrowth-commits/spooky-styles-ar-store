import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import analyticsService from '../../services/analytics.service';

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [errorRate, setErrorRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, funnelData, errorRateData] = await Promise.all([
        analyticsService.getDashboardStats(days),
        analyticsService.getConversionFunnel(days),
        analyticsService.getErrorRate(24),
      ]);
      
      console.log('Dashboard Stats:', dashboardStats);
      console.log('Funnel Data:', funnelData);
      console.log('Error Rate:', errorRateData);
      
      setStats(dashboardStats);
      setFunnel(funnelData);
      setErrorRate(errorRateData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      alert('Failed to load analytics data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-halloween-purple text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats && !funnel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-halloween-purple hover:text-halloween-orange transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Admin Dashboard
          </Link>
          <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-halloween-orange mb-4">No Analytics Data Available</h2>
            <p className="text-halloween-gray">
              Start browsing the site to generate analytics data, or check the browser console for errors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const conversionRate = funnel?.visitors > 0 
    ? ((funnel.purchases / funnel.visitors) * 100).toFixed(2)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-halloween-purple hover:text-halloween-orange transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-halloween-orange">📊 Analytics Dashboard</h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 bg-halloween-dark border border-halloween-purple rounded-lg text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Views"
            value={stats?.pageViews?.total_views || 0}
            icon="👁️"
            color="purple"
          />
          <MetricCard
            title="Unique Visitors"
            value={stats?.pageViews?.unique_sessions || 0}
            icon="👥"
            color="orange"
          />
          <MetricCard
            title="Revenue"
            value={`$${Number(stats?.revenue || 0).toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <MetricCard
            title="Conversions"
            value={stats?.conversions || 0}
            icon="🎯"
            color="blue"
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-halloween-orange mb-4">🔄 Conversion Funnel</h2>
          <div className="space-y-4">
            <FunnelStep label="Visitors" value={funnel?.visitors || 0} percentage={100} />
            <FunnelStep 
              label="Product Views" 
              value={funnel?.product_views || 0} 
              percentage={funnel?.visitors > 0 ? (funnel.product_views / funnel.visitors) * 100 : 0}
            />
            <FunnelStep 
              label="Add to Cart" 
              value={funnel?.add_to_cart || 0} 
              percentage={funnel?.visitors > 0 ? (funnel.add_to_cart / funnel.visitors) * 100 : 0}
            />
            <FunnelStep 
              label="Checkout Started" 
              value={funnel?.checkout_start || 0} 
              percentage={funnel?.visitors > 0 ? (funnel.checkout_start / funnel.visitors) * 100 : 0}
            />
            <FunnelStep 
              label="Purchases" 
              value={funnel?.purchases || 0} 
              percentage={funnel?.visitors > 0 ? (funnel.purchases / funnel.visitors) * 100 : 0}
              isLast
            />
          </div>
          <div className="mt-6 p-4 bg-halloween-black rounded-lg">
            <p className="text-halloween-gray">
              Conversion Rate: <span className="text-halloween-orange font-bold text-xl">{conversionRate}%</span>
            </p>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-6">
            <h2 className="text-2xl font-bold text-halloween-orange mb-4">⚠️ Error Rate (24h)</h2>
            <div className="text-center">
              <div className={`text-5xl font-bold ${errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {errorRate.toFixed(2)}%
              </div>
              <p className="text-halloween-gray mt-2">
                {errorRate > 5 ? '⚠️ High error rate!' : '✅ System healthy'}
              </p>
            </div>
          </div>

          <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-6">
            <h2 className="text-2xl font-bold text-halloween-orange mb-4">⚡ Performance</h2>
            <div className="space-y-3">
              {stats?.performance && stats.performance.length > 0 ? (
                stats.performance.map((metric: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-halloween-gray">{metric.metric_name}</span>
                    <span className="text-white font-bold">
                      {Number(metric.avg_value).toFixed(2)} {metric.metric_unit}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-halloween-gray text-center">No performance data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-halloween-orange mb-4">📄 Top Pages</h2>
          <div className="space-y-2">
            {stats?.topPages && stats.topPages.length > 0 ? (
              stats.topPages.map((page: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-halloween-black rounded">
                  <span className="text-white">{page.page_path}</span>
                  <span className="text-halloween-purple font-bold">{page.views} views</span>
                </div>
              ))
            ) : (
              <p className="text-halloween-gray text-center p-4">No page data yet</p>
            )}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-halloween-dark border border-halloween-purple rounded-lg p-6">
          <h2 className="text-2xl font-bold text-halloween-orange mb-4">🎯 Top Events</h2>
          <div className="space-y-2">
            {stats?.events && stats.events.length > 0 ? (
              stats.events.map((event: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-halloween-black rounded">
                  <span className="text-white">{event.event_name}</span>
                  <span className="text-halloween-purple font-bold">{event.count} times</span>
                </div>
              ))
            ) : (
              <p className="text-halloween-gray text-center p-4">No event data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    purple: 'border-halloween-purple',
    orange: 'border-halloween-orange',
    green: 'border-green-500',
    blue: 'border-blue-500',
  };

  return (
    <div className={`bg-halloween-dark border-2 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <span className="text-halloween-gray text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
};

// Funnel Step Component
const FunnelStep: React.FC<{
  label: string;
  value: number;
  percentage: number;
  isLast?: boolean;
}> = ({ label, value, percentage, isLast }) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{label}</span>
        <span className="text-halloween-gray">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-halloween-black rounded-full h-8">
        <div
          className="bg-gradient-to-r from-halloween-purple to-halloween-orange h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && `${percentage.toFixed(0)}%`}
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center my-2">
          <div className="text-halloween-gray text-2xl">↓</div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
