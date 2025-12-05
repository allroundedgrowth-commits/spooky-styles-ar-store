// Test cart functionality with real product
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCart() {
  try {
    // First, get available products
    console.log('1. Fetching products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.data;
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      return;
    }

    const testProduct = products[0];
    console.log(`✓ Found ${products.length} products`);
    console.log(`Using product: ${testProduct.name} (ID: ${testProduct.id})`);
    console.log('');

    // Get current cart
    console.log('2. Getting current cart...');
    const cartResponse = await axios.get(`${API_URL}/cart`);
    console.log('✓ Current cart:', JSON.stringify(cartResponse.data.data, null, 2));
    console.log('');

    // Add item to cart
    console.log('3. Adding product to cart (quantity: 1)...');
    const addResponse1 = await axios.post(`${API_URL}/cart/items`, {
      productId: testProduct.id,
      quantity: 1,
      customizations: {}
    });
    console.log('✓ Added to cart');
    console.log('Cart after first add:', JSON.stringify(addResponse1.data.data.items, null, 2));
    console.log('');

    // Add same item again
    console.log('4. Adding same product again (quantity: 1)...');
    const addResponse2 = await axios.post(`${API_URL}/cart/items`, {
      productId: testProduct.id,
      quantity: 1,
      customizations: {}
    });
    console.log('✓ Added to cart again');
    console.log('Cart after second add:', JSON.stringify(addResponse2.data.data.items, null, 2));
    console.log('');

    // Check final state
    const finalCart = await axios.get(`${API_URL}/cart`);
    const cartItems = finalCart.data.data.items;
    
    console.log('5. Final cart state:');
    console.log(`Total unique items: ${cartItems.length}`);
    
    if (cartItems.length > 0) {
      const item = cartItems.find(i => i.productId === testProduct.id);
      if (item) {
        console.log(`Product quantity: ${item.quantity}`);
        
        if (item.quantity === 2) {
          console.log('\n✅ SUCCESS: Quantity correctly incremented to 2');
        } else {
          console.log(`\n❌ ISSUE: Expected quantity 2, got ${item.quantity}`);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testCart();
