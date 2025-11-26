import pool from '../config/database.js';

interface PageView {
  userId?: string;
  sessionId: string;
  pagePath: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
}

interface Event {
  userId?: string;
  sessionId: string;
  eventName: string;
  eventCategory?: string;
  eventData?: Record<string, any>;
}

interface ErrorLog {
  userId?: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  requestPath?: string;
  requestMethod?: string;
  statusCode?: number;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  endpoint?: string;
  method?: string;
  metadata?: Record<string, any>;
}

interface BusinessMetric {
  metricType: string;
  metricValue: number;
  userId?: string;
  orderId?: string;
  productId?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  // Track page view
  async trackPageView(data: PageView): Promise<void> {
    try {
      const query = `
        INSERT INTO page_views (
          user_id, session_id, page_path, referrer, user_agent,
          ip_address, country, device_type, browser
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      
      await pool.query(query, [
        data.userId || null,
        data.sessionId,
        data.pagePath,
        data.referrer || null,
        data.userAgent || null,
        data.ipAddress || null,
        data.country || null,
        data.deviceType || null,
        data.browser || null,
      ]);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track custom event
  async trackEvent(data: Event): Promise<void> {
    try {
      const query = `
        INSERT INTO events (
          user_id, session_id, event_name, event_category, event_data
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      await pool.query(query, [
        data.userId || null,
        data.sessionId,
        data.eventName,
        data.eventCategory || null,
        data.eventData ? JSON.stringify(data.eventData) : null,
      ]);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Log error
  async logError(data: ErrorLog): Promise<void> {
    try {
      const query = `
        INSERT INTO error_logs (
          user_id, error_type, error_message, stack_trace,
          request_path, request_method, status_code,
          user_agent, ip_address, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      await pool.query(query, [
        data.userId || null,
        data.errorType,
        data.errorMessage,
        data.stackTrace || null,
        data.requestPath || null,
        data.requestMethod || null,
        data.statusCode || null,
        data.userAgent || null,
        data.ipAddress || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]);
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  // Track performance metric
  async trackPerformance(data: PerformanceMetric): Promise<void> {
    try {
      const query = `
        INSERT INTO performance_metrics (
          metric_name, metric_value, metric_unit, endpoint, method, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await pool.query(query, [
        data.metricName,
        data.metricValue,
        data.metricUnit || null,
        data.endpoint || null,
        data.method || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]);
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // Track business metric
  async trackBusinessMetric(data: BusinessMetric): Promise<void> {
    try {
      const query = `
        INSERT INTO business_metrics (
          metric_type, metric_value, user_id, order_id, product_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await pool.query(query, [
        data.metricType,
        data.metricValue,
        data.userId || null,
        data.orderId || null,
        data.productId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]);
    } catch (error) {
      console.error('Error tracking business metric:', error);
    }
  }

  // Get analytics dashboard data
  async getDashboardStats(days: number = 7): Promise<any> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Page views
      const pageViewsQuery = `
        SELECT COUNT(*) as total_views,
               COUNT(DISTINCT session_id) as unique_sessions,
               COUNT(DISTINCT user_id) as unique_users
        FROM page_views
        WHERE created_at >= $1
      `;
      const pageViewsResult = await pool.query(pageViewsQuery, [since]);

      // Top pages
      const topPagesQuery = `
        SELECT page_path, COUNT(*) as views
        FROM page_views
        WHERE created_at >= $1
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
      `;
      const topPagesResult = await pool.query(topPagesQuery, [since]);

      // Events
      const eventsQuery = `
        SELECT event_name, COUNT(*) as count
        FROM events
        WHERE created_at >= $1
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 10
      `;
      const eventsResult = await pool.query(eventsQuery, [since]);

      // Errors
      const errorsQuery = `
        SELECT error_type, COUNT(*) as count
        FROM error_logs
        WHERE created_at >= $1
        GROUP BY error_type
        ORDER BY count DESC
        LIMIT 10
      `;
      const errorsResult = await pool.query(errorsQuery, [since]);

      // Performance
      const performanceQuery = `
        SELECT metric_name, AVG(metric_value) as avg_value, metric_unit
        FROM performance_metrics
        WHERE created_at >= $1
        GROUP BY metric_name, metric_unit
      `;
      const performanceResult = await pool.query(performanceQuery, [since]);

      // Business metrics
      const revenueQuery = `
        SELECT SUM(metric_value) as total_revenue
        FROM business_metrics
        WHERE metric_type = 'revenue' AND created_at >= $1
      `;
      const revenueResult = await pool.query(revenueQuery, [since]);

      const conversionsQuery = `
        SELECT COUNT(*) as total_conversions
        FROM business_metrics
        WHERE metric_type = 'conversion' AND created_at >= $1
      `;
      const conversionsResult = await pool.query(conversionsQuery, [since]);

      return {
        pageViews: pageViewsResult.rows[0],
        topPages: topPagesResult.rows,
        events: eventsResult.rows,
        errors: errorsResult.rows,
        performance: performanceResult.rows,
        revenue: revenueResult.rows[0]?.total_revenue || 0,
        conversions: conversionsResult.rows[0]?.total_conversions || 0,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Get error rate
  async getErrorRate(hours: number = 24): Promise<number> {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM error_logs WHERE created_at >= $1) as errors,
          (SELECT COUNT(*) FROM page_views WHERE created_at >= $1) as requests
      `;
      
      const result = await pool.query(query, [since]);
      const { errors, requests } = result.rows[0];
      
      return requests > 0 ? (errors / requests) * 100 : 0;
    } catch (error) {
      console.error('Error calculating error rate:', error);
      return 0;
    }
  }

  // Get conversion funnel
  async getConversionFunnel(days: number = 7): Promise<any> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const query = `
        SELECT 
          (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= $1) as visitors,
          (SELECT COUNT(DISTINCT session_id) FROM events WHERE event_name = 'product_view' AND created_at >= $1) as product_views,
          (SELECT COUNT(DISTINCT session_id) FROM events WHERE event_name = 'add_to_cart' AND created_at >= $1) as add_to_cart,
          (SELECT COUNT(DISTINCT session_id) FROM events WHERE event_name = 'checkout_start' AND created_at >= $1) as checkout_start,
          (SELECT COUNT(*) FROM business_metrics WHERE metric_type = 'conversion' AND created_at >= $1) as purchases
      `;
      
      const result = await pool.query(query, [since]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
