/**
 * Quick test to check if products API is working
 * Run with: node test-products-api.js
 */

const http = require('http');

const API_URL = 'http://localhost:5000';

console.log('🔍 Testing Products API...\n');

// Test 1: Check if backend is running
const testBackend = () => {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing backend connection...');
    const req = http.get(`${API_URL}/api/products`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const products = JSON.parse(data);
            console.log(`✅ Backend is running`);
            console.log(`✅ Found ${products.length} products\n`);
            resolve(products);
          } catch (error) {
            console.log(`❌ Backend returned invalid JSON`);
            console.log(`Response: ${data}\n`);
            reject(error);
          }
        } else {
          console.log(`❌ Backend returned status ${res.statusCode}`);
          console.log(`Response: ${data}\n`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Backend not reachable: ${error.message}`);
      console.log(`\n💡 Make sure backend is running:`);
      console.log(`   npm run dev:backend\n`);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Test 2: Check product details
const testProductDetails = (products) => {
  console.log('2️⃣ Checking product details...');
  
  if (products.length === 0) {
    console.log(`❌ No products in database`);
    console.log(`\n💡 Seed the database:`);
    console.log(`   npm run db:seed --workspace=backend\n`);
    return false;
  }
  
  const product = products[0];
  console.log(`\nFirst product:`);
  console.log(`  ID: ${product.id}`);
  console.log(`  Name: ${product.name}`);
  console.log(`  Price: $${product.price}`);
  console.log(`  Category: ${product.category}`);
  
  // Check image URLs
  console.log(`\nImage URLs:`);
  console.log(`  ar_image_url: ${product.ar_image_url || '❌ MISSING'}`);
  console.log(`  image_url: ${product.image_url || '❌ MISSING'}`);
  console.log(`  thumbnail_url: ${product.thumbnail_url || '❌ MISSING'}`);
  
  if (!product.ar_image_url && !product.image_url && !product.thumbnail_url) {
    console.log(`\n⚠️  WARNING: Product has no images!`);
    console.log(`   Wig won't display in AR try-on\n`);
    return false;
  }
  
  // Check colors
  if (product.colors && product.colors.length > 0) {
    console.log(`\nColors: ${product.colors.length} available`);
    product.colors.forEach(color => {
      console.log(`  - ${color.color_name} (${color.color_hex})`);
    });
  } else {
    console.log(`\n⚠️  WARNING: Product has no colors`);
  }
  
  console.log(`\n✅ Product data looks good\n`);
  return true;
};

// Test 3: Test specific product by ID
const testProductById = (productId) => {
  return new Promise((resolve, reject) => {
    console.log(`3️⃣ Testing product by ID: ${productId}...`);
    const req = http.get(`${API_URL}/api/products/${productId}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const product = JSON.parse(data);
            console.log(`✅ Product found: ${product.name}`);
            console.log(`   URL for AR: http://localhost:5173/ar-tryon/${product.id}\n`);
            resolve(product);
          } catch (error) {
            console.log(`❌ Invalid JSON response\n`);
            reject(error);
          }
        } else if (res.statusCode === 404) {
          console.log(`❌ Product not found (404)`);
          console.log(`   Check if product ID exists in database\n`);
          reject(new Error('Product not found'));
        } else {
          console.log(`❌ Error: Status ${res.statusCode}\n`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}\n`);
      reject(error);
    });
  });
};

// Run all tests
const runTests = async () => {
  try {
    // Test 1: Backend connection
    const products = await testBackend();
    
    // Test 2: Product details
    const hasValidProducts = testProductDetails(products);
    
    // Test 3: Specific product (if available)
    if (products.length > 0) {
      await testProductById(products[0].id);
    }
    
    // Summary
    console.log('=' .repeat(50));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(50));
    
    if (hasValidProducts) {
      console.log('✅ Backend API is working');
      console.log('✅ Products are available');
      console.log('✅ Product data is valid');
      console.log('\n🎉 Everything looks good!');
      console.log('\n📝 Test URLs:');
      console.log(`   Products page: http://localhost:5173/products`);
      console.log(`   AR Try-On: http://localhost:5173/ar-tryon/${products[0].id}`);
    } else {
      console.log('⚠️  Backend is running but has issues');
      console.log('⚠️  Check product data in database');
    }
    
  } catch (error) {
    console.log('\n=' .repeat(50));
    console.log('❌ TESTS FAILED');
    console.log('=' .repeat(50));
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Start backend: npm run dev:backend');
    console.log('2. Check database: docker-compose up -d');
    console.log('3. Run migrations: npm run db:migrate --workspace=backend');
    console.log('4. Seed data: npm run db:seed --workspace=backend');
    console.log('\nError:', error.message);
  }
};

// Run the tests
runTests();
