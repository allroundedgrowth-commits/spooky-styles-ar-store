// Debug login response
async function debugLogin() {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@spookystyles.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('Full response:', JSON.stringify(data, null, 2));
}

debugLogin();
