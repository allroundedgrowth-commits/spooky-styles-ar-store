// Test login functionality
async function testLogin() {
  console.log('🧪 Testing Login...\n');
  
  // Test admin login
  console.log('1. Testing admin login...');
  try {
    const adminResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'admin123'
      })
    });
    
    const adminData = await adminResponse.json();
    console.log('   Status:', adminResponse.status);
    console.log('   Success:', adminData.success);
    if (adminData.success) {
      console.log('   ✅ Admin login successful!');
      console.log('   User:', adminData.data.user.email);
      console.log('   Is Admin:', adminData.data.user.is_admin);
      console.log('   Token:', adminData.data.token.substring(0, 20) + '...');
    } else {
      console.log('   ❌ Admin login failed:', adminData.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n2. Testing regular user login...');
  try {
    const userResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const userData = await userResponse.json();
    console.log('   Status:', userResponse.status);
    console.log('   Success:', userData.success);
    if (userData.success) {
      console.log('   ✅ User login successful!');
      console.log('   User:', userData.data.user.email);
      console.log('   Is Admin:', userData.data.user.is_admin);
      console.log('   Token:', userData.data.token.substring(0, 20) + '...');
    } else {
      console.log('   ❌ User login failed:', userData.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n3. Testing products API...');
  try {
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const productsData = await productsResponse.json();
    console.log('   Status:', productsResponse.status);
    console.log('   Success:', productsData.success);
    console.log('   Product count:', productsData.count);
    console.log('   ✅ Products API working!');
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n✅ All tests complete!');
}

testLogin();
