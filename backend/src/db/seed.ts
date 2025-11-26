import { pool } from '../config/database.js';

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🎃 Starting database seeding...');
    
    // Seed products
    console.log('  Seeding products...');
    const products = [
      // Wigs
      {
        name: 'Witch\'s Midnight Cascade',
        description: 'Long flowing black wig with purple highlights, perfect for any witch costume',
        price: 29.99,
        promotional_price: 24.99,
        category: 'wigs',
        theme: 'witch',
        model_url: 'https://cdn.spookystyles.com/models/witch-wig-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-wig-01.jpg',
        stock_quantity: 50,
        is_accessory: false
      },
      {
        name: 'Zombie Decay Dreads',
        description: 'Matted dreadlock wig with realistic decay effects and blood stains',
        price: 34.99,
        promotional_price: null,
        category: 'wigs',
        theme: 'zombie',
        model_url: 'https://cdn.spookystyles.com/models/zombie-wig-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg',
        stock_quantity: 35,
        is_accessory: false
      },
      {
        name: 'Vampire Crimson Elegance',
        description: 'Sleek black wig with blood-red streaks, styled in a sophisticated updo',
        price: 39.99,
        promotional_price: 32.99,
        category: 'wigs',
        theme: 'vampire',
        model_url: 'https://cdn.spookystyles.com/models/vampire-wig-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg',
        stock_quantity: 42,
        is_accessory: false
      },
      {
        name: 'Skeleton Bone White',
        description: 'Pure white spiky wig that glows under blacklight',
        price: 27.99,
        promotional_price: null,
        category: 'wigs',
        theme: 'skeleton',
        model_url: 'https://cdn.spookystyles.com/models/skeleton-wig-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg',
        stock_quantity: 28,
        is_accessory: false
      },
      {
        name: 'Ghostly Ethereal Waves',
        description: 'Flowing white wig with translucent fiber for an otherworldly appearance',
        price: 31.99,
        promotional_price: 26.99,
        category: 'wigs',
        theme: 'ghost',
        model_url: 'https://cdn.spookystyles.com/models/ghost-wig-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg',
        stock_quantity: 45,
        is_accessory: false
      },
      {
        name: 'Enchanted Forest Green',
        description: 'Deep green wig with leaf accents, perfect for forest witch costumes',
        price: 33.99,
        promotional_price: null,
        category: 'wigs',
        theme: 'witch',
        model_url: 'https://cdn.spookystyles.com/models/witch-wig-02.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-wig-02.jpg',
        stock_quantity: 38,
        is_accessory: false
      },
      // Accessories
      {
        name: 'Classic Witch Hat',
        description: 'Traditional pointed witch hat with buckle detail',
        price: 14.99,
        promotional_price: 11.99,
        category: 'accessories',
        theme: 'witch',
        model_url: 'https://cdn.spookystyles.com/models/witch-hat-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/witch-hat-01.jpg',
        stock_quantity: 75,
        is_accessory: true
      },
      {
        name: 'Vampire Fangs Deluxe',
        description: 'Custom-fit vampire fangs with realistic coloring',
        price: 9.99,
        promotional_price: null,
        category: 'accessories',
        theme: 'vampire',
        model_url: 'https://cdn.spookystyles.com/models/vampire-fangs-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg',
        stock_quantity: 100,
        is_accessory: true
      },
      {
        name: 'Zombie Brain Headband',
        description: 'Exposed brain headpiece with realistic texture and gore',
        price: 12.99,
        promotional_price: 9.99,
        category: 'accessories',
        theme: 'zombie',
        model_url: 'https://cdn.spookystyles.com/models/zombie-brain-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg',
        stock_quantity: 55,
        is_accessory: true
      },
      {
        name: 'Skeleton Crown',
        description: 'Bone-white crown with skull motifs',
        price: 16.99,
        promotional_price: null,
        category: 'accessories',
        theme: 'skeleton',
        model_url: 'https://cdn.spookystyles.com/models/skeleton-crown-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/skeleton-crown-01.jpg',
        stock_quantity: 40,
        is_accessory: true
      },
      {
        name: 'Ghostly Veil',
        description: 'Translucent flowing veil with ethereal shimmer',
        price: 13.99,
        promotional_price: 10.99,
        category: 'accessories',
        theme: 'ghost',
        model_url: 'https://cdn.spookystyles.com/models/ghost-veil-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/ghost-veil-01.jpg',
        stock_quantity: 60,
        is_accessory: true
      },
      {
        name: 'Bat Wing Ears',
        description: 'Pointed bat ears with realistic membrane texture',
        price: 8.99,
        promotional_price: null,
        category: 'accessories',
        theme: 'vampire',
        model_url: 'https://cdn.spookystyles.com/models/bat-ears-01.glb',
        thumbnail_url: 'https://cdn.spookystyles.com/images/bat-ears-01.jpg',
        stock_quantity: 85,
        is_accessory: true
      }
    ];
    
    const productIds: string[] = [];
    for (const product of products) {
      const result = await client.query(
        `INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, stock_quantity, is_accessory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [product.name, product.description, product.price, product.promotional_price, product.category, 
         product.theme, product.model_url, product.thumbnail_url, product.stock_quantity, product.is_accessory]
      );
      productIds.push(result.rows[0].id);
    }
    console.log(`  ✅ Seeded ${products.length} products`);
    
    // Seed product colors
    console.log('  Seeding product colors...');
    const colors = [
      // Witch's Midnight Cascade colors
      { productIndex: 0, colorName: 'Midnight Black', colorHex: '#1a1a1a' },
      { productIndex: 0, colorName: 'Purple Haze', colorHex: '#6a0dad' },
      { productIndex: 0, colorName: 'Deep Violet', colorHex: '#4b0082' },
      { productIndex: 0, colorName: 'Raven Black', colorHex: '#000000' },
      { productIndex: 0, colorName: 'Twilight Purple', colorHex: '#8b00ff' },
      // Zombie Decay Dreads colors
      { productIndex: 1, colorName: 'Decay Green', colorHex: '#556b2f' },
      { productIndex: 1, colorName: 'Rotting Brown', colorHex: '#654321' },
      { productIndex: 1, colorName: 'Moldy Gray', colorHex: '#696969' },
      { productIndex: 1, colorName: 'Corpse Gray', colorHex: '#808080' },
      { productIndex: 1, colorName: 'Toxic Green', colorHex: '#39ff14' },
      // Vampire Crimson Elegance colors
      { productIndex: 2, colorName: 'Blood Red', colorHex: '#8b0000' },
      { productIndex: 2, colorName: 'Crimson Night', colorHex: '#dc143c' },
      { productIndex: 2, colorName: 'Burgundy', colorHex: '#800020' },
      { productIndex: 2, colorName: 'Ruby Red', colorHex: '#e0115f' },
      { productIndex: 2, colorName: 'Wine Red', colorHex: '#722f37' },
      // Skeleton Bone White colors
      { productIndex: 3, colorName: 'Bone White', colorHex: '#f9f6ee' },
      { productIndex: 3, colorName: 'Ivory', colorHex: '#fffff0' },
      { productIndex: 3, colorName: 'Aged Bone', colorHex: '#e8e4c9' },
      { productIndex: 3, colorName: 'Pearl White', colorHex: '#fefefa' },
      { productIndex: 3, colorName: 'Bleached', colorHex: '#ffffff' },
      // Ghostly Ethereal Waves colors
      { productIndex: 4, colorName: 'Spirit White', colorHex: '#f8f8ff' },
      { productIndex: 4, colorName: 'Phantom Gray', colorHex: '#d3d3d3' },
      { productIndex: 4, colorName: 'Misty Blue', colorHex: '#e0ffff' },
      { productIndex: 4, colorName: 'Spectral Silver', colorHex: '#c0c0c0' },
      { productIndex: 4, colorName: 'Moonlight', colorHex: '#f0f8ff' },
      // Enchanted Forest Green colors
      { productIndex: 5, colorName: 'Forest Green', colorHex: '#228b22' },
      { productIndex: 5, colorName: 'Emerald', colorHex: '#50c878' },
      { productIndex: 5, colorName: 'Moss Green', colorHex: '#8a9a5b' },
      { productIndex: 5, colorName: 'Dark Green', colorHex: '#013220' },
      { productIndex: 5, colorName: 'Jade', colorHex: '#00a86b' }
    ];
    
    for (const color of colors) {
      await client.query(
        `INSERT INTO product_colors (product_id, color_name, color_hex)
         VALUES ($1, $2, $3)`,
        [productIds[color.productIndex], color.colorName, color.colorHex]
      );
    }
    console.log(`  ✅ Seeded ${colors.length} product colors`);
    
    // Seed costume inspirations
    console.log('  Seeding costume inspirations...');
    const inspirations = [
      {
        name: 'Classic Witch Ensemble',
        description: 'Complete witch look with flowing black hair and iconic pointed hat',
        image_url: 'https://cdn.spookystyles.com/inspirations/witch-classic.jpg',
        products: [0, 6] // Witch's Midnight Cascade + Classic Witch Hat
      },
      {
        name: 'Elegant Vampire',
        description: 'Sophisticated vampire style with crimson hair and fangs',
        image_url: 'https://cdn.spookystyles.com/inspirations/vampire-elegant.jpg',
        products: [2, 7, 11] // Vampire Crimson Elegance + Vampire Fangs + Bat Wing Ears
      },
      {
        name: 'Undead Horror',
        description: 'Terrifying zombie look with decay dreads and exposed brain',
        image_url: 'https://cdn.spookystyles.com/inspirations/zombie-horror.jpg',
        products: [1, 8] // Zombie Decay Dreads + Zombie Brain Headband
      },
      {
        name: 'Skeleton Queen',
        description: 'Regal skeleton costume with bone white hair and crown',
        image_url: 'https://cdn.spookystyles.com/inspirations/skeleton-queen.jpg',
        products: [3, 9] // Skeleton Bone White + Skeleton Crown
      },
      {
        name: 'Ethereal Spirit',
        description: 'Ghostly appearance with flowing white hair and translucent veil',
        image_url: 'https://cdn.spookystyles.com/inspirations/ghost-ethereal.jpg',
        products: [4, 10] // Ghostly Ethereal Waves + Ghostly Veil
      },
      {
        name: 'Forest Enchantress',
        description: 'Nature witch with green hair and classic witch hat',
        image_url: 'https://cdn.spookystyles.com/inspirations/witch-forest.jpg',
        products: [5, 6] // Enchanted Forest Green + Classic Witch Hat
      },
      {
        name: 'Gothic Vampire Lord',
        description: 'Dark vampire aesthetic with black hair, fangs, and bat ears',
        image_url: 'https://cdn.spookystyles.com/inspirations/vampire-gothic.jpg',
        products: [0, 7, 11] // Witch's Midnight Cascade (black) + Vampire Fangs + Bat Wing Ears
      },
      {
        name: 'Spectral Bride',
        description: 'Haunting bridal ghost with ethereal waves and veil',
        image_url: 'https://cdn.spookystyles.com/inspirations/ghost-bride.jpg',
        products: [4, 10] // Ghostly Ethereal Waves + Ghostly Veil
      },
      {
        name: 'Bone Witch',
        description: 'Skeletal witch combining bone white hair with witch hat',
        image_url: 'https://cdn.spookystyles.com/inspirations/witch-skeleton.jpg',
        products: [3, 6] // Skeleton Bone White + Classic Witch Hat
      },
      {
        name: 'Zombie Royalty',
        description: 'Undead monarch with decay dreads and skeleton crown',
        image_url: 'https://cdn.spookystyles.com/inspirations/zombie-royal.jpg',
        products: [1, 9] // Zombie Decay Dreads + Skeleton Crown
      },
      {
        name: 'Crimson Witch',
        description: 'Blood magic witch with vampire-inspired crimson hair and hat',
        image_url: 'https://cdn.spookystyles.com/inspirations/witch-crimson.jpg',
        products: [2, 6] // Vampire Crimson Elegance + Classic Witch Hat
      },
      {
        name: 'Vampire Phantom',
        description: 'Ghostly vampire with ethereal hair, fangs, and veil',
        image_url: 'https://cdn.spookystyles.com/inspirations/vampire-phantom.jpg',
        products: [4, 7, 10] // Ghostly Ethereal Waves + Vampire Fangs + Ghostly Veil
      }
    ];
    
    for (const inspiration of inspirations) {
      const result = await client.query(
        `INSERT INTO costume_inspirations (name, description, image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [inspiration.name, inspiration.description, inspiration.image_url]
      );
      const inspirationId = result.rows[0].id;
      
      // Add products to inspiration
      for (let i = 0; i < inspiration.products.length; i++) {
        await client.query(
          `INSERT INTO costume_inspiration_products (inspiration_id, product_id, display_order)
           VALUES ($1, $2, $3)`,
          [inspirationId, productIds[inspiration.products[i]], i + 1]
        );
      }
    }
    console.log(`  ✅ Seeded ${inspirations.length} costume inspirations`);
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎃 Database seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });
}

export default seedDatabase;
