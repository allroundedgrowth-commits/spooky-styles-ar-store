// Diagnostic script for product deletion issue
// Run with: node diagnose-delete-issue.js

const API_URL = 'http://localhost:3000/api';

async function diagnose() {
  console.log('🔍 Diagnosing Product Delete Issue\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend connection...');
    try {
      const healthCheck = await fetch(`${API_URL}/products`);
      if (healthCheck.ok) {
        console.log('✅ Backend is running');
      } else {
        console.log(`⚠️  Backend returned status: ${healthCheck.status}`);
      }
    } catch (error) {
      console.log('❌ Backend is not running or not accessible');
      console.log('   Please start backend with: cd backend && npm run dev');
      return;
    }

    // Test 2: Login as admin
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'Admin123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      const error = await loginResponse.json();
      console.log('   Error:', error.error?.message);
      console.log('\n   Possible fixes:');
      console.log('   - Verify admin credentials in ADMIN_CREDENTIALS.md');
      console.log('   - Run: cd backend && npx tsx src/db/create-admin.ts');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Test 3: Check admin permissions
    console.log('\n3️⃣ Verifying admin permissions...');
    const meResponse = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!meResponse.ok) {
      console.log('❌ Could not verify user');
      return;
    }

    const userData = await meResponse.json();
    const user = userData.data;
    
    if (user.is_admin) {
      console.log('✅ User has admin privileges');
      console.log(`   Email: ${user.email}`);
    } else {
      console.log('❌ User is NOT an admin');
      console.log('   Fix: Run this SQL query:');
      console.log(`   UPDATE users SET is_admin = true WHERE email = '${user.email}';`);
      return;
    }

    // Test 4: Get products
    console.log('\n4️⃣ Fetching products...');
    const productsResponse = await fetch(`${API_URL}/products`);
    const productsData = await productsResponse.json();
    const products = productsData.data;
    
    if (products.length === 0) {
      console.log('⚠️  No products found to test deletion');
      return;
    }
    
    console.log(`✅ Found ${products.length} products`);

    // Test 5: Try to delete a product
    console.log('\n5️⃣ Testing product deletion...');
    const testProduct = products[products.length - 1]; // Use last product
    console.log(`   Target: ${testProduct.name} (${testProduct.id})`);

    const deleteResponse = await fetch(`${API_URL}/products/${testProduct.id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${deleteResponse.status} ${deleteResponse.statusText}`);

    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ DELETE SUCCESSFUL!');
      console.log('   Response:', result.message);
      console.log('\n🎉 Product deletion is working correctly!');
      console.log('   The issue might be in the frontend.');
      console.log('\n   Frontend checks:');
      console.log('   1. Open browser DevTools (F12)');
      console.log('   2. Check Console for errors');
      console.log('   3. Check Network tab when clicking delete');
      console.log('   4. Verify auth_token in localStorage');
    } else {
      const errorData = await deleteResponse.json();
      console.log('❌ DELETE FAILED');
      console.log('   Error:', JSON.stringify(errorData, null, 2));
      
      if (deleteResponse.status === 401) {
        console.log('\n   Issue: Unauthorized');
        console.log('   - Token might be invalid or expired');
      } else if (deleteResponse.status === 403) {
        console.log('\n   Issue: Forbidden');
        console.log('   - User might not have admin permissions');
      } else if (deleteResponse.status === 404) {
        console.log('\n   Issue: Product not found');
        console.log('   - Product might have been deleted already');
        console.log('   - Cache might be stale');
      } else if (deleteResponse.status === 500) {
        console.log('\n   Issue: Server error');
        console.log('   - Check backend console for detailed error');
        console.log('   - Might be database constraint issue');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Diagnosis complete!');

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    console.error('\nStack trace:', error.stack);
  }
}

// Run diagnosis
diagnose();
