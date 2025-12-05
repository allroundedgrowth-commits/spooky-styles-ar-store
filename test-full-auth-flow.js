// Test full authentication flow
async function testFullFlow() {
  console.log('🎃 Testing Full Auth Flow\n');
  
  const baseUrl = 'http://localhost:3000/api';
  let token = null;
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'Admin123!'
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error);
      return;
    }
    
    const loginData = await loginResponse.json();
    token = loginData.data.token;
    console.log('✅ Login successful!');
    console.log('   User:', loginData.data.user.email);
    console.log('   Is Admin:', loginData.data.user.is_admin);
    console.log('   Token:', token.substring(0, 30) + '...');
    
    // Step 2: Get current user with token
    console.log('\n2️⃣ Getting current user with token...');
    const userResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.ok) {
      const error = await userResponse.json();
      console.log('❌ Get user failed:', error);
      return;
    }
    
    const userData = await userResponse.json();
    console.log('✅ User data retrieved!');
    console.log('   User:', userData.data.email);
    console.log('   Is Admin:', userData.data.is_admin);
    
    // Step 3: Test admin endpoint
    console.log('\n3️⃣ Testing admin endpoint...');
    const adminResponse = await fetch(`${baseUrl}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (adminResponse.ok) {
      const products = await adminResponse.json();
      console.log('✅ Admin access works!');
      console.log('   Products count:', products.data?.length || 0);
    } else {
      console.log('❌ Admin access failed:', adminResponse.status);
    }
    
    console.log('\n✅ Full auth flow complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullFlow();
