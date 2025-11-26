import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runGuestCheckoutMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running guest checkout migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '009_add_guest_fields_to_orders.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Guest checkout migration completed successfully!');
    
    // Verify the changes
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('guest_email', 'guest_name', 'guest_address')
      ORDER BY column_name;
    `);
    
    console.log('\nNew columns added to orders table:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runGuestCheckoutMigration();
