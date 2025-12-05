import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Running cart fix migration...');
    
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '015_fix_cart_unique_constraint.sql'),
      'utf-8'
    );

    await pool.query(migrationSQL);
    
    console.log('✅ Cart fix migration completed successfully');
    
    // Verify the fix
    const result = await pool.query('SELECT COUNT(*) as count FROM carts');
    console.log(`Total carts after cleanup: ${result.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
