const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAddToCart() {
  console.log('🧪 Testing Add to Cart Functionality\n');

  try {
    // Step 1: Get products
    console.log('1️⃣ Fetching products...');
    const productsRes = await axios.get(`${API_URL}/products`);
    
    if (!productsRes.data.success || !productsRes.data.data.length) {
      console.error('❌ No products found');
      return;
    }

    const product = productsRes.data.data[0];
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
    console.log(`   Price: $${product.price}, Stock: ${product.stock_quantity}\n`);

    // Step 2: Try to add to cart as guest
    console.log('2️⃣ Adding product to cart (as guest)...');
    const cartItem = {
      productId: product.id,
      quantity: 1,
      customizations: {}
    };

    console.log('Request payload:', JSON.stringify(cartItem, null, 2));

    const addToCartRes = await axios.post(
      `${API_URL}/cart/items`,
      cartItem,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Successfully added to cart!');
    console.log('Response:', JSON.stringify(addToCartRes.data, null, 2));

    // Step 3: Verify cart contents
    console.log('\n3️⃣ Fetching cart to verify...');
    const cartRes = await axios.get(`${API_URL}/cart`);
    
    console.log('✅ Cart contents:');
    console.log(JSON.stringify(cartRes.data, null, 2));

    if (cartRes.data.data.items.length > 0) {
      console.log('\n✅ SUCCESS! Cart is working correctly.');
    } else {
      console.log('\n⚠️ WARNING: Cart is empty after adding item.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the backend running on', API_URL, '?');
    } else {
      console.error('Error details:', error);
    }
  }
}

testAddToCart();
