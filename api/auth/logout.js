import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../../server/lib/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is allowed'
    });
  }

  try {
    // Проверяем аутентификацию
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Здесь можно добавить логику для инвалидации токенов
    // Например, добавить токен в черный список или обновить время последнего выхода

    // Обновляем время последнего выхода пользователя
    const { error } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', req.user.userId);

    if (error) {
      console.error('Database update error:', error);
      // Не возвращаем ошибку, так как logout должен работать даже при проблемах с БД
    }

    // Возвращаем успешный ответ
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        message: 'User logged out successfully'
      }
    });

  } catch (error) {
    console.error('Logout endpoint error:', error);
    
    // Если ошибка аутентификации, возвращаем соответствующий статус
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        error: error.error
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
