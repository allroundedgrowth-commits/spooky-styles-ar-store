import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run2DARMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running 2D AR migration...');
    console.log('   Making model_url optional and adding ar_image_url\n');
    
    const migrationPath = path.join(__dirname, 'migrations', '010_update_products_for_2d_ar.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify changes
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name IN ('model_url', 'ar_image_url', 'thumbnail_url', 'image_url')
      ORDER BY column_name
    `);
    
    console.log('📋 Updated columns:');
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '✅ Optional' : '❌ Required';
      console.log(`   ${row.column_name}: ${row.data_type}(${row.character_maximum_length}) - ${nullable}`);
    });
    
    // Check how many products have model_url
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(model_url) as with_model,
        COUNT(ar_image_url) as with_ar_image
      FROM products
    `);
    
    console.log('\n📊 Product statistics:');
    console.log(`   Total products: ${stats.rows[0].total}`);
    console.log(`   With 3D model: ${stats.rows[0].with_model}`);
    console.log(`   With AR image: ${stats.rows[0].with_ar_image}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run2DARMigration()
  .then(() => {
    console.log('\n🎃 2D AR migration complete!');
    console.log('   Products can now use 2D images without 3D models.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run 2D AR migration:', error);
    process.exit(1);
  });
