import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testPassword() {
  const testEmail = 'admin@spookystyles.com';
  const testPassword = 'Admin123!';

  try {
    console.log('\n🔐 Testing Admin Password...\n');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('');

    const result = await pool.query(
      'SELECT id, email, password_hash, is_admin FROM users WHERE email = $1',
      [testEmail]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      await pool.end();
      return;
    }

    const user = result.rows[0];
    console.log('✅ User found in database');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Is Admin:', user.is_admin);
    console.log('   Password Hash:', user.password_hash.substring(0, 30) + '...');
    console.log('');

    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('\nTrying common variations...');
      
      const variations = [
        'admin123',
        'Admin123',
        'admin123!',
        'spooky123',
        'Spooky123!',
      ];
      
      for (const pwd of variations) {
        const match = await bcrypt.compare(pwd, user.password_hash);
        if (match) {
          console.log(`✅ Found matching password: "${pwd}"`);
          break;
        }
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

testPassword();
