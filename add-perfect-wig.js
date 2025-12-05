/**
 * Add a sample wig product with proper transparent AR image
 * 
 * This script demonstrates how to create a wig product that works perfectly
 * with the 2D AR try-on system.
 * 
 * Usage:
 *   node add-perfect-wig.js
 *   node add-perfect-wig.js "https://your-cdn.com/wig-transparent.png"
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;

// Database connection - local PostgreSQL
const DATABASE_URL = 'postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db';

console.log('Connecting to LOCAL database:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Sample transparent wig images (free to use for testing)
const SAMPLE_IMAGES = {
  purple: 'https://www.pngarts.com/files/3/Purple-Hair-PNG-Image.png',
  black: 'https://www.pngarts.com/files/3/Black-Hair-PNG-Image.png',
  blonde: 'https://www.pngarts.com/files/3/Blonde-Hair-PNG-Image.png',
  red: 'https://www.pngarts.com/files/3/Red-Hair-PNG-Image.png',
};

async function addPerfectWig(arImageUrl) {
  const client = await pool.connect();
  
  try {
    console.log('🎃 Adding perfect wig product...\n');
    
    // Determine wig color from URL or use default
    let wigName = 'Perfect Fit Purple Wig';
    let wigColor = 'purple';
    let colors = [
      { name: 'Deep Purple', hex: '#8b5cf6' },
      { name: 'Violet Dream', hex: '#a78bfa' },
      { name: 'Royal Purple', hex: '#7c3aed' },
      { name: 'Lavender Mist', hex: '#c4b5fd' },
      { name: 'Dark Plum', hex: '#6d28d9' },
    ];
    
    if (arImageUrl.includes('Black') || arImageUrl.includes('black')) {
      wigName = 'Perfect Fit Black Wig';
      wigColor = 'black';
      colors = [
        { name: 'Jet Black', hex: '#000000' },
        { name: 'Midnight Black', hex: '#1a1a1a' },
        { name: 'Raven Black', hex: '#0a0a0a' },
        { name: 'Charcoal', hex: '#36454f' },
        { name: 'Onyx', hex: '#353839' },
      ];
    } else if (arImageUrl.includes('Blonde') || arImageUrl.includes('blonde')) {
      wigName = 'Perfect Fit Blonde Wig';
      wigColor = 'blonde';
      colors = [
        { name: 'Platinum Blonde', hex: '#f5f5dc' },
        { name: 'Golden Blonde', hex: '#ffd700' },
        { name: 'Honey Blonde', hex: '#e9b872' },
        { name: 'Ash Blonde', hex: '#b9b5a8' },
        { name: 'Strawberry Blonde', hex: '#ff9966' },
      ];
    } else if (arImageUrl.includes('Red') || arImageUrl.includes('red')) {
      wigName = 'Perfect Fit Red Wig';
      wigColor = 'red';
      colors = [
        { name: 'Crimson Red', hex: '#dc143c' },
        { name: 'Auburn', hex: '#a52a2a' },
        { name: 'Cherry Red', hex: '#de3163' },
        { name: 'Burgundy', hex: '#800020' },
        { name: 'Copper Red', hex: '#b87333' },
      ];
    }
    
    // Insert product
    const productResult = await client.query(
      `INSERT INTO products (
        name,
        description,
        price,
        promotional_price,
        category,
        theme,
        model_url,
        thumbnail_url,
        image_url,
        ar_image_url,
        stock_quantity,
        is_accessory
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, name, ar_image_url`,
      [
        wigName,
        `Long flowing ${wigColor} wig with natural waves. Professionally photographed with transparent background for perfect AR try-on experience. High-quality synthetic fibers that look and feel natural.`,
        34.99,
        29.99,
        'wigs',
        'witch',
        null, // No 3D model needed for 2D AR
        `https://via.placeholder.com/400x400/8b5cf6/ffffff?text=${wigColor}+Wig`,
        `https://via.placeholder.com/800x800/8b5cf6/ffffff?text=${wigColor}+Wig+Detail`,
        arImageUrl,
        50,
        false,
      ]
    );
    
    const productId = productResult.rows[0].id;
    console.log('✅ Product created:');
    console.log(`   ID: ${productId}`);
    console.log(`   Name: ${wigName}`);
    console.log(`   AR Image: ${arImageUrl}\n`);
    
    // Add color variations
    console.log('Adding color variations...');
    for (const color of colors) {
      await client.query(
        `INSERT INTO product_colors (product_id, color_name, color_hex)
         VALUES ($1, $2, $3)`,
        [productId, color.name, color.hex]
      );
    }
    console.log(`✅ Added ${colors.length} color variations\n`);
    
    // Verify product
    const verifyResult = await client.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.promotional_price,
        p.ar_image_url,
        COUNT(pc.id) as color_count
       FROM products p
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [productId]
    );
    
    const product = verifyResult.rows[0];
    console.log('📦 Product Summary:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Price: $${product.price} (Sale: $${product.promotional_price})`);
    console.log(`   Colors: ${product.color_count}`);
    console.log(`   AR Image: ${product.ar_image_url}\n`);
    
    console.log('🎉 Perfect wig product added successfully!\n');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3000/products to see the product');
    console.log('2. Click "Try On" to test the AR experience');
    console.log('3. If the wig doesn\'t fit well, check CREATE_PERFECT_WIG_PRODUCT.md');
    console.log('4. Replace with your own transparent PNG for production\n');
    
    return productId;
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    // Get AR image URL from command line or use default
    const arImageUrl = process.argv[2] || SAMPLE_IMAGES.purple;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Creating Perfect Wig Product for 2D AR Try-On');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (!process.argv[2]) {
      console.log('ℹ️  Using sample transparent PNG image');
      console.log('   To use your own image, run:');
      console.log('   node add-perfect-wig.js "https://your-cdn.com/wig.png"\n');
      console.log('Available sample images:');
      Object.entries(SAMPLE_IMAGES).forEach(([color, url]) => {
        console.log(`   ${color}: ${url}`);
      });
      console.log('');
    }
    
    await addPerfectWig(arImageUrl);
    
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to add product:', error.message);
    process.exit(1);
  }
}

main();
