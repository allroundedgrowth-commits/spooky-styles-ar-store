import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false, // Don't retry if Redis is down
  },
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error', err);
  console.log('⚠️  Continuing without Redis - caching disabled');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis enabled - caching active');
  } catch (error) {
    console.error('⚠️  Failed to connect to Redis - continuing without caching');
  }
};

export default redisClient;
