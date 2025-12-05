/**
 * Test script to diagnose admin product save/update/delete issues
 */

const API_URL = 'http://localhost:3000/api';

// Test credentials - update these with your admin credentials
const ADMIN_EMAIL = 'admin@spookystyles.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;
let csrfToken = null;
let testProductId = null;

async function login() {
  console.log('\n🔐 Step 1: Logging in as admin...');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Login failed:', data);
      return false;
    }

    authToken = data.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    console.log('   User:', data.data.user.email);
    console.log('   Is Admin:', data.data.user.is_admin);
    
    // Fetch CSRF token
    console.log('\n🔑 Fetching CSRF token...');
    const csrfResponse = await fetch(`${API_URL}/auth/csrf-token`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const csrfData = await csrfResponse.json();
    if (csrfResponse.ok && csrfData.csrfToken) {
      csrfToken = csrfData.csrfToken;
      console.log('✅ CSRF token obtained');
      console.log('   CSRF Token:', csrfToken.substring(0, 20) + '...');
    } else {
      console.error('❌ Failed to get CSRF token:', csrfData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testCreateProduct() {
  console.log('\n📦 Step 2: Testing product creation...');
  
  const productData = {
    name: 'Test Product ' + Date.now(),
    description: 'This is a test product for debugging',
    price: 29.99,
    promotional_price: 24.99,
    category: 'Wigs',
    theme: 'witch',
    thumbnail_url: 'https://via.placeholder.com/400',
    image_url: 'https://via.placeholder.com/800',
    ar_image_url: 'https://via.placeholder.com/1200',
    stock_quantity: 10,
    is_accessory: false,
  };

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Product creation failed');
      return false;
    }

    testProductId = data.data.id;
    console.log('✅ Product created successfully');
    console.log('   Product ID:', testProductId);
    console.log('   Product Name:', data.data.name);
    
    return true;
  } catch (error) {
    console.error('❌ Product creation error:', error.message);
    return false;
  }
}

async function testUpdateProduct() {
  console.log('\n✏️  Step 3: Testing product update...');
  
  if (!testProductId) {
    console.error('❌ No test product ID available');
    return false;
  }

  const updateData = {
    name: 'Updated Test Product ' + Date.now(),
    price: 34.99,
    promotional_price: 29.99,
    stock_quantity: 15,
  };

  try {
    const response = await fetch(`${API_URL}/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Product update failed');
      return false;
    }

    console.log('✅ Product updated successfully');
    console.log('   Updated Name:', data.data.name);
    console.log('   Updated Price:', data.data.price);
    
    return true;
  } catch (error) {
    console.error('❌ Product update error:', error.message);
    return false;
  }
}

async function testDeleteProduct() {
  console.log('\n🗑️  Step 4: Testing product deletion...');
  
  if (!testProductId) {
    console.error('❌ No test product ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Product deletion failed');
      return false;
    }

    console.log('✅ Product deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Product deletion error:', error.message);
    return false;
  }
}

async function verifyDeletion() {
  console.log('\n🔍 Step 5: Verifying product was deleted...');
  
  if (!testProductId) {
    console.error('❌ No test product ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/products/${testProductId}`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    
    if (response.status === 404) {
      console.log('✅ Product successfully deleted (404 as expected)');
      return true;
    } else {
      console.error('❌ Product still exists!');
      console.log('Response data:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Admin Product Operations Test Suite');
  console.log('='.repeat(60));
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test suite aborted: Login failed');
    return;
  }

  const createSuccess = await testCreateProduct();
  if (!createSuccess) {
    console.log('\n⚠️  Skipping remaining tests due to creation failure');
    return;
  }

  const updateSuccess = await testUpdateProduct();
  if (!updateSuccess) {
    console.log('\n⚠️  Update failed, but continuing with deletion test');
  }

  const deleteSuccess = await testDeleteProduct();
  if (!deleteSuccess) {
    console.log('\n⚠️  Deletion failed');
  }

  await verifyDeletion();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Suite Complete');
  console.log('\nSummary:');
  console.log('  Login:', loginSuccess ? '✅' : '❌');
  console.log('  Create:', createSuccess ? '✅' : '❌');
  console.log('  Update:', updateSuccess ? '✅' : '❌');
  console.log('  Delete:', deleteSuccess ? '✅' : '❌');
}

// Run the tests
runTests().catch(console.error);
