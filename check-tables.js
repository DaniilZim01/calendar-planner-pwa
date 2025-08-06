import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['users', 'tasks', 'user_tasks', 'periods', 'events', 'wellbeing_data'];
  
  console.log('🔍 Проверка таблиц в Supabase...\n');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Таблица "${table}": ${error.message}`);
      } else {
        console.log(`✅ Таблица "${table}": существует (записей: ${data[0]?.count || 0})`);
      }
    } catch (error) {
      console.log(`❌ Таблица "${table}": ${error.message}`);
    }
  }
  
  console.log('\n📋 Проверка завершена!');
}

checkTables(); 