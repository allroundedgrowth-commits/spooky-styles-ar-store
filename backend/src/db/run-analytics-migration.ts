import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🎃 Running analytics migration...\n');
    
    const migrationPath = path.join(__dirname, 'migrations', '007_create_analytics_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Analytics tables created successfully!');
    console.log('   - page_views');
    console.log('   - events');
    console.log('   - error_logs');
    console.log('   - performance_metrics');
    console.log('   - business_metrics');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
