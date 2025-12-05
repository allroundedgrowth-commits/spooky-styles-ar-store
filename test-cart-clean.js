// Clean test of cart functionality
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCart() {
  try {
    console.log('Testing cart with clean state...\n');

    // Get products
    const productsResponse = await axios.get(`${API_URL}/products`);
    const testProduct = productsResponse.data.data[0];
    console.log(`Using product: ${testProduct.name}\n`);

    // Clear cart
    console.log('1. Clearing cart...');
    await axios.delete(`${API_URL}/cart`);
    console.log('✓ Cart cleared\n');

    // Verify empty
    const emptyCart = await axios.get(`${API_URL}/cart`);
    console.log(`Cart items: ${emptyCart.data.data.items.length}\n`);

    // Add item first time
    console.log('2. Adding product (quantity: 1)...');
    const add1 = await axios.post(`${API_URL}/cart/items`, {
      productId: testProduct.id,
      quantity: 1,
      customizations: {}
    });
    console.log(`✓ Quantity: ${add1.data.data.items[0].quantity}\n`);

    // Add same item second time
    console.log('3. Adding same product again (quantity: 1)...');
    const add2 = await axios.post(`${API_URL}/cart/items`, {
      productId: testProduct.id,
      quantity: 1,
      customizations: {}
    });
    console.log(`✓ Quantity: ${add2.data.data.items[0].quantity}\n`);

    // Add same item third time
    console.log('4. Adding same product again (quantity: 1)...');
    const add3 = await axios.post(`${API_URL}/cart/items`, {
      productId: testProduct.id,
      quantity: 1,
      customizations: {}
    });
    console.log(`✓ Quantity: ${add3.data.data.items[0].quantity}\n`);

    // Final check
    const finalCart = await axios.get(`${API_URL}/cart`);
    const finalQty = finalCart.data.data.items[0].quantity;
    
    if (finalQty === 3) {
      console.log('✅ SUCCESS: Cart correctly incremented quantity to 3!');
    } else {
      console.log(`❌ FAILURE: Expected 3, got ${finalQty}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCart();
