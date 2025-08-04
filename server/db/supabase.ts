import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for database operations
export async function createTables() {
  try {
    console.log('🔄 Creating tables via Supabase...');
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(20),
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `
    });
    
    if (usersError) {
      console.log('ℹ️ Users table might already exist:', usersError.message);
    } else {
      console.log('✅ Users table created');
    }
    
    // Add more table creation as needed...
    
    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
} 