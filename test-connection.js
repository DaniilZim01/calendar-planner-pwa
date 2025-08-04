import 'dotenv/config';
import { Pool } from 'pg';

// Test with Transaction Pooler URL
const connectionString = "postgresql://postgres.doirvgumddwncxujbosb.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
  // Transaction Pooler configuration
  host: 'postgres.doirvgumddwncxujbosb.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'XJSiUpdcsYIdAEqZ',
  database: 'postgres',
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');
    
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current database time:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection(); 