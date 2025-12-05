/**
 * Detailed test for product creation with full debugging
 */

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@spookystyles.com';
const ADMIN_PASSWORD = 'admin123';

async function testProductCreate() {
  console.log('🧪 Testing Product Creation with Full Details\n');
  
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
  const userId = loginData.data.user.id;
  console.log('✅ Login successful');
  console.log('   User ID:', userId);
  console.log('   Is Admin:', loginData.data.user.is_admin);
  console.log('   Token:', token.substring(0, 30) + '...\n');
  
  // Step 2: Try to create product
  console.log('Step 2: Creating product...');
  const productData = {
    name: 'Test Product ' + Date.now(),
    description: 'Test description',
    price: 29.99,
    category: 'Wigs',
    theme: 'witch',
    thumbnail_url: 'https://via.placeholder.com/400',
    image_url: 'https://via.placeholder.com/800',
    ar_image_url: 'https://via.placeholder.com/1200',
    stock_quantity: 10,
  };
  
  console.log('Request URL:', `${API_URL}/products`);
  console.log('Request Headers:');
  console.log('  Content-Type: application/json');
  console.log('  Authorization: Bearer ' + token.substring(0, 20) + '...');
  console.log('Request Body:', JSON.stringify(productData, null, 2));
  console.log('');
  
  const createResponse = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  
  console.log('Response Status:', createResponse.status, createResponse.statusText);
  console.log('Response Headers:');
  for (const [key, value] of createResponse.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  console.log('');
  
  const createData = await createResponse.json();
  console.log('Response Body:', JSON.stringify(createData, null, 2));
  
  if (createResponse.ok) {
    console.log('\n✅ Product created successfully!');
    console.log('Product ID:', createData.data.id);
  } else {
    console.log('\n❌ Product creation failed');
    console.log('Error:', createData.error?.message || 'Unknown error');
  }
}

testProductCreate().catch(console.error);
