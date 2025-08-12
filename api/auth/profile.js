import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../../server/lib/auth.js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only GET or PUT method is allowed'
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

    if (req.method === 'GET') {
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
    }

    // PUT: обновление профиля и/или смена пароля
    const { name, phone, currentPassword, newPassword } = req.body || {};

    if (newPassword || currentPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
          error: 'Missing required fields'
        });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
          error: 'Password too short'
        });
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password must contain at least one lowercase letter, one uppercase letter, and one number',
          error: 'Password does not meet complexity requirements'
        });
      }

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
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          error: 'Invalid current password'
        });
      }
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      const { error: updatePwdError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
        .eq('id', req.user.userId);
      if (updatePwdError) {
        console.error('Password update error:', updatePwdError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update password',
          error: updatePwdError.message
        });
      }
    }

    const updateData = { updated_at: new Date().toISOString() };
    let shouldUpdate = false;
    if (typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
      shouldUpdate = true;
    }
    if (phone !== undefined) {
      updateData.phone = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : null;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      const { data: updatedUser, error: updErr } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.userId)
        .select('id, email, name, phone, email_verified, created_at, updated_at')
        .single();
      if (updErr) {
        console.error('Database update error:', updErr);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user profile',
          error: updErr.message
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          emailVerified: updatedUser.email_verified,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        } }
      });
    }

    return res.status(200).json({ success: true, message: 'No changes applied' });

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
