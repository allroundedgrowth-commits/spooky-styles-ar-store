import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAddressMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running address fields migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '016_add_user_address_fields.sql'),
      'utf-8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Address fields migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runAddressMigration();
