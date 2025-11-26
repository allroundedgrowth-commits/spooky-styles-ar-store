import { apiClient } from './api';

class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Track page view
  async trackPageView(pagePath: string, referrer?: string): Promise<void> {
    try {
      await apiClient.post('/analytics/pageview', {
        sessionId: this.sessionId,
        pagePath,
        referrer: referrer || document.referrer,
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // Track custom event
  async trackEvent(
    eventName: string,
    eventCategory?: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      await apiClient.post('/analytics/event', {
        sessionId: this.sessionId,
        eventName,
        eventCategory,
        eventData,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Convenience methods for common events
  async trackProductView(productId: string, productName: string): Promise<void> {
    return this.trackEvent('product_view', 'ecommerce', {
      productId,
      productName,
    });
  }

  async trackAddToCart(productId: string, productName: string, price: number): Promise<void> {
    return this.trackEvent('add_to_cart', 'ecommerce', {
      productId,
      productName,
      price,
    });
  }

  async trackCheckoutStart(cartTotal: number, itemCount: number): Promise<void> {
    return this.trackEvent('checkout_start', 'ecommerce', {
      cartTotal,
      itemCount,
    });
  }

  async trackPurchase(orderId: string, total: number, itemCount: number): Promise<void> {
    return this.trackEvent('purchase', 'ecommerce', {
      orderId,
      total,
      itemCount,
    });
  }

  async trackARSession(action: 'start' | 'end', duration?: number): Promise<void> {
    return this.trackEvent(`ar_session_${action}`, 'ar', {
      duration,
    });
  }

  async trackSearch(query: string, resultsCount: number): Promise<void> {
    return this.trackEvent('search', 'engagement', {
      query,
      resultsCount,
    });
  }

  async trackShare(platform: string, productId?: string): Promise<void> {
    return this.trackEvent('share', 'social', {
      platform,
      productId,
    });
  }

  // Admin: Get dashboard stats
  async getDashboardStats(days: number = 7): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/dashboard?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  // Admin: Get error rate
  async getErrorRate(hours: number = 24): Promise<number> {
    try {
      const response = await apiClient.get(`/analytics/error-rate?hours=${hours}`);
      return response.data.data.errorRate;
    } catch (error) {
      console.error('Failed to get error rate:', error);
      throw error;
    }
  }

  // Admin: Get conversion funnel
  async getConversionFunnel(days: number = 7): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/funnel?days=${days}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get conversion funnel:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
