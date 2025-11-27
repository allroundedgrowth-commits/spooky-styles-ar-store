import { pool } from '../config/database.js';

async function restoreProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🎃 Restoring products to database...');
    
    const products = [
      {
        name: 'Witch\'s Midnight Cascade',
        description: 'Long flowing black wig with purple highlights, perfect for any witch costume',
        price: 29.99,
        promotional_price: 24.99,
        category: 'Wigs',
        theme: 'witch',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-wig-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/witch-wig-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/witch-wig-01.jpg',
        stock_quantity: 50,
        is_accessory: false
      },
      {
        name: 'Zombie Decay Dreads',
        description: 'Matted dreadlock wig with realistic decay effects and blood stains',
        price: 34.99,
        promotional_price: null,
        category: 'Wigs',
        theme: 'zombie',
        thumbnail_url: 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg',
        stock_quantity: 35,
        is_accessory: false
      },
      {
        name: 'Vampire Crimson Elegance',
        description: 'Sleek black wig with blood-red streaks, styled in a sophisticated updo',
        price: 39.99,
        promotional_price: 32.99,
        category: 'Wigs',
        theme: 'vampire',
        thumbnail_url: 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg',
        stock_quantity: 42,
        is_accessory: false
      },
      {
        name: 'Skeleton Bone White',
        description: 'Pure white spiky wig that glows under blacklight',
        price: 27.99,
        promotional_price: null,
        category: 'Wigs',
        theme: 'skeleton',
        thumbnail_url: 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg',
        stock_quantity: 28,
        is_accessory: false
      },
      {
        name: 'Ghostly Ethereal Waves',
        description: 'Flowing white wig with translucent fiber for an otherworldly appearance',
        price: 31.99,
        promotional_price: 26.99,
        category: 'Wigs',
        theme: 'ghost',
        thumbnail_url: 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg',
        stock_quantity: 45,
        is_accessory: false
      },
      {
        name: 'Enchanted Forest Green',
        description: 'Deep green wig with leaf accents, perfect for forest witch costumes',
        price: 33.99,
        promotional_price: null,
        category: 'Wigs',
        theme: 'witch',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-wig-02.jpg',
        image_url: 'https://cdn.spookystyles.com/images/witch-wig-02.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/witch-wig-02.jpg',
        stock_quantity: 38,
        is_accessory: false
      },
      {
        name: 'Classic Witch Hat',
        description: 'Traditional pointed witch hat with buckle detail',
        price: 14.99,
        promotional_price: 11.99,
        category: 'Accessories',
        theme: 'witch',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-hat-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/witch-hat-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/witch-hat-01.jpg',
        stock_quantity: 75,
        is_accessory: true
      },
      {
        name: 'Vampire Fangs Deluxe',
        description: 'Custom-fit vampire fangs with realistic coloring',
        price: 9.99,
        promotional_price: null,
        category: 'Accessories',
        theme: 'vampire',
        thumbnail_url: 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg',
        stock_quantity: 100,
        is_accessory: true
      },
      {
        name: 'Zombie Brain Headband',
        description: 'Exposed brain headpiece with realistic texture and gore',
        price: 12.99,
        promotional_price: 9.99,
        category: 'Accessories',
        theme: 'zombie',
        thumbnail_url: 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg',
        stock_quantity: 55,
        is_accessory: true
      },
      {
        name: 'Skeleton Crown',
        description: 'Bone-white crown with skull motifs',
        price: 16.99,
        promotional_price: null,
        category: 'Accessories',
        theme: 'skeleton',
        thumbnail_url: 'https://cdn.spookystyles.com/images/skeleton-crown-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/skeleton-crown-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/skeleton-crown-01.jpg',
        stock_quantity: 40,
        is_accessory: true
      },
      {
        name: 'Ghostly Veil',
        description: 'Translucent flowing veil with ethereal shimmer',
        price: 13.99,
        promotional_price: 10.99,
        category: 'Accessories',
        theme: 'ghost',
        thumbnail_url: 'https://cdn.spookystyles.com/images/ghost-veil-01.jpg',
        image_url: 'https://cdn.spookystyles.com/images/ghost-veil-01.jpg',
        ar_image_url: 'https://cdn.spookystyles.com/images/ghost-veil-01.jpg',
        stock_quantity: 60,
        is_accessory: true
      }
    ];
    
    let added = 0;
    for (const product of products) {
      const result = await client.query(
        `INSERT INTO products (name, description, price, promotional_price, category, theme, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name`,
        [product.name, product.description, product.price, product.promotional_price, product.category, 
         product.theme, product.thumbnail_url, product.image_url, product.ar_image_url, product.stock_quantity, product.is_accessory]
      );
      console.log(`  ✅ Added: ${result.rows[0].name}`);
      added++;
    }
    
    console.log(`\n✅ Successfully restored ${added} products!`);
  } catch (error) {
    console.error('❌ Failed to restore products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

restoreProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
