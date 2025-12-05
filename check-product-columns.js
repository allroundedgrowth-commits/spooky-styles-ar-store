import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Products Table Columns:\n');
    result.rows.forEach((col) => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkColumns();
