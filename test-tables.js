import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  try {
    console.log('🔄 Testing table access...');
    
    // Test users table
    console.log('\n📋 Testing users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log('Users count:', usersData?.length || 0);
    }
    
    // Test tasks table
    console.log('\n📋 Testing tasks table...');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.log('❌ Tasks table error:', tasksError.message);
    } else {
      console.log('✅ Tasks table accessible');
      console.log('Tasks count:', tasksData?.length || 0);
    }
    
    // Test events table
    console.log('\n📋 Testing events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('❌ Events table error:', eventsError.message);
    } else {
      console.log('✅ Events table accessible');
      console.log('Events count:', eventsData?.length || 0);
    }
    
    // Test periods table
    console.log('\n📋 Testing periods table...');
    const { data: periodsData, error: periodsError } = await supabase
      .from('periods')
      .select('*')
      .limit(1);
    
    if (periodsError) {
      console.log('❌ Periods table error:', periodsError.message);
    } else {
      console.log('✅ Periods table accessible');
      console.log('Periods count:', periodsData?.length || 0);
    }
    
    // Test wellbeing_data table
    console.log('\n📋 Testing wellbeing_data table...');
    const { data: wellbeingData, error: wellbeingError } = await supabase
      .from('wellbeing_data')
      .select('*')
      .limit(1);
    
    if (wellbeingError) {
      console.log('❌ Wellbeing_data table error:', wellbeingError.message);
    } else {
      console.log('✅ Wellbeing_data table accessible');
      console.log('Wellbeing records count:', wellbeingData?.length || 0);
    }
    
    console.log('\n🎉 All table tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTables(); 