import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test user credentials (from seed data or create a test user)
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User'
};

let authToken = '';
let testInspirationId = '';

async function testInspirationAPI() {
  console.log('🎃 Testing Costume Inspiration API\n');

  try {
    // 1. Register or login to get auth token
    console.log('1️⃣  Authenticating user...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('   ✅ User registered successfully');
    } catch (error: any) {
      if (error.response?.status === 400) {
        // User already exists, try login
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        console.log('   ✅ User logged in successfully');
      } else {
        throw error;
      }
    }

    // 2. Get all inspirations
    console.log('\n2️⃣  Fetching all costume inspirations...');
    const inspirationsResponse = await axios.get(`${API_URL}/inspirations`);
    const inspirations = inspirationsResponse.data;
    console.log(`   ✅ Found ${inspirations.length} costume inspirations`);
    
    if (inspirations.length > 0) {
      testInspirationId = inspirations[0].id;
      console.log(`   📋 First inspiration: "${inspirations[0].name}"`);
      console.log(`      Description: ${inspirations[0].description}`);
    }

    // 3. Get specific inspiration with products
    console.log('\n3️⃣  Fetching inspiration details...');
    const inspirationDetailResponse = await axios.get(`${API_URL}/inspirations/${testInspirationId}`);
    const inspirationDetail = inspirationDetailResponse.data;
    console.log(`   ✅ Inspiration: "${inspirationDetail.name}"`);
    console.log(`   📦 Products included: ${inspirationDetail.products.length}`);
    
    inspirationDetail.products.forEach((product: any, index: number) => {
      console.log(`      ${index + 1}. ${product.name} - $${product.promotional_price || product.price}`);
    });

    // 4. Get products for inspiration
    console.log('\n4️⃣  Fetching inspiration products...');
    const productsResponse = await axios.get(`${API_URL}/inspirations/${testInspirationId}/products`);
    const products = productsResponse.data;
    console.log(`   ✅ Retrieved ${products.length} products`);

    // 5. Add all products to cart
    console.log('\n5️⃣  Adding all inspiration products to cart...');
    const addToCartResponse = await axios.post(
      `${API_URL}/inspirations/${testInspirationId}/add-to-cart`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    console.log(`   ✅ ${addToCartResponse.data.message}`);
    console.log(`   🛒 Products added: ${addToCartResponse.data.productsAdded}`);
    console.log(`   📊 Cart items: ${addToCartResponse.data.cart.items.length}`);

    // 6. Verify cart contents
    console.log('\n6️⃣  Verifying cart contents...');
    const cartResponse = await axios.get(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log(`   ✅ Cart has ${cartResponse.data.items.length} items`);
    
    let cartTotal = 0;
    cartResponse.data.items.forEach((item: any, index: number) => {
      const itemTotal = item.price * item.quantity;
      cartTotal += itemTotal;
      console.log(`      ${index + 1}. Product ID: ${item.productId.substring(0, 8)}... - Qty: ${item.quantity} - $${itemTotal.toFixed(2)}`);
    });
    console.log(`   💰 Cart total: $${cartTotal.toFixed(2)}`);

    // 7. Test error handling - invalid inspiration ID
    console.log('\n7️⃣  Testing error handling...');
    try {
      await axios.get(`${API_URL}/inspirations/00000000-0000-0000-0000-000000000000`);
      console.log('   ❌ Should have thrown error for invalid ID');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('   ✅ Correctly returned 404 for invalid inspiration ID');
      } else {
        console.log(`   ⚠️  Unexpected error: ${error.response?.status}`);
      }
    }

    console.log('\n✅ All costume inspiration API tests passed! 🎃\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testInspirationAPI();
