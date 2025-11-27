import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runThirdImageMigration() {
  console.log('🖼️  Adding third image support...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    const migrationPath = path.join(__dirname, 'migrations', '012_add_third_product_image.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    console.log('✅ Third image migration completed successfully');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('image_url_tertiary', 'image_alt_text_tertiary')
      ORDER BY column_name;
    `);
    
    console.log('✅ New image columns added:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    client.release();
    console.log('🎉 Three thumbnail support is ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runThirdImageMigration();
