import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis.js';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
  varyBy?: string[]; // Request properties to vary cache by (e.g., ['userId', 'query'])
}

/**
 * Middleware to cache API responses in Redis
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 3600, // Default 1 hour
    keyPrefix = 'api',
    varyBy = [],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if Redis is not connected
    if (!redisClient.isOpen) {
      return next();
    }

    try {
      // Build cache key
      const keyParts = [keyPrefix, req.path];

      // Add vary-by parameters
      varyBy.forEach((param) => {
        if (param === 'userId' && (req as any).user?.id) {
          keyParts.push(`user:${(req as any).user.id}`);
        } else if (param === 'query') {
          keyParts.push(JSON.stringify(req.query));
        } else if (param === 'params') {
          keyParts.push(JSON.stringify(req.params));
        }
      });

      const cacheKey = keyParts.join(':');

      // Check cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache miss: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        redisClient
          .setEx(cacheKey, ttl, JSON.stringify(data))
          .then(() => {
            console.log(`💾 Cached response: ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch((error) => {
            console.error('❌ Error caching response:', error);
          });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache entries matching: ${pattern}`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error invalidating cache:', error);
    return 0;
  }
};

/**
 * Invalidate cache for specific resource
 */
export const invalidateResourceCache = async (resource: string, id?: string): Promise<void> => {
  const patterns = [
    `api:/${resource}*`,
    `api:/api/${resource}*`,
  ];

  if (id) {
    patterns.push(`api:/${resource}/${id}*`);
    patterns.push(`api:/api/${resource}/${id}*`);
  }

  for (const pattern of patterns) {
    await invalidateCache(pattern);
  }
};

/**
 * Clear all API cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await invalidateCache('api:*');
    console.log('🗑️ Cleared all API cache');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

export default cacheMiddleware;
