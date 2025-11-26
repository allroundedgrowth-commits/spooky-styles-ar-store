import pool from '../config/database.js';

/**
 * Fix 3D model URLs by updating to publicly available GLB models
 * Uses free models from various CDNs and repositories
 */
async function fix3DModels() {
  try {
    console.log('🔧 Fixing 3D model URLs...');

    // Update products with publicly available 3D models
    // Using free models from various sources
    const result = await pool.query(`
      UPDATE products 
      SET model_url = CASE
        -- Wigs and hair models
        WHEN LOWER(category) IN ('wigs', 'hair') THEN 
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
        
        -- Hats and headwear
        WHEN LOWER(category) = 'hats' THEN 
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Helmet/glTF-Binary/Helmet.glb'
        
        -- Masks
        WHEN LOWER(category) = 'masks' THEN 
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
        
        -- Accessories (jewelry, glasses, etc)
        WHEN LOWER(category) = 'accessories' THEN 
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
        
        -- Costumes and full outfits
        WHEN LOWER(category) = 'costumes' THEN 
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
        
        -- Default fallback
        ELSE 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
      END
      WHERE model_url IS NULL 
         OR model_url LIKE '/models/%' 
         OR model_url LIKE 'https://cdn.spookystyles.com/%'
      RETURNING id, name, category, model_url;
    `);

    console.log(`✅ Updated ${result.rows.length} product 3D models`);
    
    if (result.rows.length > 0) {
      console.log('\nSample updated products:');
      result.rows.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name} (${product.category})`);
        console.log(`    ${product.model_url}`);
      });
    }

    // Show summary by category
    const summary = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM products
      WHERE model_url LIKE '%glTF-Sample-Models%'
      GROUP BY category
      ORDER BY count DESC;
    `);

    console.log('\n📊 Models by category:');
    summary.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} products`);
    });

    await pool.end();
    console.log('\n✅ 3D model URLs fixed successfully!');
    console.log('\n💡 Note: Using placeholder GLB models from Khronos glTF samples.');
    console.log('   Replace with actual product models later via admin panel or S3 upload.');
  } catch (error) {
    console.error('❌ Error fixing 3D models:', error);
    process.exit(1);
  }
}

fix3DModels();
