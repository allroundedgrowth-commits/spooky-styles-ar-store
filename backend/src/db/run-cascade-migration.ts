import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCascadeMigration() {
  try {
    console.log('🎃 Running CASCADE delete migration...');

    const migrationPath = path.join(__dirname, 'migrations', '014_add_cascade_deletes.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ CASCADE delete migration completed successfully!');
    console.log('   Products can now be deleted without foreign key constraint errors');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runCascadeMigration();
