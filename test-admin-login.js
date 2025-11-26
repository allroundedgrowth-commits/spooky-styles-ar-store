// Test admin login
async function testLogin() {
  console.log('🎃 Testing Admin Login\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spookystyles.com',
        password: 'Admin123!'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.data?.user) {
      console.log('\n✅ Login successful!');
      console.log('User:', data.data.user.email);
      console.log('Is Admin:', data.data.user.isAdmin);
      console.log('Token:', data.data.token.substring(0, 30) + '...');
    } else {
      console.log('\n❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
