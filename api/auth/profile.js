import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only GET method is allowed'
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

    // Получаем данные пользователя из Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, email_verified, created_at, updated_at')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: error.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    // Возвращаем профиль пользователя
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Profile endpoint error:', error);
    
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
