// Test script to check product deletion
// Run with: node test-product-delete.js

const API_URL = 'http://localhost:3000/api';

async function testProductDelete() {
  console.log('🧪 Testing Product Deletion...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'Admin123!'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${JSON.stringify(error)}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Get all products
    console.log('2️⃣ Fetching products...');
    const productsResponse = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();
    const products = productsData.data;
    console.log(`✅ Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log('⚠️  No products to delete');
      return;
    }

    // Step 3: Verify product exists by fetching it directly
    const productToDelete = products[0];
    console.log(`3️⃣ Verifying product exists:`);
    console.log(`   ID: ${productToDelete.id}`);
    console.log(`   Name: ${productToDelete.name}\n`);

    const verifyResponse = await fetch(`${API_URL}/products/${productToDelete.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!verifyResponse.ok) {
      console.log('⚠️  Product not found when fetching by ID');
      console.log('   This might be a data inconsistency issue');
      console.log('   Trying with another product...\n');
      
      // Try to find a product that exists
      let foundProduct = null;
      for (const product of products.slice(0, 5)) {
        const testResponse = await fetch(`${API_URL}/products/${product.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (testResponse.ok) {
          foundProduct = product;
          console.log(`✅ Found valid product: ${product.name} (${product.id})\n`);
          break;
        }
      }
      
      if (!foundProduct) {
        console.log('❌ Could not find any valid product to delete');
        return;
      }
      
      productToDelete.id = foundProduct.id;
      productToDelete.name = foundProduct.name;
    } else {
      console.log('✅ Product verified\n');
    }

    // Step 4: Try to delete the product
    console.log(`4️⃣ Attempting to delete product:`);
    console.log(`   ID: ${productToDelete.id}`);
    console.log(`   Name: ${productToDelete.name}\n`);

    const deleteUrl = `${API_URL}/products/${productToDelete.id}`;
    console.log(`   DELETE URL: ${deleteUrl}`);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${deleteResponse.status} ${deleteResponse.statusText}`);

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      console.log('❌ Delete failed:');
      console.log(JSON.stringify(errorData, null, 2));
      
      // Check if it's a constraint error
      if (errorData.error && errorData.error.message) {
        console.log('\n🔍 Error details:', errorData.error.message);
      }
    } else {
      const successData = await deleteResponse.json();
      console.log('✅ Product deleted successfully!');
      console.log(JSON.stringify(successData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Run the test
testProductDelete();
