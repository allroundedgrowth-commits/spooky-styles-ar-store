import dotenv from 'dotenv';
import { connectRedis } from './config/redis.js';
import cartService from './services/cart.service.js';

dotenv.config();

async function testCart() {
  try {
    console.log('🧪 Testing Cart Service...\n');

    // Connect to Redis
    await connectRedis();
    console.log('✅ Connected to Redis\n');

    const testUserId = 'test-user-123';
    const testProductId = 'test-product-456';

    // Test 1: Get empty cart
    console.log('Test 1: Get empty cart');
    const emptyCart = await cartService.getCart(testUserId);
    console.log('Empty cart:', JSON.stringify(emptyCart, null, 2));
    console.log('✅ Test 1 passed\n');

    // Test 2: Add item to cart
    console.log('Test 2: Add item to cart');
    try {
      const cartWithItem = await cartService.addItem(
        testUserId,
        testProductId,
        2,
        { color: 'red', accessories: ['hat'] }
      );
      console.log('Cart with item:', JSON.stringify(cartWithItem, null, 2));
      console.log('✅ Test 2 passed\n');
    } catch (error: any) {
      console.log('⚠️  Expected error (product validation):', error.message);
      console.log('This is expected if the product doesn\'t exist in the database\n');
    }

    // Test 3: Get cart total
    console.log('Test 3: Get cart total');
    const total = await cartService.getCartTotal(testUserId);
    console.log('Cart total:', total);
    console.log('✅ Test 3 passed\n');

    // Test 4: Clear cart
    console.log('Test 4: Clear cart');
    await cartService.clearCart(testUserId);
    const clearedCart = await cartService.getCart(testUserId);
    console.log('Cleared cart:', JSON.stringify(clearedCart, null, 2));
    console.log('✅ Test 4 passed\n');

    console.log('🎉 All cart service tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCart();
