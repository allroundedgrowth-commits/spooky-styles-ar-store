import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  try {
    const result = await pool.query(
      'SELECT id, email, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    console.log('\n👥 All Users in Database:\n');
    if (result.rows.length === 0) {
      console.log('❌ NO USERS FOUND!');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Admin: ${user.is_admin ? '✅ YES' : '❌ NO'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkUsers();
