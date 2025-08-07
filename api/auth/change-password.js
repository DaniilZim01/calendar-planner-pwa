import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware.js';
import bcrypt from 'bcryptjs';

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

    const { currentPassword, newPassword } = req.body;

    // Валидация данных
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
        error: 'Missing required fields'
      });
    }

    // Проверяем сложность нового пароля
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
        error: 'Password too short'
      });
    }

    // Проверяем, что новый пароль содержит буквы и цифры
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least one lowercase letter, one uppercase letter, and one number',
        error: 'Password does not meet complexity requirements'
      });
    }

    // Получаем текущий хеш пароля пользователя
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'Invalid current password'
      });
    }

    // Хешируем новый пароль
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль в базе данных
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password',
        error: updateError.message
      });
    }

    // Возвращаем успешный ответ
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        message: 'Password has been updated'
      }
    });

  } catch (error) {
    console.error('Change password endpoint error:', error);
    
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
