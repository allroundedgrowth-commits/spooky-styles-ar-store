/**
 * Manual test script for authentication endpoints
 * Run with: tsx src/test-auth.ts
 */

const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
}

const results: TestResult[] = [];

async function testRegister() {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'Test1234',
        name: 'Test User',
      }),
    });

    const data = await response.json();

    if (response.status === 201 && data.data.token) {
      results.push({
        name: 'Register',
        success: true,
        message: 'User registered successfully',
      });
      return data.data.token;
    } else {
      results.push({
        name: 'Register',
        success: false,
        message: `Failed: ${JSON.stringify(data)}`,
      });
      return null;
    }
  } catch (error) {
    results.push({
      name: 'Register',
      success: false,
      message: `Error: ${error}`,
    });
    return null;
  }
}

async function testLogin(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 200 && data.data.token) {
      results.push({
        name: 'Login',
        success: true,
        message: 'Login successful',
      });
      return data.data.token;
    } else {
      results.push({
        name: 'Login',
        success: false,
        message: `Failed: ${JSON.stringify(data)}`,
      });
      return null;
    }
  } catch (error) {
    results.push({
      name: 'Login',
      success: false,
      message: `Error: ${error}`,
    });
    return null;
  }
}

async function testGetCurrentUser(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.status === 200 && data.data.email) {
      results.push({
        name: 'Get Current User',
        success: true,
        message: 'Retrieved user successfully',
      });
    } else {
      results.push({
        name: 'Get Current User',
        success: false,
        message: `Failed: ${JSON.stringify(data)}`,
      });
    }
  } catch (error) {
    results.push({
      name: 'Get Current User',
      success: false,
      message: `Error: ${error}`,
    });
  }
}

async function testUpdateProfile(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Updated Name' }),
    });

    const data = await response.json();

    if (response.status === 200 && data.data.name === 'Updated Name') {
      results.push({
        name: 'Update Profile',
        success: true,
        message: 'Profile updated successfully',
      });
    } else {
      results.push({
        name: 'Update Profile',
        success: false,
        message: `Failed: ${JSON.stringify(data)}`,
      });
    }
  } catch (error) {
    results.push({
      name: 'Update Profile',
      success: false,
      message: `Error: ${error}`,
    });
  }
}

async function testLogout(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.status === 200) {
      results.push({
        name: 'Logout',
        success: true,
        message: 'Logout successful',
      });
    } else {
      results.push({
        name: 'Logout',
        success: false,
        message: `Failed: ${JSON.stringify(data)}`,
      });
    }
  } catch (error) {
    results.push({
      name: 'Logout',
      success: false,
      message: `Error: ${error}`,
    });
  }
}

async function runTests() {
  console.log('🎃 Starting Authentication Tests...\n');
  console.log('Make sure the server is running on http://localhost:5000\n');

  // Test registration
  const token = await testRegister();
  if (!token) {
    console.log('❌ Registration failed, stopping tests');
    printResults();
    return;
  }

  // Test get current user
  await testGetCurrentUser(token);

  // Test update profile
  await testUpdateProfile(token);

  // Test logout
  await testLogout(token);

  // Test login with new user
  const email = `test${Date.now()}@example.com`;
  const password = 'Test1234';
  
  await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Login Test User' }),
  });

  await testLogin(email, password);

  printResults();
}

function printResults() {
  console.log('\n📊 Test Results:\n');
  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  console.log(`\n${passed}/${total} tests passed`);
}

runTests();
