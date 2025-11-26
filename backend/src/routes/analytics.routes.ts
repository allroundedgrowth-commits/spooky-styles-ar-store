import express from 'express';
import analyticsService from '../services/analytics.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Track page view (public)
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, pagePath, referrer } = req.body;
    const userId = (req as any).user?.userId;
    
    await analyticsService.trackPageView({
      userId,
      sessionId,
      pagePath,
      referrer,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      deviceType: getDeviceType(req.get('user-agent') || ''),
      browser: getBrowser(req.get('user-agent') || ''),
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Track event (public)
router.post('/event', async (req, res) => {
  try {
    const { sessionId, eventName, eventCategory, eventData } = req.body;
    const userId = (req as any).user?.userId;
    
    await analyticsService.trackEvent({
      userId,
      sessionId,
      eventName,
      eventCategory,
      eventData,
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await analyticsService.getDashboardStats(days);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get error rate (admin only)
router.get('/error-rate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const errorRate = await analyticsService.getErrorRate(hours);
    
    res.json({
      success: true,
      data: { errorRate },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversion funnel (admin only)
router.get('/funnel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const funnel = await analyticsService.getConversionFunnel(days);
    
    res.json({
      success: true,
      data: funnel,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'Other';
}

export default router;
