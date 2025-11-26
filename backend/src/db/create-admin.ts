import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

/**
 * Script to create an admin user for testing
 * Run with: npm run ts-node src/db/create-admin.ts
 */
async function createAdminUser() {
  try {
    console.log('🎃 Creating admin user...');

    const email = 'admin@spookystyles.com';
    const password = 'Admin123!';
    const name = 'Admin User';

    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists:', email);
      
      // Update to ensure is_admin is true
      await pool.query(
        'UPDATE users SET is_admin = true WHERE email = $1',
        [email]
      );
      console.log('✅ Updated user to admin status');
      
      await pool.end();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, is_admin) 
       VALUES ($1, $2, $3, true) 
       RETURNING id, email, name, is_admin`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', user.email);
    console.log('   Password:', password);
    console.log('   Is Admin:', user.is_admin);
    console.log('\n⚠️  Please change the password after first login!');

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdminUser();
