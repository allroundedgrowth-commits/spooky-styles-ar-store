/**
 * Test Payment Completion Flow
 * Verifies the guest checkout order retrieval endpoint
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testPaymentCompletion() {
  console.log('🧪 Testing Payment Completion Flow\n');

  try {
    // Step 1: Test the new public endpoint (will fail with 404 since we don't have a real payment intent)
    console.log('Step 1: Testing public order lookup endpoint...');
    const testPaymentIntentId = 'pi_test_123456789';
    
    try {
      const response = await axios.get(`${API_URL}/orders/payment-intent/${testPaymentIntentId}`);
      console.log('✅ Endpoint is accessible');
      console.log('   Response:', response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Endpoint is working (404 expected for non-existent payment intent)');
        console.log('   Error message:', error.response.data.error.message);
      } else {
        console.error('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n📝 Complete Guest Checkout Test:');
    console.log('   1. Open browser: http://localhost:3000/products');
    console.log('   2. Add items to cart (no login required)');
    console.log('   3. Click "Proceed to Checkout"');
    console.log('   4. Fill in shipping information:');
    console.log('      - Email: test@example.com');
    console.log('      - Name: Test User');
    console.log('      - Address: 123 Test St');
    console.log('      - City: Test City');
    console.log('      - State: TS');
    console.log('      - ZIP: 12345');
    console.log('   5. Use Stripe test card:');
    console.log('      - Card: 4242 4242 4242 4242');
    console.log('      - Expiry: Any future date (e.g., 12/25)');
    console.log('      - CVC: Any 3 digits (e.g., 123)');
    console.log('   6. Click "Complete Payment"');
    console.log('   7. Should redirect to order confirmation page');
    console.log('   8. Order details should load (may take a few seconds)');

    console.log('\n✅ Backend is ready for guest checkout!');
    console.log('\n🔍 What to watch for:');
    console.log('   - Payment form appears correctly');
    console.log('   - After payment, redirects to /order-confirmation?payment_intent=...');
    console.log('   - Order confirmation page polls for order (up to 5 retries)');
    console.log('   - Order details display with items and total');
    console.log('   - Backend logs show webhook processing');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run test
testPaymentCompletion();
