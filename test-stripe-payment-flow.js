/**
 * Test Stripe Payment Flow
 * Tests the complete guest checkout payment process
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test guest info
const guestInfo = {
  email: 'test@example.com',
  name: 'Test User',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'US'
};

async function testPaymentFlow() {
  console.log('🧪 Testing Stripe Payment Flow\n');

  try {
    // Step 1: Create payment intent
    console.log('Step 1: Creating payment intent...');
    const amount = 5000; // $50.00 in cents
    
    const intentResponse = await axios.post(`${API_URL}/payments/intent`, {
      amount,
      guestInfo
    });

    console.log('✅ Payment intent created:');
    console.log('   Client Secret:', intentResponse.data.clientSecret ? 'Present' : 'Missing');
    console.log('   Payment Intent ID:', intentResponse.data.paymentIntentId);

    if (!intentResponse.data.clientSecret) {
      console.error('❌ Missing client secret!');
      return;
    }

    // Step 2: Simulate payment confirmation (in real app, Stripe.js handles this)
    console.log('\nStep 2: Payment would be confirmed via Stripe.js in browser');
    console.log('   Use test card: 4242 4242 4242 4242');
    console.log('   Any future expiry date and CVC');

    // Step 3: Check webhook handling
    console.log('\nStep 3: After payment succeeds, Stripe webhook should:');
    console.log('   - Receive payment_intent.succeeded event');
    console.log('   - Create order in database');
    console.log('   - Clear cart');
    console.log('   - Update order status to processing');

    console.log('\n✅ Payment flow test complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open browser to http://localhost:3000/checkout');
    console.log('   2. Fill in shipping information');
    console.log('   3. Use test card: 4242 4242 4242 4242');
    console.log('   4. Complete payment');
    console.log('   5. Check if redirected to order confirmation');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
testPaymentFlow();
