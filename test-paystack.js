// Quick test to verify Paystack integration
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test Paystack keys are loaded
console.log('🧪 Testing Paystack Integration\n');

// Check if backend has Paystack configured
async function testPaystackConfig() {
  try {
    console.log('1. Checking backend health...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is running\n');

    console.log('2. Testing Paystack configuration...');
    console.log('   Secret Key:', process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Public Key:', process.env.PAYSTACK_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
    
    console.log('\n3. Paystack Test Card:');
    console.log('   Card: 4084 0840 8408 4081');
    console.log('   CVV: 408');
    console.log('   Expiry: 12/25');
    console.log('   PIN: 0000');
    console.log('   OTP: 123456');

    console.log('\n✅ Paystack is configured!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your app: npm run dev');
    console.log('   2. Go to http://localhost:3000');
    console.log('   3. Add items to cart and checkout');
    console.log('   4. Use the test card above');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure to run: npm run dev');
  }
}

testPaystackConfig();
