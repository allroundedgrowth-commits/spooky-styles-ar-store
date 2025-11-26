import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCartMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🛒 Running cart tables migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', '008_create_cart_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Cart tables created successfully!');
    
    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('carts', 'cart_items')
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:', result.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runCartMigration()
  .then(() => {
    console.log('🎃 Cart migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run cart migration:', error);
    process.exit(1);
  });
