import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up database...\n');
    
    // Run all migrations in order
    const migrations = [
      '001_create_users_table.sql',
      '002_create_products_table.sql',
      '003_create_product_colors_table.sql',
      '004_create_orders_table.sql',
      '005_create_order_items_table.sql',
      '006_create_costume_inspirations_tables.sql',
      '007_create_analytics_tables.sql',
      '008_create_cart_tables.sql',
      '009_add_guest_fields_to_orders.sql',
      '010_update_products_for_2d_ar.sql',
    ];
    
    for (const migration of migrations) {
      console.log(`Running ${migration}...`);
      const migrationPath = path.join(__dirname, 'migrations', migration);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await client.query(sql);
      console.log(`✅ ${migration} completed`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
