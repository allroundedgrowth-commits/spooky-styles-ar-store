// Test delete and verify products refresh
async function testDeleteAndRefresh() {
  console.log('🧪 Testing Delete and Refresh Flow\n');
  
  // 1. Get initial product count
  console.log('1. Getting initial products...');
  let response = await fetch('http://localhost:3000/api/products');
  let data = await response.json();
  const initialCount = data.count;
  const firstProduct = data.data[0];
  console.log(`   Initial count: ${initialCount}`);
  console.log(`   First product: ${firstProduct.name} (${firstProduct.id})\n`);
  
  // 2. Login as admin
  console.log('2. Logging in as admin...');
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@spookystyles.com',
      password: 'admin123'
    })
  });
  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log(`   ✅ Logged in, token: ${token.substring(0, 20)}...\n`);
  
  // 3. Delete the first product
  console.log(`3. Deleting product: ${firstProduct.name}...`);
  const deleteResponse = await fetch(`http://localhost:3000/api/products/${firstProduct.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const deleteData = await deleteResponse.json();
  console.log(`   Status: ${deleteResponse.status}`);
  console.log(`   Response:`, deleteData);
  
  if (deleteResponse.status === 200) {
    console.log(`   ✅ Product deleted successfully\n`);
  } else {
    console.log(`   ❌ Delete failed\n`);
    return;
  }
  
  // 4. Wait a moment for cache to clear
  console.log('4. Waiting 2 seconds for cache to clear...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('   Done\n');
  
  // 5. Get products again (should be one less)
  console.log('5. Getting products after delete...');
  response = await fetch('http://localhost:3000/api/products');
  data = await response.json();
  const newCount = data.count;
  console.log(`   New count: ${newCount}`);
  console.log(`   Expected: ${initialCount - 1}\n`);
  
  // 6. Verify the deleted product is not in the list
  const stillExists = data.data.find(p => p.id === firstProduct.id);
  if (stillExists) {
    console.log(`   ❌ PROBLEM: Deleted product still appears in list!`);
    console.log(`   This means cache is not being cleared properly.\n`);
  } else {
    console.log(`   ✅ Deleted product is NOT in the list (correct!)\n`);
  }
  
  // 7. Summary
  console.log('📊 Summary:');
  console.log(`   Initial products: ${initialCount}`);
  console.log(`   After delete: ${newCount}`);
  console.log(`   Difference: ${initialCount - newCount}`);
  console.log(`   Cache cleared: ${!stillExists ? 'YES ✅' : 'NO ❌'}`);
}

testDeleteAndRefresh().catch(console.error);
