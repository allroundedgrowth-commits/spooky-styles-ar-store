/**
 * Manual RLS Policies Test Script
 * Tests Row Level Security policies for Supabase
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function runTests() {
  console.log('\n🧪 Starting RLS Policies Tests...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZXF2d29pdXlreGZ4eGdkdXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNzI5NzksImV4cCI6MjA1Mzc0ODk3OX0.Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8Zt8';
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  // Admin client with service role (bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  
  let user1Id: string | undefined;
  let user2Id: string | undefined;
  let adminId: string | undefined;
  let testOrderId: string | undefined;
  let testProductId: string | undefined;
  
  try {
    // Create test users
    console.log('📝 Setting up test data...\n');
    
    const { data: user1, error: user1Error } = await adminClient.auth.admin.createUser({
      email: `test-user-1-${Date.now()}@example.com`,
      password: 'testpass123',
      email_confirm: true
    });
    
    if (user1Error) throw user1Error;
    user1Id = user1.user.id;
    console.log(`Created user1: ${user1Id}`);
    
    const { data: user2, error: user2Error } = await adminClient.auth.admin.createUser({
      email: `test-user-2-${Date.now()}@example.com`,
      password: 'testpass123',
      email_confirm: true
    });
    
    if (user2Error) throw user2Error;
    user2Id = user2.user.id;
    console.log(`Created user2: ${user2Id}`);
    
    const { data: admin, error: adminError } = await adminClient.auth.admin.createUser({
      email: `test-admin-${Date.now()}@example.com`,
      password: 'testpass123',
      email_confirm: true
    });
    
    if (adminError) throw adminError;
    adminId = admin.user.id;
    console.log(`Created admin: ${adminId}`);
    
    // Set admin flag
    await adminClient
      .from('users')
      .update({ is_admin: true })
      .eq('id', adminId);
    
    // Create test product
    const { data: product, error: productError } = await adminClient
      .from('products')
      .insert({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock_quantity: 10,
        category: 'test'
      })
      .select()
      .single();
    
    if (productError) throw productError;
    testProductId = product.id;
    console.log(`Created test product: ${testProductId}`);
    
    // Create test order for user1
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        user_id: user1Id,
        total_amount: 99.99,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    testOrderId = order.id;
    console.log(`Created test order: ${testOrderId}\n`);
    
    // Sign in users to get JWT tokens
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const { data: user1Session } = await anonClient.auth.signInWithPassword({
      email: user1.user.email!,
      password: 'testpass123'
    });
    
    const { data: user2Session } = await anonClient.auth.signInWithPassword({
      email: user2.user.email!,
      password: 'testpass123'
    });
    
    const { data: adminSession } = await anonClient.auth.signInWithPassword({
      email: admin.user.email!,
      password: 'testpass123'
    });
    
    // Create authenticated clients
    const user1Client = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${user1Session?.session?.access_token}`
        }
      }
    });
    
    const user2Client = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${user2Session?.session?.access_token}`
        }
      }
    });
    
    const adminAuthClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${adminSession?.session?.access_token}`
        }
      }
    });
    
    console.log('🧪 Running RLS Policy Tests...\n');
    
    // Test 1: Users can view their own user record
    try {
      const { data, error } = await user1Client
        .from('users')
        .select('*')
        .eq('id', user1Id)
        .single();
      
      logTest(
        'Test 1.2.1: Users can view their own user record',
        !error && data?.id === user1Id
      );
    } catch (error: any) {
      logTest('Test 1.2.1: Users can view their own user record', false, error.message);
    }
    
    // Test 2: Users cannot view other users' records
    try {
      const { data } = await user1Client
        .from('users')
        .select('*')
        .eq('id', user2Id)
        .single();
      
      logTest(
        'Test 1.2.2: Users cannot view other users records',
        data === null
      );
    } catch (error: any) {
      logTest('Test 1.2.2: Users cannot view other users records', false, error.message);
    }
    
    // Test 3: Users can view their own orders
    try {
      const { data, error } = await user1Client
        .from('orders')
        .select('*')
        .eq('id', testOrderId)
        .single();
      
      logTest(
        'Test 1.3.1: Users can view their own orders',
        !error && data?.id === testOrderId
      );
    } catch (error: any) {
      logTest('Test 1.3.1: Users can view their own orders', false, error.message);
    }
    
    // Test 4: Users cannot view other users' orders
    try {
      const { data } = await user2Client
        .from('orders')
        .select('*')
        .eq('id', testOrderId)
        .single();
      
      logTest(
        'Test 1.3.2: Users cannot view other users orders',
        data === null
      );
    } catch (error: any) {
      logTest('Test 1.3.2: Users cannot view other users orders', false, error.message);
    }
    
    // Test 5: Admins can view all orders
    try {
      const { data, error } = await adminAuthClient
        .from('orders')
        .select('*')
        .eq('id', testOrderId)
        .single();
      
      logTest(
        'Test 1.4.1: Admins can view all orders',
        !error && data?.id === testOrderId
      );
    } catch (error: any) {
      logTest('Test 1.4.1: Admins can view all orders', false, error.message);
    }
    
    // Test 6: Admins can update orders
    try {
      const { data, error } = await adminAuthClient
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', testOrderId)
        .select()
        .single();
      
      logTest(
        'Test 1.4.2: Admins can update any order',
        !error && data?.status === 'processing'
      );
    } catch (error: any) {
      logTest('Test 1.4.2: Admins can update any order', false, error.message);
    }
    
    // Test 7: Public can read products
    try {
      const { data, error } = await user1Client
        .from('products')
        .select('*')
        .eq('id', testProductId)
        .single();
      
      logTest(
        'Test 1.4.3: Public read access to products',
        !error && data?.id === testProductId
      );
    } catch (error: any) {
      logTest('Test 1.4.3: Public read access to products', false, error.message);
    }
    
    // Test 8: Non-admins cannot modify products
    try {
      const { error } = await user1Client
        .from('products')
        .update({ price: 199.99 })
        .eq('id', testProductId);
      
      logTest(
        'Test 1.4.4: Non-admins cannot modify products',
        error !== null
      );
    } catch (error: any) {
      logTest('Test 1.4.4: Non-admins cannot modify products', true);
    }
    
    // Test 9: Admins can modify products
    try {
      const { data, error } = await adminAuthClient
        .from('products')
        .update({ price: 149.99 })
        .eq('id', testProductId)
        .select()
        .single();
      
      logTest(
        'Test 1.4.5: Admins can modify products',
        !error && data?.price === 149.99
      );
    } catch (error: any) {
      logTest('Test 1.4.5: Admins can modify products', false, error.message);
    }
    
    // Test 10: RLS denies access by default
    try {
      const unauthClient = createClient(supabaseUrl, anonKey);
      const { data } = await unauthClient
        .from('orders')
        .select('*')
        .eq('id', testOrderId)
        .single();
      
      logTest(
        'Test 1.5.1: RLS denies access by default',
        data === null
      );
    } catch (error: any) {
      logTest('Test 1.5.1: RLS denies access by default', false, error.message);
    }
    
  } catch (error: any) {
    console.error('\n❌ Test setup failed:', error.message);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...\n');
    
    if (testOrderId) {
      await adminClient.from('orders').delete().eq('id', testOrderId);
      console.log(`Deleted test order: ${testOrderId}`);
    }
    if (testProductId) {
      await adminClient.from('products').delete().eq('id', testProductId);
      console.log(`Deleted test product: ${testProductId}`);
    }
    if (user1Id) {
      await adminClient.auth.admin.deleteUser(user1Id);
      console.log(`Deleted user1: ${user1Id}`);
    }
    if (user2Id) {
      await adminClient.auth.admin.deleteUser(user2Id);
      console.log(`Deleted user2: ${user2Id}`);
    }
    if (adminId) {
      await adminClient.auth.admin.deleteUser(adminId);
      console.log(`Deleted admin: ${adminId}`);
    }
  }
  
  // Print summary
  console.log('\n📊 Test Summary:\n');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.error) console.log(`    ${r.error}`);
    });
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
