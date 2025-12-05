// Debug cart issue - check database directly
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db'
});

async function debugCart() {
  try {
    console.log('Checking cart tables...\n');

    // Check all carts
    const carts = await pool.query('SELECT * FROM carts ORDER BY updated_at DESC');
    console.log(`Found ${carts.rows.length} carts:`);
    carts.rows.forEach((cart, i) => {
      console.log(`  ${i + 1}. Cart ID: ${cart.id}`);
      console.log(`     User ID: ${cart.user_id || 'NULL (guest)'}`);
      console.log(`     Session ID: ${cart.session_id || 'NULL'}`);
      console.log(`     Updated: ${cart.updated_at}`);
    });
    console.log('');

    // Check all cart items
    const items = await pool.query(`
      SELECT ci.*, p.name as product_name 
      FROM cart_items ci 
      LEFT JOIN products p ON ci.product_id = p.id 
      ORDER BY ci.updated_at DESC
    `);
    console.log(`Found ${items.rows.length} cart items:`);
    items.rows.forEach((item, i) => {
      console.log(`  ${i + 1}. Cart ID: ${item.cart_id}`);
      console.log(`     Product: ${item.product_name} (${item.product_id})`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Customizations: ${JSON.stringify(item.customizations)}`);
      console.log(`     Updated: ${item.updated_at}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

debugCart();
