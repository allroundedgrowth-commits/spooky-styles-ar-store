// Complete database setup script
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'spooky_styles_db',
  user: 'spooky_user',
  password: 'spooky_pass',
});

async function completeSetup() {
  const client = await pool.connect();
  
  try {
    console.log('🎃 Starting complete database setup...\n');
    
    // 1. Seed products
    console.log('📦 Seeding products...');
    const products = [
      ['Witch\'s Midnight Cascade', 'Long flowing black wig with purple highlights', 29.99, 24.99, 'wigs', 'witch', 'https://cdn.spookystyles.com/models/witch-wig-01.glb', 'https://cdn.spookystyles.com/images/witch-wig-01.jpg', 'https://cdn.spookystyles.com/images/witch-wig-01.jpg', 'https://cdn.spookystyles.com/images/witch-wig-01-ar.jpg', 50, false],
      ['Zombie Decay Dreads', 'Matted dreadlock wig with realistic decay effects', 34.99, null, 'wigs', 'zombie', 'https://cdn.spookystyles.com/models/zombie-wig-01.glb', 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg', 'https://cdn.spookystyles.com/images/zombie-wig-01.jpg', 'https://cdn.spookystyles.com/images/zombie-wig-01-ar.jpg', 35, false],
      ['Vampire Crimson Elegance', 'Sleek black wig with blood-red streaks', 39.99, 32.99, 'wigs', 'vampire', 'https://cdn.spookystyles.com/models/vampire-wig-01.glb', 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg', 'https://cdn.spookystyles.com/images/vampire-wig-01.jpg', 'https://cdn.spookystyles.com/images/vampire-wig-01-ar.jpg', 42, false],
      ['Skeleton Bone White', 'Pure white spiky wig that glows under blacklight', 27.99, null, 'wigs', 'skeleton', 'https://cdn.spookystyles.com/models/skeleton-wig-01.glb', 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg', 'https://cdn.spookystyles.com/images/skeleton-wig-01.jpg', 'https://cdn.spookystyles.com/images/skeleton-wig-01-ar.jpg', 28, false],
      ['Ghostly Ethereal Waves', 'Flowing white wig with translucent fiber', 31.99, 26.99, 'wigs', 'ghost', 'https://cdn.spookystyles.com/models/ghost-wig-01.glb', 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg', 'https://cdn.spookystyles.com/images/ghost-wig-01.jpg', 'https://cdn.spookystyles.com/images/ghost-wig-01-ar.jpg', 45, false],
      ['Classic Witch Hat', 'Traditional pointed witch hat with buckle', 14.99, 11.99, 'accessories', 'witch', 'https://cdn.spookystyles.com/models/witch-hat-01.glb', 'https://cdn.spookystyles.com/images/witch-hat-01.jpg', 'https://cdn.spookystyles.com/images/witch-hat-01.jpg', 'https://cdn.spookystyles.com/images/witch-hat-01-ar.jpg', 75, true],
      ['Vampire Fangs Deluxe', 'Custom-fit vampire fangs with realistic coloring', 9.99, null, 'accessories', 'vampire', 'https://cdn.spookystyles.com/models/vampire-fangs-01.glb', 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg', 'https://cdn.spookystyles.com/images/vampire-fangs-01.jpg', 'https://cdn.spookystyles.com/images/vampire-fangs-01-ar.jpg', 100, true],
      ['Zombie Brain Headband', 'Exposed brain headpiece with realistic texture', 12.99, 9.99, 'accessories', 'zombie', 'https://cdn.spookystyles.com/models/zombie-brain-01.glb', 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg', 'https://cdn.spookystyles.com/images/zombie-brain-01.jpg', 'https://cdn.spookystyles.com/images/zombie-brain-01-ar.jpg', 55, true],
    ];
    
    for (const product of products) {
      await client.query(
        `INSERT INTO products (name, description, price, promotional_price, category, theme, model_url, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT DO NOTHING`,
        product
      );
    }
    console.log(`✅ Seeded ${products.length} products\n`);
    
    // 2. Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, is_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = $2,
         is_admin = $4,
         failed_login_attempts = 0,
         account_locked_until = NULL`,
      ['admin@spookystyles.com', hashedPassword, 'Admin User', true]
    );
    console.log('✅ Admin user created: admin@spookystyles.com / admin123\n');
    
    // 3. Create test user
    console.log('👤 Creating test user...');
    const testPassword = await bcrypt.hash('password123', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, is_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = $2,
         failed_login_attempts = 0,
         account_locked_until = NULL`,
      ['test@example.com', testPassword, 'Test User', false]
    );
    console.log('✅ Test user created: test@example.com / password123\n');
    
    // 4. Verify setup
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('📊 Database Status:');
    console.log(`   Products: ${productCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log('\n✅ Complete setup finished successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

completeSetup();
