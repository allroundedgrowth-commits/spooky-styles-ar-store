import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testInspirationAPISimple() {
  console.log('🎃 Testing Costume Inspiration API (Simple)\n');

  try {
    // 1. Get all inspirations
    console.log('1️⃣  Fetching all costume inspirations...');
    const inspirationsResponse = await axios.get(`${API_URL}/inspirations`);
    const inspirations = inspirationsResponse.data;
    console.log(`   ✅ Found ${inspirations.length} costume inspirations`);
    
    if (inspirations.length === 0) {
      console.log('   ⚠️  No inspirations found. Run db:seed first.');
      return;
    }

    const testInspirationId = inspirations[0].id;
    console.log(`\n   📋 Sample inspirations:`);
    inspirations.slice(0, 5).forEach((insp: any, idx: number) => {
      console.log(`      ${idx + 1}. ${insp.name}`);
      console.log(`         ${insp.description}`);
    });

    // 2. Get specific inspiration with products
    console.log(`\n2️⃣  Fetching inspiration details for "${inspirations[0].name}"...`);
    const inspirationDetailResponse = await axios.get(`${API_URL}/inspirations/${testInspirationId}`);
    const inspirationDetail = inspirationDetailResponse.data;
    console.log(`   ✅ Inspiration: "${inspirationDetail.name}"`);
    console.log(`   📦 Products included: ${inspirationDetail.products.length}`);
    
    let totalPrice = 0;
    inspirationDetail.products.forEach((product: any, index: number) => {
      const price = product.promotional_price || product.price;
      totalPrice += price;
      console.log(`      ${index + 1}. ${product.name}`);
      console.log(`         Price: $${price} | Stock: ${product.stock_quantity} | Type: ${product.is_accessory ? 'Accessory' : 'Wig'}`);
    });
    console.log(`   💰 Total costume price: $${totalPrice.toFixed(2)}`);

    // 3. Get products for inspiration (alternative endpoint)
    console.log('\n3️⃣  Fetching inspiration products (alternative endpoint)...');
    const productsResponse = await axios.get(`${API_URL}/inspirations/${testInspirationId}/products`);
    const products = productsResponse.data;
    console.log(`   ✅ Retrieved ${products.length} products`);
    console.log(`   📊 Products are ordered by display_order: ${products.map((p: any) => p.display_order).join(', ')}`);

    // 4. Test error handling - invalid inspiration ID
    console.log('\n4️⃣  Testing error handling...');
    try {
      await axios.get(`${API_URL}/inspirations/00000000-0000-0000-0000-000000000000`);
      console.log('   ❌ Should have thrown error for invalid ID');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('   ✅ Correctly returned 404 for invalid inspiration ID');
        console.log(`      Error message: "${error.response.data.error.message}"`);
      } else {
        console.log(`   ⚠️  Unexpected error: ${error.response?.status}`);
      }
    }

    // 5. Verify all inspirations have products
    console.log('\n5️⃣  Verifying all inspirations have products...');
    let allValid = true;
    for (const inspiration of inspirations) {
      const detail = await axios.get(`${API_URL}/inspirations/${inspiration.id}`);
      if (detail.data.products.length === 0) {
        console.log(`   ❌ Inspiration "${inspiration.name}" has no products`);
        allValid = false;
      }
    }
    if (allValid) {
      console.log(`   ✅ All ${inspirations.length} inspirations have products`);
    }

    console.log('\n✅ All costume inspiration API tests passed! 🎃');
    console.log('\n📝 Note: To test "add-to-cart" functionality, ensure Redis is running and use test-inspiration.ts\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Make sure the backend server is running on port 5000');
    }
    process.exit(1);
  }
}

// Run tests
testInspirationAPISimple();
