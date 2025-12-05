import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const API_URL = 'http://localhost:3000/api';

async function testAPIDelete() {
  console.log('\n🔍 API DELETE TEST\n');
  console.log('=' .repeat(60));

  try {
    // 1. Login as admin
    console.log('\n1️⃣  Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@spookystyles.com',
      password: 'Admin123!'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Logged in as:', user.email);
    console.log('   Is Admin:', user.is_admin);
    console.log('   Token:', token.substring(0, 20) + '...');

    // 2. Get all products
    console.log('\n2️⃣  Fetching all products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.data;
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      console.log('⚠️  No products to delete!');
      return;
    }

    // Pick a product to delete
    const productToDelete = products[0];
    console.log(`\n   Selected product to delete:`);
    console.log(`   - Name: ${productToDelete.name}`);
    console.log(`   - ID: ${productToDelete.id}`);

    // 3. Test DELETE without token (should fail)
    console.log('\n3️⃣  Testing DELETE without authentication...');
    try {
      await axios.delete(`${API_URL}/products/${productToDelete.id}`);
      console.log('❌ PROBLEM: Delete succeeded without auth!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected (401 Unauthorized)');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // 4. Test DELETE with token
    console.log('\n4️⃣  Testing DELETE with admin authentication...');
    try {
      const deleteResponse = await axios.delete(
        `${API_URL}/products/${productToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ DELETE request successful!');
      console.log('   Response:', deleteResponse.data);

      // 5. Verify deletion
      console.log('\n5️⃣  Verifying deletion...');
      try {
        await axios.get(`${API_URL}/products/${productToDelete.id}`);
        console.log('❌ PROBLEM: Product still exists!');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ Product successfully deleted (404 Not Found)');
        } else {
          console.log('⚠️  Unexpected error:', error.response?.status);
        }
      }

      // 6. Check product count
      console.log('\n6️⃣  Checking final product count...');
      const finalProductsResponse = await axios.get(`${API_URL}/products`);
      console.log(`   Products remaining: ${finalProductsResponse.data.data.length}`);

    } catch (error) {
      console.log('❌ DELETE request failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data);
      console.log('   Headers sent:', error.config?.headers);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test complete\n');
}

testAPIDelete();
