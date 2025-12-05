import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine if we need SSL (for cloud databases)
const needsSSL = process.env.DATABASE_URL?.includes('sslmode=require') ||
                 process.env.NODE_ENV === 'production';

console.log('🔐 Database SSL configuration:', { needsSSL, hasUrl: !!process.env.DATABASE_URL });

// Use DATABASE_URL if available, otherwise use individual environment variables
const config = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: needsSSL ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'spooky_styles_db',
      user: process.env.DB_USER || 'spooky_user',
      password: process.env.DB_PASSWORD || 'spooky_pass',
      ssl: needsSSL ? { rejectUnauthorized: false } : false
    };

export const pool = new Pool({
  ...config,
  max: 5, // Small pool for free tier
  min: 1, // Keep at least 1 connection
  idleTimeoutMillis: 60000, // 60 seconds
  connectionTimeoutMillis: 30000, // 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
