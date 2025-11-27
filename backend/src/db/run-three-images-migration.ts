import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runThreeImagesMigration() {
  console.log('🖼️  Adding three thumbnail images support...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    const migrationPath = path.join(__dirname, 'migrations', '012_add_three_product_images.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    console.log('✅ Three images migration completed successfully');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('image_url', 'image_url_secondary', 'image_url_tertiary', 
                          'image_alt_text', 'image_alt_text_secondary', 'image_alt_text_tertiary')
      ORDER BY column_name;
    `);
    
    console.log('✅ Image columns status:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    client.release();
    console.log('🎉 Three thumbnail support (400x400px) is ready!');
    console.log('📝 Note: First image is mandatory, second and third are optional');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runThreeImagesMigration();
