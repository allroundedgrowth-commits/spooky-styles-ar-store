// Quick diagnostic to check your actual database setup
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSetup() {
  console.log('\n🔍 Checking Your Setup...\n');
  
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Using Supabase?:', process.env.DATABASE_URL?.includes('supabase') ? 'YES' : 'NO');
  console.log('Using localhost?:', process.env.DATABASE_URL?.includes('localhost') ? 'YES' : 'NO');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Check if RLS is enabled
    const rlsCheck = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'products';
    `);
    
    console.log('\n📊 Products Table RLS Status:');
    console.log('RLS Enabled:', rlsCheck.rows[0]?.rowsecurity ? 'YES ❌' : 'NO ✅');
    
    // Check products
    const products = await pool.query('SELECT id, name FROM products LIMIT 3');
    console.log('\n📦 Products in Database:', products.rows.length);
    products.rows.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    
    // Check S3 config
    console.log('\n☁️  S3 Configuration:');
    console.log('Bucket:', process.env.S3_BUCKET_NAME || 'NOT SET');
    console.log('Region:', process.env.AWS_REGION || 'NOT SET');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSetup();
