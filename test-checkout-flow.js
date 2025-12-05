const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCheckoutFlow() {
  console.log('🧪 Testing Checkout Flow\n');

  try {
    // Step 1: Add product to cart
    console.log('1️⃣ Adding product to cart...');
    const productsRes = await axios.get(`${API_URL}/products`);
    const product = productsRes.data.data[0];
    
    const cartItem = {
      productId: product.id,
      quantity: 1,
      customizations: {}
    };

    await axios.post(`${API_URL}/cart/items`, cartItem);
    console.log('✅ Product added to cart\n');

    // Step 2: Get cart to calculate total
    console.log('2️⃣ Fetching cart...');
    const cartRes = await axios.get(`${API_URL}/cart`);
    const cart = cartRes.data.data;
    
    const totalAmount = Math.round(cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) * 100); // Convert to cents

    console.log(`✅ Cart total: $${(totalAmount / 100).toFixed(2)}\n`);

    // Step 3: Create payment intent
    console.log('3️⃣ Creating payment intent...');
    const paymentIntentRes = await axios.post(
      `${API_URL}/payments/intent`,
      { 
        amount: totalAmount,
        guestInfo: {
          email: 'test@example.com',
          name: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US'
        }
      }
    );

    console.log('✅ Payment intent created!');
    console.log('Response:', JSON.stringify(paymentIntentRes.data, null, 2));
    console.log('\n✅ SUCCESS! Checkout flow is working correctly.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error details:', error);
    }
  }
}

testCheckoutFlow();
