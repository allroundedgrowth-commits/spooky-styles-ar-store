import redisClient from './config/redis.js';

async function clearCache() {
  try {
    console.log('🔄 Clearing Redis cache...');
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    await redisClient.flushAll();
    console.log('✅ Redis cache cleared successfully!');
    
    await redisClient.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache();
