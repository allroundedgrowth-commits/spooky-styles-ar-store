#!/usr/bin/env node

/**
 * Complete Fix Script for Spooky Wigs Store
 * Fixes login and products display issues
 */

import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db'
});

async function fixEverything() {
  console.log('🔧 Starting comprehensive fix...\n');

  try {
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', dbTest.rows[0].now);

    // 2. Check products
    console.log('\n2️⃣ Checking products...');
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`✅ Found ${productsResult.rows[0].count} products`);

    // 3. Fix admin user password
    console.log('\n3️⃣ Resetting admin password...');
    const adminEmail = 'admin@spookystyles.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, is_admin',
      [hashedPassword, adminEmail]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Admin password reset successfully');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
    } else {
      console.log('⚠️  Admin user not found, creating...');
      
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, is_admin)
         VALUES ($1, $2, $3, $4)`,
        [adminEmail, hashedPassword, 'Admin User', true]
      );
      console.log('✅ Admin user created');
    }

    // 4. Check test user
    console.log('\n4️⃣ Checking test user...');
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const testHashedPassword = await bcrypt.hash(testPassword, 10);

    const testUserResult = await pool.query(
      'SELECT email FROM users WHERE email = $1',
      [testEmail]
    );

    if (testUserResult.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, is_admin)
         VALUES ($1, $2, $3, $4)`,
        [testEmail, testHashedPassword, 'Test User', false]
      );
      console.log('✅ Test user created');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
    } else {
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [testHashedPassword, testEmail]
      );
      console.log('✅ Test user password reset');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
    }

    // 5. Verify users
    console.log('\n5️⃣ Verifying all users...');
    const usersResult = await pool.query(
      'SELECT email, is_admin, created_at FROM users ORDER BY is_admin DESC'
    );
    console.log('✅ Users in database:');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.email} ${user.is_admin ? '(ADMIN)' : '(USER)'}`);
    });

    console.log('\n✅ All fixes completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Database: Connected');
    console.log(`   - Products: ${productsResult.rows[0].count} available`);
    console.log('   - Admin login: admin@spookystyles.com / admin123');
    console.log('   - Test login: test@example.com / password123');
    console.log('\n🚀 You can now:');
    console.log('   1. Open http://localhost:5173');
    console.log('   2. View products at http://localhost:5173/products');
    console.log('   3. Login with admin credentials');
    console.log('   4. Access admin dashboard at http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixEverything().catch(console.error);
