import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDeleteComprehensive() {
  console.log('\n🔍 COMPREHENSIVE DELETE TEST\n');
  console.log('=' .repeat(60));

  try {
    // 1. Check database connection
    console.log('\n1️⃣  Testing database connection...');
    const connTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', connTest.rows[0].now);

    // 2. Check RLS status
    console.log('\n2️⃣  Checking RLS status...');
    const rlsCheck = await pool.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'products'
    `);
    console.log('RLS Enabled:', rlsCheck.rows[0].relrowsecurity ? '❌ YES (PROBLEM!)' : '✅ NO');

    // 3. List all products
    console.log('\n3️⃣  Current products in database:');
    const productsResult = await pool.query('SELECT id, name FROM products ORDER BY name');
    console.log(`Found ${productsResult.rows.length} products:`);
    productsResult.rows.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.id})`);
    });

    if (productsResult.rows.length === 0) {
      console.log('\n⚠️  No products to test delete with!');
      return;
    }

    // 4. Check foreign key constraints
    console.log('\n4️⃣  Checking foreign key constraints...');
    const fkCheck = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'products'
    `);
    
    console.log('Foreign keys pointing to products:');
    if (fkCheck.rows.length === 0) {
      console.log('   ✅ No foreign keys found');
    } else {
      fkCheck.rows.forEach(fk => {
        console.log(`   - ${fk.table_name}.${fk.column_name} -> products.${fk.foreign_column_name} (ON DELETE ${fk.delete_rule})`);
      });
    }

    // 5. Check for related records
    const testProductId = productsResult.rows[0].id;
    console.log(`\n5️⃣  Checking related records for product: ${testProductId}`);
    
    const relatedChecks = [
      { table: 'product_colors', column: 'product_id' },
      { table: 'cart_items', column: 'product_id' },
      { table: 'order_items', column: 'product_id' },
    ];

    for (const check of relatedChecks) {
      try {
        const result = await pool.query(
          `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} = $1`,
          [testProductId]
        );
        console.log(`   ${check.table}: ${result.rows[0].count} records`);
      } catch (err) {
        console.log(`   ${check.table}: ⚠️  Table might not exist`);
      }
    }

    // 6. Test direct DELETE query
    console.log(`\n6️⃣  Testing direct DELETE query...`);
    console.log(`   Attempting to delete product: ${testProductId}`);
    
    try {
      const deleteResult = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING id, name',
        [testProductId]
      );
      
      if (deleteResult.rowCount > 0) {
        console.log(`   ✅ DELETE successful!`);
        console.log(`   Deleted: ${deleteResult.rows[0].name} (${deleteResult.rows[0].id})`);
        
        // Verify deletion
        const verifyResult = await pool.query(
          'SELECT id FROM products WHERE id = $1',
          [testProductId]
        );
        
        if (verifyResult.rows.length === 0) {
          console.log(`   ✅ Verified: Product no longer exists in database`);
        } else {
          console.log(`   ❌ ERROR: Product still exists after delete!`);
        }
      } else {
        console.log(`   ❌ DELETE returned 0 rows affected`);
      }
    } catch (deleteError) {
      console.log(`   ❌ DELETE failed with error:`);
      console.log(`   Error: ${deleteError.message}`);
      console.log(`   Code: ${deleteError.code}`);
      console.log(`   Detail: ${deleteError.detail}`);
    }

    // 7. Final product count
    console.log('\n7️⃣  Final product count:');
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`   Products remaining: ${finalCount.rows[0].count}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n' + '='.repeat(60));
    console.log('Test complete\n');
  }
}

testDeleteComprehensive();
