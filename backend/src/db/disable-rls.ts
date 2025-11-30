import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function disableRLS() {
  try {
    console.log('🎃 Disabling Row Level Security for local PostgreSQL...');

    const migrationPath = path.join(__dirname, 'migrations', '015_disable_rls_for_local.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ RLS disabled successfully!');
    console.log('   Your local PostgreSQL database now uses application-level security only');
    console.log('   Product deletion should work normally now');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to disable RLS:', error);
    process.exit(1);
  }
}

disableRLS();
