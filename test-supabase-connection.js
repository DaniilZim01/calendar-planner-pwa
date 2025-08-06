import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Тестирование подключения к Supabase...');
    
    // Проверяем подключение через простой запрос
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Ошибка подключения:', error.message);
      
      // Проверяем, есть ли таблица users
      if (error.message.includes('relation "users" does not exist')) {
        console.log('📋 Таблица users не существует. Нужно запустить миграции.');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Подключение к Supabase успешно!');
    console.log('📊 Данные:', data);
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
    return false;
  }
}

testConnection(); 