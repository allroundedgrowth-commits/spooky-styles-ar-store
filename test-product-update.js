const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testProductUpdate() {
  try {
    console.log('🧪 Testing Product Update...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@spookywigs.com',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Get all products
    console.log('2️⃣ Fetching products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.data;
    
    if (products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Found product: ${testProduct.name} (ID: ${testProduct.id})\n`);

    // Step 3: Try to update the product
    console.log('3️⃣ Attempting to update product...');
    const updateData = {
      name: testProduct.name + ' (Updated)',
      description: 'Updated description - ' + new Date().toISOString(),
      price: testProduct.price,
      stock_quantity: testProduct.stock_quantity + 1
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await axios.put(
      `${API_URL}/products/${testProduct.id}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Product updated successfully!');
    console.log('Updated product:', JSON.stringify(updateResponse.data.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProductUpdate();
