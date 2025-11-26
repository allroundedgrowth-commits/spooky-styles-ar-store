import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addAccessories() {
  const client = await pool.connect();
  
  try {
    console.log('🎭 Adding accessories to database...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-accessories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    // Get summary
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_accessories,
        COUNT(CASE WHEN category = 'Accessories' THEN 1 END) as accessories,
        COUNT(CASE WHEN category = 'Hats' THEN 1 END) as hats,
        COUNT(CASE WHEN category = 'Masks' THEN 1 END) as masks
      FROM products 
      WHERE is_accessory = true
    `);
    
    const stats = result.rows[0];
    
    console.log('✅ Accessories added successfully!\n');
    console.log('📊 Accessory Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Accessories: ${stats.total_accessories}`);
    console.log(`  - Accessories:   ${stats.accessories}`);
    console.log(`  - Hats:          ${stats.hats}`);
    console.log(`  - Masks:         ${stats.masks}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎨 Accessory Categories:');
    console.log('  • Glasses & Sunglasses (5)');
    console.log('  • Earrings (5)');
    console.log('  • Headbands & Hair Accessories (5)');
    console.log('  • Hats (5)');
    console.log('  • Necklaces & Jewelry (4)');
    console.log('  • Halloween Accessories (6)');
    console.log('  • Scarves & Bandanas (3)\n');
    
    console.log('🎉 All accessories are AR-compatible!');
    console.log('🌐 Visit http://localhost:3001/products?is_accessory=true to see them\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding accessories:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addAccessories()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
