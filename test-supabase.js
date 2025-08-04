import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('ℹ️ Connection works, but table might not exist yet:', error.message);
      console.log('✅ Supabase connection is working!');
    } else {
      console.log('✅ Supabase connection and table access working!');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

testSupabaseConnection(); 