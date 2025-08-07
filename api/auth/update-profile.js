import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only PUT method is allowed'
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

    const { name, phone } = req.body;

    // Валидация данных
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid name provided',
        error: 'Name must be at least 2 characters long'
      });
    }

    // Подготавливаем данные для обновления
    const updateData = {
      name: name.trim(),
      updated_at: new Date().toISOString()
    };

    // Добавляем телефон, если он предоставлен
    if (phone !== undefined) {
      if (phone && typeof phone === 'string' && phone.trim().length > 0) {
        updateData.phone = phone.trim();
      } else {
        updateData.phone = null; // Удаляем телефон, если передана пустая строка
      }
    }

    // Обновляем данные пользователя в Supabase
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.userId)
      .select('id, email, name, phone, email_verified, created_at, updated_at')
      .single();

    if (error) {
      console.error('Database update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: error.message
      });
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    // Возвращаем обновленный профиль
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          emailVerified: updatedUser.email_verified,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile endpoint error:', error);
    
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
