// Simple test to check products
async function testProducts() {
  const response = await fetch('http://localhost:5000/api/products');
  const data = await response.json();
  
  console.log('Products from API:');
  console.log(`Count: ${data.count}`);
  console.log('\nFirst 3 products:');
  data.data.slice(0, 3).forEach(p => {
    console.log(`  - ${p.name} (${p.id})`);
  });
}

testProducts();
