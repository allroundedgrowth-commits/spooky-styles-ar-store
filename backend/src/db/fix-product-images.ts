import pool from '../config/database.js';

/**
 * Fix product images by updating to reliable placeholder URLs
 * Uses placeholder.com which provides reliable, free placeholder images
 */
async function fixProductImages() {
  try {
    console.log('🔧 Fixing product images...');

    // Update all products with reliable placeholder images
    // Using placeholder.com with appropriate sizes and colors
    const result = await pool.query(`
      UPDATE products 
      SET thumbnail_url = CASE
        WHEN LOWER(category) = 'wigs' THEN 'https://placehold.co/400x400/8b5cf6/ffffff?text=Wig'
        WHEN LOWER(category) = 'hats' THEN 'https://placehold.co/400x400/f97316/ffffff?text=Hat'
        WHEN LOWER(category) = 'masks' THEN 'https://placehold.co/400x400/10b981/ffffff?text=Mask'
        WHEN LOWER(category) = 'accessories' THEN 'https://placehold.co/400x400/ec4899/ffffff?text=Accessory'
        WHEN LOWER(category) = 'costumes' THEN 'https://placehold.co/400x400/f59e0b/ffffff?text=Costume'
        ELSE 'https://placehold.co/400x400/6b7280/ffffff?text=Product'
      END
      RETURNING id, name, category, thumbnail_url;
    `);

    console.log(`✅ Updated ${result.rows.length} product images`);
    
    if (result.rows.length > 0) {
      console.log('\nSample updated products:');
      result.rows.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name} (${product.category})`);
        console.log(`    ${product.thumbnail_url}`);
      });
    }

    await pool.end();
    console.log('\n✅ Product images fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing product images:', error);
    process.exit(1);
  }
}

fixProductImages();
