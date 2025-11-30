/**
 * Quick script to seed products into Supabase database
 * Run with: node seed-products-quick.js
 */

const https = require('https');

const SUPABASE_URL = 'https://yreqvwoiuykxfxxgdusw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZXF2d29pdXlreGZ4eGdkdXN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODE3Mjk3OSwiZXhwIjoyMDUzNzQ4OTc5fQ.kd7WDolvigdZ9iDIilID0g_7mPgU6-8';

const products = [
  {
    name: 'Witch\'s Midnight Wig',
    description: 'Long flowing black wig perfect for witch costumes',
    price: 29.99,
    category: 'Costume',
    theme: 'Halloween',
    thumbnail_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    ar_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    stock_quantity: 50,
    is_accessory: false
  },
  {
    name: 'Vampire Red Wig',
    description: 'Deep red wig with gothic styling',
    price: 34.99,
    category: 'Costume',
    theme: 'Halloween',
    thumbnail_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    ar_image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    stock_quantity: 30,
    is_accessory: false
  },
  {
    name: 'Zombie Green Wig',
    description: 'Messy green wig for zombie costumes',
    price: 24.99,
    category: 'Costume',
    theme: 'Halloween',
    thumbnail_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
    ar_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
    stock_quantity: 40,
    is_accessory: false
  },
  {
    name: 'Professional Bob - Black',
    description: 'Sleek professional bob wig in black',
    price: 49.99,
    category: 'Professional',
    theme: 'Everyday',
    thumbnail_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
    ar_image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
    stock_quantity: 25,
    is_accessory: false
  },
  {
    name: 'Casual Waves - Brown',
    description: 'Natural looking wavy brown wig',
    price: 39.99,
    category: 'Casual',
    theme: 'Everyday',
    thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    ar_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    stock_quantity: 35,
    is_accessory: false
  }
];

async function seedProducts() {
  console.log('🎃 Seeding products to Supabase...\n');

  for (const product of products) {
    try {
      const data = JSON.stringify(product);
      
      const options = {
        hostname: 'yreqvwoiuykxfxxgdusw.supabase.co',
        port: 443,
        path: '/rest/v1/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 201) {
              console.log(`✅ Created: ${product.name}`);
              resolve();
            } else {
              console.log(`⚠️  ${product.name}: ${res.statusCode} - ${responseData}`);
              resolve(); // Continue even if one fails
            }
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Error creating ${product.name}:`, error.message);
          resolve(); // Continue even if one fails
        });

        req.write(data);
        req.end();
      });

    } catch (error) {
      console.error(`❌ Failed to create ${product.name}:`, error.message);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nTest the API:');
  console.log('curl http://localhost:3000/api/products');
}

seedProducts();
