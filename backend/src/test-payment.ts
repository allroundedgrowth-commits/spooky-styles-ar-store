import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const results: TestResult[] = [];

// Helper function for API calls
async function apiCall(
  method: string,
  endpoint: string,
  data?: any,
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const responseData = await response.json() as any;

  if (!response.ok) {
    const error: any = new Error(responseData.error?.message || 'Request failed');
    error.response = { status: response.status, data: responseData };
    throw error;
  }

  return responseData;
}

async function testPaymentFlow() {
  console.log('🎃 Testing Stripe Payment Integration\n');

  let authToken = '';
  let userId = '';
  let productId = '';
  let paymentIntentId = '';

  try {
    // 1. Register a test user
    console.log('1️⃣  Registering test user...');
    try {
      const registerResponse = await apiCall('POST', '/auth/register', {
        email: `test-payment-${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Payment Test User',
      });
      authToken = registerResponse.token;
      userId = registerResponse.user.id;
      results.push({
        test: 'User Registration',
        status: 'PASS',
        message: `User registered with ID: ${userId}`,
      });
      console.log('   ✅ User registered successfully\n');
    } catch (error: any) {
      results.push({
        test: 'User Registration',
        status: 'FAIL',
        message: (error as any).response?.data?.error?.message || (error as Error).message,
      });
      console.log('   ❌ Failed to register user\n');
      throw error;
    }

    // 2. Get a product to add to cart
    console.log('2️⃣  Fetching products...');
    try {
      const productsResponse = await apiCall('GET', '/products');
      if (productsResponse.products.length === 0) {
        throw new Error('No products available');
      }
      productId = productsResponse.products[0].id;
      results.push({
        test: 'Fetch Products',
        status: 'PASS',
        message: `Found product: ${productsResponse.products[0].name}`,
      });
      console.log('   ✅ Products fetched successfully\n');
    } catch (error: any) {
      results.push({
        test: 'Fetch Products',
        status: 'FAIL',
        message: (error as any).response?.data?.error?.message || (error as Error).message,
      });
      console.log('   ❌ Failed to fetch products\n');
      throw error;
    }

    // 3. Add product to cart
    console.log('3️⃣  Adding product to cart...');
    try {
      await apiCall('POST', '/cart/items', {
        productId,
        quantity: 2,
        customizations: {
          color: 'Black',
        },
      }, authToken);
      results.push({
        test: 'Add to Cart',
        status: 'PASS',
        message: 'Product added to cart',
      });
      console.log('   ✅ Product added to cart\n');
    } catch (error: any) {
      results.push({
        test: 'Add to Cart',
        status: 'FAIL',
        message: (error as any).response?.data?.error?.message || (error as Error).message,
      });
      console.log('   ❌ Failed to add product to cart\n');
      throw error;
    }

    // 4. Create payment intent
    console.log('4️⃣  Creating payment intent...');
    try {
      const paymentIntentResponse = await apiCall('POST', '/payments/intent', {}, authToken);
      paymentIntentId = paymentIntentResponse.paymentIntentId;
      const clientSecret = paymentIntentResponse.clientSecret;
      
      if (!clientSecret || !paymentIntentId) {
        throw new Error('Payment intent missing required fields');
      }
      
      results.push({
        test: 'Create Payment Intent',
        status: 'PASS',
        message: `Payment intent created: ${paymentIntentId}`,
      });
      console.log('   ✅ Payment intent created successfully');
      console.log(`   💳 Payment Intent ID: ${paymentIntentId}`);
      console.log(`   🔑 Client Secret: ${clientSecret.substring(0, 20)}...\n`);
    } catch (error: any) {
      results.push({
        test: 'Create Payment Intent',
        status: 'FAIL',
        message: (error as any).response?.data?.error?.message || (error as Error).message,
      });
      console.log('   ❌ Failed to create payment intent\n');
      throw error;
    }

    // 5. Test payment confirmation endpoint
    console.log('5️⃣  Testing payment confirmation endpoint...');
    try {
      // This will fail because payment hasn't actually been completed
      // But it tests that the endpoint exists and validates input
      await apiCall('POST', '/payments/confirm', { paymentIntentId }, authToken);
      results.push({
        test: 'Payment Confirmation Endpoint',
        status: 'PASS',
        message: 'Endpoint accessible (payment not completed in test)',
      });
      console.log('   ✅ Payment confirmation endpoint working\n');
    } catch (error: any) {
      // Expected to fail since we didn't actually complete payment
      const err = error as any;
      if (err.response?.status === 400 && err.response?.data?.error?.message?.includes('not been completed')) {
        results.push({
          test: 'Payment Confirmation Endpoint',
          status: 'PASS',
          message: 'Endpoint correctly validates payment status',
        });
        console.log('   ✅ Payment confirmation endpoint working (correctly rejected incomplete payment)\n');
      } else {
        results.push({
          test: 'Payment Confirmation Endpoint',
          status: 'FAIL',
          message: err.response?.data?.error?.message || (error as Error).message,
        });
        console.log('   ❌ Payment confirmation endpoint error\n');
      }
    }

    // 6. Test webhook endpoint exists
    console.log('6️⃣  Testing webhook endpoint...');
    try {
      // This will fail without proper signature, but confirms endpoint exists
      await apiCall('POST', '/payments/webhook', {});
    } catch (error: any) {
      const err = error as any;
      if (err.response?.status === 400) {
        results.push({
          test: 'Webhook Endpoint',
          status: 'PASS',
          message: 'Webhook endpoint exists and validates signature',
        });
        console.log('   ✅ Webhook endpoint configured\n');
      } else {
        results.push({
          test: 'Webhook Endpoint',
          status: 'FAIL',
          message: err.response?.data?.error?.message || (error as Error).message,
        });
        console.log('   ❌ Webhook endpoint error\n');
      }
    }

    // 7. Test order endpoints
    console.log('7️⃣  Testing order endpoints...');
    try {
      const ordersResponse = await apiCall('GET', '/orders', undefined, authToken);
      results.push({
        test: 'Order History Endpoint',
        status: 'PASS',
        message: `Orders retrieved: ${ordersResponse.length}`,
      });
      console.log('   ✅ Order history endpoint working\n');
    } catch (error: any) {
      results.push({
        test: 'Order History Endpoint',
        status: 'FAIL',
        message: (error as any).response?.data?.error?.message || (error as Error).message,
      });
      console.log('   ❌ Order history endpoint error\n');
    }

  } catch (error) {
    console.error('Test suite failed:', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  const totalCount = results.length;
  
  console.log('='.repeat(60));
  console.log(`Results: ${passCount}/${totalCount} tests passed`);
  console.log('='.repeat(60));

  if (passCount === totalCount) {
    console.log('\n🎉 All payment integration tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Configure Stripe webhook in Stripe Dashboard');
    console.log('   2. Point webhook to: https://your-domain.com/api/payments/webhook');
    console.log('   3. Add STRIPE_WEBHOOK_SECRET to .env');
    console.log('   4. Test with real Stripe test cards');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

// Run tests
testPaymentFlow().catch(console.error);
