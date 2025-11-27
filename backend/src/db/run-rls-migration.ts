import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runRLSMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔒 Running Row Level Security (RLS) migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', '013_enable_rls_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ RLS policies created successfully!');
    
    // Verify RLS is enabled on tables
    const rlsCheck = await client.query(`
      SELECT 
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'orders', 'order_items', 'cart_items', 'products')
      ORDER BY tablename
    `);
    
    console.log('\n📋 RLS Status:');
    rlsCheck.rows.forEach(row => {
      const status = row.rowsecurity ? '✅ Enabled' : '❌ Disabled';
      console.log(`  ${row.tablename}: ${status}`);
    });
    
    // Verify policies exist
    const policiesCheck = await client.query(`
      SELECT 
        tablename,
        policyname,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'orders', 'order_items', 'cart_items', 'products')
      ORDER BY tablename, policyname
    `);
    
    console.log('\n📜 Created Policies:');
    let currentTable = '';
    policiesCheck.rows.forEach(row => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename;
        console.log(`\n  ${row.tablename}:`);
      }
      console.log(`    - ${row.policyname} (${row.cmd})`);
    });
    
    // Verify indexes exist
    const indexCheck = await client.query(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname IN (
        'idx_orders_user_id',
        'idx_order_items_order_id',
        'idx_users_is_admin',
        'idx_cart_items_user_id'
      )
      ORDER BY tablename, indexname
    `);
    
    console.log('\n🔍 Performance Indexes:');
    if (indexCheck.rows.length > 0) {
      indexCheck.rows.forEach(row => {
        console.log(`  ✅ ${row.tablename}: ${row.indexname}`);
      });
    } else {
      console.log('  ⚠️  No RLS performance indexes found');
    }
    
    console.log('\n⚠️  Important Notes:');
    console.log('  - RLS policies use auth.uid() from JWT tokens');
    console.log('  - Backend must set JWT in Supabase client for RLS to work');
    console.log('  - Service role key bypasses RLS for admin operations');
    console.log('  - All tables deny access by default unless explicitly granted');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Test RLS policies with different user roles
async function testRLSPolicies() {
  console.log('\n🧪 Testing RLS Policies...');
  console.log('⚠️  Note: Full RLS testing requires Supabase client with JWT tokens');
  console.log('   This script only verifies that policies are created correctly.');
  console.log('   Integration tests should verify actual RLS enforcement.');
  
  const client = await pool.connect();
  
  try {
    // Test 1: Verify users table has RLS enabled
    const usersRLS = await client.query(`
      SELECT rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'users' AND schemaname = 'public'
    `);
    
    if (usersRLS.rows[0]?.rowsecurity) {
      console.log('  ✅ Users table has RLS enabled');
    } else {
      console.log('  ❌ Users table RLS not enabled');
    }
    
    // Test 2: Verify orders table has RLS enabled
    const ordersRLS = await client.query(`
      SELECT rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'orders' AND schemaname = 'public'
    `);
    
    if (ordersRLS.rows[0]?.rowsecurity) {
      console.log('  ✅ Orders table has RLS enabled');
    } else {
      console.log('  ❌ Orders table RLS not enabled');
    }
    
    // Test 3: Count policies per table
    const policyCount = await client.query(`
      SELECT 
        tablename,
        COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'orders', 'order_items', 'cart_items', 'products')
      GROUP BY tablename
      ORDER BY tablename
    `);
    
    console.log('\n  Policy counts per table:');
    policyCount.rows.forEach(row => {
      console.log(`    ${row.tablename}: ${row.policy_count} policies`);
    });
    
    // Test 4: Verify admin policies exist
    const adminPolicies = await client.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      AND policyname LIKE '%admin%'
      ORDER BY tablename
    `);
    
    console.log('\n  Admin policies:');
    adminPolicies.rows.forEach(row => {
      console.log(`    ✅ ${row.tablename}: ${row.policyname}`);
    });
    
    console.log('\n  ✅ RLS policy verification complete!');
    console.log('  📝 Next steps:');
    console.log('     1. Set up Supabase JWT authentication in backend');
    console.log('     2. Test with actual user tokens');
    console.log('     3. Verify users can only access their own data');
    console.log('     4. Verify admins can access all data');
    
  } catch (error) {
    console.error('  ❌ RLS testing failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runRLSMigration()
  .then(() => testRLSPolicies())
  .then(() => {
    console.log('\n🎃 RLS migration and testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run RLS migration:', error);
    process.exit(1);
  });
