/**
 * Test script for saved address feature
 * 
 * Prerequisites:
 * 1. Database must be running (docker-compose up -d postgres)
 * 2. Migration must be run (npm run db:migrate --workspace=backend)
 * 3. Backend server must be running (npm run dev:backend)
 * 4. You must have a registered user account
 */

const API_URL = 'http://localhost:5000/api';

// Replace with your actual JWT token after logging in
const AUTH_TOKEN = 'your-jwt-token-here';

async function testSavedAddress() {
  console.log('🧪 Testing Saved Address Feature\n');

  try {
    // Test 1: Get user profile
    console.log('1️⃣ Testing GET /api/user/profile...');
    const profileResponse = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status} ${profileResponse.statusText}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile retrieved successfully');
    console.log('Current address:', {
      address: profileData.data.address || 'Not set',
      city: profileData.data.city || 'Not set',
      state: profileData.data.state || 'Not set',
      zipCode: profileData.data.zipCode || 'Not set'
    });
    console.log('');

    // Test 2: Update address
    console.log('2️⃣ Testing PUT /api/user/address...');
    const testAddress = {
      phone: '555-0123',
      address: '123 Test Street',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      country: 'US'
    };

    const updateResponse = await fetch(`${API_URL}/user/address`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAddress)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Address update failed: ${JSON.stringify(errorData)}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Address updated successfully');
    console.log('New address:', {
      address: updateData.data.address,
      city: updateData.data.city,
      state: updateData.data.state,
      zipCode: updateData.data.zipCode
    });
    console.log('');

    // Test 3: Verify address was saved
    console.log('3️⃣ Verifying address persistence...');
    const verifyResponse = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyResponse.json();
    const savedAddress = verifyData.data;

    if (
      savedAddress.address === testAddress.address &&
      savedAddress.city === testAddress.city &&
      savedAddress.state === testAddress.state &&
      savedAddress.zipCode === testAddress.zipCode
    ) {
      console.log('✅ Address persisted correctly');
    } else {
      console.log('❌ Address mismatch!');
      console.log('Expected:', testAddress);
      console.log('Got:', savedAddress);
    }
    console.log('');

    // Test 4: Test validation
    console.log('4️⃣ Testing address validation...');
    const invalidAddress = {
      address: '123', // Too short
      city: 'A', // Too short
      state: 'T', // Too short
      zipCode: '123', // Invalid format
      country: 'US'
    };

    const validationResponse = await fetch(`${API_URL}/user/address`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidAddress)
    });

    if (validationResponse.ok) {
      console.log('❌ Validation should have failed but passed');
    } else {
      const errorData = await validationResponse.json();
      console.log('✅ Validation working correctly');
      console.log('Error message:', errorData.error?.message);
    }
    console.log('');

    console.log('🎉 All tests completed!\n');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:3000/checkout');
    console.log('2. Verify your saved address auto-populates');
    console.log('3. Try updating the address and checking "Save this address"');
    console.log('4. Complete a purchase and verify address persists');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Docker is running: docker-compose up -d');
    console.log('2. Run migration: npm run db:migrate --workspace=backend');
    console.log('3. Start backend: npm run dev:backend');
    console.log('4. Get a valid JWT token by logging in');
    console.log('5. Update AUTH_TOKEN in this script');
  }
}

// Instructions for getting auth token
if (AUTH_TOKEN === 'your-jwt-token-here') {
  console.log('⚠️  Please update AUTH_TOKEN in this script first!\n');
  console.log('To get your auth token:');
  console.log('1. Start the backend: npm run dev:backend');
  console.log('2. Login via API or frontend');
  console.log('3. Copy the JWT token from the response');
  console.log('4. Update AUTH_TOKEN in this script');
  console.log('5. Run: node test-saved-address.js\n');
} else {
  testSavedAddress();
}
