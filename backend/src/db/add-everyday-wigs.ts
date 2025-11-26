import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addEverydayWigs() {
  const client = await pool.connect();
  
  try {
    console.log('🎨 Adding everyday/normal occasion wigs to database...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-everyday-wigs.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    // Get summary
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_wigs,
        COUNT(CASE WHEN theme = 'professional' THEN 1 END) as professional,
        COUNT(CASE WHEN theme = 'casual' THEN 1 END) as casual,
        COUNT(CASE WHEN theme = 'fashion' THEN 1 END) as fashion,
        COUNT(CASE WHEN theme = 'natural' THEN 1 END) as natural,
        COUNT(CASE WHEN theme = 'formal' THEN 1 END) as formal
      FROM products 
      WHERE category = 'Wigs'
    `);
    
    const stats = result.rows[0];
    
    console.log('✅ Everyday wigs added successfully!\n');
    console.log('📊 Database Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Wigs:        ${stats.total_wigs}`);
    console.log(`Professional:      ${stats.professional}`);
    console.log(`Casual:            ${stats.casual}`);
    console.log(`Fashion/Trendy:    ${stats.fashion}`);
    console.log(`Natural/Realistic: ${stats.natural}`);
    console.log(`Formal/Special:    ${stats.formal}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 You now have a complete wig collection for all occasions!');
    console.log('🌐 Visit http://localhost:3001/products to see all wigs\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding everyday wigs:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addEverydayWigs()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
