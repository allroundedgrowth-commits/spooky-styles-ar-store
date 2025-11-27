import pool from '../config/database.js';

async function fixAdminPermissions() {
  console.log('🔧 Fixing admin permissions...\n');

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Update admin user to have admin privileges
    const result = await client.query(
      `UPDATE users 
       SET is_admin = true 
       WHERE email = 'admin@spookystyles.com'
       RETURNING id, email, is_admin`
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('   Run: npx tsx src/db/create-admin.ts');
    } else {
      const user = result.rows[0];
      console.log('✅ Admin permissions updated!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.is_admin}`);
      console.log(`   User ID: ${user.id}`);
      console.log('\n🎉 Done! Now logout and login again in the frontend.');
    }

    client.release();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAdminPermissions();
