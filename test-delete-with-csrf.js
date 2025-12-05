/**
 * Test deleting a specific product with proper CSRF token
 */

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@spookystyles.com';
const ADMIN_PASSWORD = 'admin123';
const PRODUCT_ID = '76cff16a-beac-416a-9993-e6aa9a7834e5';

async function testDelete() {
  console.log('🧪 Testing Product Deletion with CSRF\n');
  
  // Step 1: Login
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  
  const loginData = await loginResponse.json();
  if (!loginResponse.ok) {
    console.error('❌ Login failed:', loginData);
    return;
  }
  
  const token = loginData.data.token;
  console.log('✅ Login successful\n');
  
  // Step 2: Get CSRF token
  console.log('Step 2: Fetching CSRF token...');
  const csrfResponse = await fetch(`${API_URL}/auth/csrf-token`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  const csrfData = await csrfResponse.json();
  if (!csrfResponse.ok || !csrfData.csrfToken) {
    console.error('❌ Failed to get CSRF token:', csrfData);
    return;
  }
  
  const csrfToken = csrfData.csrfToken;
  console.log('✅ CSRF token obtained');
  console.log('   Token:', csrfToken.substring(0, 30) + '...\n');
  
  // Step 3: Check if product exists
  console.log('Step 3: Checking if product exists...');
  const checkResponse = await fetch(`${API_URL}/products/${PRODUCT_ID}`);
  
  if (checkResponse.status === 404) {
    console.log('❌ Product not found. It may have already been deleted.\n');
    
    // List available products
    console.log('Fetching available products...');
    const productsResponse = await fetch(`${API_URL}/products`);
    const productsData = await productsResponse.json();
    
    if (productsData.data && productsData.data.length > 0) {
      console.log('\nAvailable products:');
      productsData.data.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      });
      console.log(`\nTotal: ${productsData.data.length} products`);
      console.log('\nTo delete a product, update PRODUCT_ID in this script and run again.');
    }
    return;
  }
  
  const productData = await checkResponse.json();
  console.log('✅ Product found:', productData.data.name);
  console.log('   ID:', productData.data.id);
  console.log('   Category:', productData.data.category);
  console.log('   Price: $' + productData.data.price + '\n');
  
  // Step 4: Delete product
  console.log('Step 4: Deleting product...');
  const deleteResponse = await fetch(`${API_URL}/products/${PRODUCT_ID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
    },
  });
  
  console.log('Response Status:', deleteResponse.status, deleteResponse.statusText);
  
  const deleteData = await deleteResponse.json();
  console.log('Response Body:', JSON.stringify(deleteData, null, 2));
  
  if (deleteResponse.ok) {
    console.log('\n✅ Product deleted successfully!');
    
    // Verify deletion
    console.log('\nVerifying deletion...');
    const verifyResponse = await fetch(`${API_URL}/products/${PRODUCT_ID}`);
    if (verifyResponse.status === 404) {
      console.log('✅ Confirmed: Product no longer exists');
    } else {
      console.log('⚠️  Warning: Product still exists!');
    }
  } else {
    console.log('\n❌ Product deletion failed');
    console.log('Error:', deleteData.error?.message || 'Unknown error');
    
    if (deleteResponse.status === 403) {
      console.log('\n🔍 Troubleshooting 403 Forbidden:');
      console.log('  1. CSRF token might be expired (tokens last 1 hour)');
      console.log('  2. Try logging out and back in on the frontend');
      console.log('  3. Clear browser localStorage and cookies');
      console.log('  4. Check if you\'re still logged in as admin');
    }
  }
}

testDelete().catch(console.error);
