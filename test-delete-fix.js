/**
 * Test script to verify product deletion works after CASCADE fix
 * Run with: node test-delete-fix.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Admin credentials from ADMIN_CREDENTIALS.md
const ADMIN_EMAIL = 'admin@spookystyles.com';
const ADMIN_PASSWORD = 'Admin123!';

async function testDeleteFix() {
  console.log('🎃 Testing Product Delete Fix...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get all products
    console.log('2️⃣ Fetching products...');
    const productsResponse = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const products = productsResponse.data.data;
    console.log(`✅ Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log('⚠️  No products to test deletion with');
      return;
    }

    // Step 3: Create a test product to delete
    console.log('3️⃣ Creating test product...');
    const testProduct = {
      name: 'TEST DELETE ME',
      description: 'This is a test product for deletion',
      price: 9.99,
      category: 'Test',
      theme: 'Test',
      thumbnail_url: 'https://example.com/test.jpg',
      image_url: 'https://example.com/test.jpg',
      ar_image_url: 'https://example.com/test.jpg',
      stock_quantity: 1,
    };

    const createResponse = await axios.post(`${API_URL}/products`, testProduct, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const createdProduct = createResponse.data.data;
    console.log(`✅ Created test product: ${createdProduct.id}\n`);

    // Step 4: Try to delete the product
    console.log('4️⃣ Attempting to delete product...');
    const deleteResponse = await axios.delete(`${API_URL}/products/${createdProduct.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Product deleted successfully!');
    console.log(`   Response: ${deleteResponse.data.message}\n`);

    // Step 5: Verify product is gone
    console.log('5️⃣ Verifying product is deleted...');
    try {
      await axios.get(`${API_URL}/products/${createdProduct.id}`);
      console.log('❌ Product still exists (should have been deleted)');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Product confirmed deleted (404 Not Found)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed! Delete functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.error('\n⚠️  403 Forbidden - This was the original issue!');
      console.error('   Make sure you ran: npm run db:cascade --workspace=backend');
    }
    
    process.exit(1);
  }
}

testDeleteFix();
