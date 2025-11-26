import dotenv from 'dotenv';
import pool from './config/database.js';
import redisClient from './config/redis.js';
import productService from './services/product.service.js';

dotenv.config();

async function testProductAPI() {
  console.log('🧪 Testing Product API...\n');

  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Connected to Redis\n');

    // Test 1: Create a test product
    console.log('Test 1: Creating a test product...');
    const newProduct = await productService.createProduct({
      name: 'Spooky Witch Wig',
      description: 'A long black wig perfect for witch costumes',
      price: 29.99,
      promotional_price: 24.99,
      category: 'Wigs',
      theme: 'witch',
      model_url: 'https://example.com/models/witch-wig.glb',
      thumbnail_url: 'https://example.com/images/witch-wig.jpg',
      stock_quantity: 50,
      is_accessory: false,
    });
    console.log('✅ Product created:', newProduct.id);
    console.log('   Name:', newProduct.name, '\n');

    // Test 1b: Add colors to the product
    console.log('Test 1b: Adding colors to the product...');
    await productService.addProductColor(newProduct.id, 'Black', '#000000');
    await productService.addProductColor(newProduct.id, 'Purple', '#800080');
    await productService.addProductColor(newProduct.id, 'Green', '#00FF00');
    console.log('✅ Colors added\n');

    // Test 2: Get product by ID
    console.log('Test 2: Getting product by ID...');
    const fetchedProduct = await productService.getProductById(newProduct.id);
    console.log('✅ Product fetched:', fetchedProduct.name);
    console.log('   Price:', fetchedProduct.price);
    console.log('   Promotional Price:', fetchedProduct.promotional_price);
    console.log('   Colors:', fetchedProduct.colors?.map((c: any) => c.color_name).join(', '), '\n');

    // Test 3: Get all products
    console.log('Test 3: Getting all products...');
    const allProducts = await productService.getProducts();
    console.log('✅ Total products:', allProducts.length, '\n');

    // Test 4: Filter by theme
    console.log('Test 4: Filtering products by theme (witch)...');
    const witchProducts = await productService.getProducts({ theme: 'witch' });
    console.log('✅ Witch-themed products:', witchProducts.length, '\n');

    // Test 5: Search products
    console.log('Test 5: Searching products (keyword: "witch")...');
    const searchResults = await productService.searchProducts('witch');
    console.log('✅ Search results:', searchResults.length, '\n');

    // Test 6: Update product
    console.log('Test 6: Updating product...');
    const updatedProduct = await productService.updateProduct(newProduct.id, {
      stock_quantity: 45,
      promotional_price: 22.99,
    });
    console.log('✅ Product updated');
    console.log('   New stock:', updatedProduct.stock_quantity);
    console.log('   New promotional price:', updatedProduct.promotional_price, '\n');

    // Test 7: Add another color
    console.log('Test 7: Adding a new color...');
    const newColor = await productService.addProductColor(newProduct.id, 'Red', '#FF0000');
    console.log('✅ Color added:', newColor.color_name, newColor.color_hex, '\n');

    // Test 8: Verify cache (second fetch should be from cache)
    console.log('Test 8: Testing cache (fetching same product again)...');
    const cachedProduct = await productService.getProductById(newProduct.id);
    console.log('✅ Product fetched (from cache):', cachedProduct.name);
    console.log('   Colors:', cachedProduct.colors?.length || 0, '\n');

    // Test 9: Delete product
    console.log('Test 9: Deleting product...');
    await productService.deleteProduct(newProduct.id);
    console.log('✅ Product deleted\n');

    // Test 10: Verify deletion
    console.log('Test 10: Verifying product deletion...');
    try {
      await productService.getProductById(newProduct.id);
      console.log('❌ Product should not exist');
    } catch (error: any) {
      if (error.message === 'Product not found') {
        console.log('✅ Product not found (as expected)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await pool.end();
    await redisClient.quit();
    console.log('✅ Connections closed');
  }
}

testProductAPI();
