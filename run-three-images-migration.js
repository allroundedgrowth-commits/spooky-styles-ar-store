import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('🔄 Running three images migration...\n');
    
    const sql = fs.readFileSync('./backend/src/db/migrations/012_add_three_product_images.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name IN ('image_url_secondary', 'image_url_tertiary', 'image_alt_text', 'image_alt_text_secondary', 'image_alt_text_tertiary')
      ORDER BY column_name
    `);
    
    console.log('Added columns:');
    result.rows.forEach(row => console.log(`  ✓ ${row.column_name}`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
