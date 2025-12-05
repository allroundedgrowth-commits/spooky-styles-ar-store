/**
 * Quick script to update product images with local wig files
 * Run after downloading wig PNGs to frontend/public/wigs/
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://spooky_user:spooky_password@localhost:5432/spooky_wigs',
});

async function updateWigImages() {
  console.log('🔄 Updating product images...\n');

  try {
    // Get all products
    const { rows: products } = await pool.query('SELECT id, name FROM products WHERE is_accessory = false LIMIT 5');
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      console.log('💡 Run: npm run db:seed --workspace=backend');
      return;
    }

    console.log(`Found ${products.length} products\n`);

    // Update each product with a local wig image
    const wigImages = [
      '/wigs/wig1.png',
      '/wigs/wig2.png',
      '/wigs/wig3.png',
      '/wigs/wig4.png',
      '/wigs/wig5.png',
    ];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const wigImage = wigImages[i % wigImages.length];

      await pool.query(
        'UPDATE products SET ar_image_url = $1, image_url = $1, thumbnail_url = $1 WHERE id = $2',
        [wigImage, product.id]
      );

      console.log(`✅ Updated: ${product.name}`);
      console.log(`   Image: ${wigImage}\n`);
    }

    console.log('========================================');
    console.log('✅ All products updated!');
    console.log('========================================\n');
    console.log('⚠️  IMPORTANT: Make sure you have downloaded wig images to:');
    console.log('   frontend/public/wigs/wig1.png');
    console.log('   frontend/public/wigs/wig2.png');
    console.log('   etc.\n');
    console.log('💡 Search Google for: "transparent wig PNG"');
    console.log('💡 Or use: https://www.pngarts.com/explore/wig\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateWigImages();
