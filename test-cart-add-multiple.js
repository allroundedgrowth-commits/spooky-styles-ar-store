// Test adding multiple items of the same product to cart
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAddMultipleItems() {
  try {
    console.log('Testing: Add same product multiple times to cart\n');

    // Test product ID (use an existing product)
    const productId = '1'; // Adjust this to match your product

    // Clear cart first
    console.log('1. Clearing cart...');
    try {
      await axios.delete(`${API_URL}/cart`);
      console.log('✓ Cart cleared\n');
    } catch (err) {
      console.log('Cart was already empty or error:', err.response?.data);
    }

    // Add item first time
    console.log('2. Adding product to cart (first time)...');
    const response1 = await axios.post(`${API_URL}/cart/items`, {
      productId,
      quantity: 1,
      customizations: {}
    });
    console.log('✓ First add successful');
    console.log('Cart items:', response1.data.data.items.length);
    console.log('First item quantity:', response1.data.data.items[0]?.quantity);
    console.log('');

    // Add same item second time
    console.log('3. Adding same product to cart (second time)...');
    const response2 = await axios.post(`${API_URL}/cart/items`, {
      productId,
      quantity: 1,
      customizations: {}
    });
    console.log('✓ Second add successful');
    console.log('Cart items:', response2.data.data.items.length);
    console.log('Item quantity:', response2.data.data.items[0]?.quantity);
    console.log('');

    // Add same item third time
    console.log('4. Adding same product to cart (third time)...');
    const response3 = await axios.post(`${API_URL}/cart/items`, {
      productId,
      quantity: 1,
      customizations: {}
    });
    console.log('✓ Third add successful');
    console.log('Cart items:', response3.data.data.items.length);
    console.log('Item quantity:', response3.data.data.items[0]?.quantity);
    console.log('');

    // Get final cart
    console.log('5. Getting final cart state...');
    const finalCart = await axios.get(`${API_URL}/cart`);
    console.log('✓ Final cart retrieved');
    console.log('Total items in cart:', finalCart.data.data.items.length);
    console.log('Item details:', JSON.stringify(finalCart.data.data.items, null, 2));

    if (finalCart.data.data.items.length === 1 && finalCart.data.data.items[0].quantity === 3) {
      console.log('\n✅ SUCCESS: Cart correctly incremented quantity to 3');
    } else {
      console.log('\n❌ FAILURE: Expected 1 item with quantity 3');
      console.log('Got:', finalCart.data.data.items);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAddMultipleItems();
