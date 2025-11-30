#!/usr/bin/env node

/**
 * Fix Admin Login - Reset password and unlock account
 */

import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db'
});

async function fixAdminLogin() {
  console.log('🔧 Fixing admin login...\n');

  try {
    const adminEmail = 'admin@spookystyles.com';
    const adminPassword = 'admin123';

    // 1. Check current admin status
    console.log('1️⃣ Checking current admin status...');
    const currentAdmin = await pool.query(
      'SELECT email, is_admin, failed_login_attempts, account_locked_until FROM users WHERE email = $1',
      [adminEmail]
    );

    if (currentAdmin.rows.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('Current status:', currentAdmin.rows[0]);

    // 2. Generate new password hash
    console.log('\n2️⃣ Generating new password hash...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hash generated');

    // 3. Verify the hash works
    console.log('\n3️⃣ Verifying password hash...');
    const isValid = await bcrypt.compare(adminPassword, hashedPassword);
    console.log('✅ Password verification:', isValid ? 'PASS' : 'FAIL');

    // 4. Update admin user
    console.log('\n4️⃣ Updating admin user...');
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           failed_login_attempts = 0, 
           account_locked_until = NULL 
       WHERE email = $2`,
      [hashedPassword, adminEmail]
    );
    console.log('✅ Admin user updated');

    // 5. Verify update
    console.log('\n5️⃣ Verifying update...');
    const updatedAdmin = await pool.query(
      'SELECT email, is_admin, failed_login_attempts, account_locked_until FROM users WHERE email = $1',
      [adminEmail]
    );
    console.log('Updated status:', updatedAdmin.rows[0]);

    // 6. Test password comparison
    console.log('\n6️⃣ Testing password from database...');
    const dbUser = await pool.query(
      'SELECT password_hash FROM users WHERE email = $1',
      [adminEmail]
    );
    const dbPasswordValid = await bcrypt.compare(adminPassword, dbUser.rows[0].password_hash);
    console.log('✅ Database password test:', dbPasswordValid ? 'PASS' : 'FAIL');

    console.log('\n✅ Admin login fixed!\n');
    console.log('📋 Credentials:');
    console.log('   Email: admin@spookystyles.com');
    console.log('   Password: admin123');
    console.log('\n🔓 Account unlocked and ready to use!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixAdminLogin().catch(console.error);
