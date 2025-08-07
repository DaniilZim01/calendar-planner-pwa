import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';

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
    const { token } = req.body;

    // Проверяем наличие токена
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
        error: 'No token provided'
      });
    }

    // Проверяем токен
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          error: 'Token has expired'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        error: 'Token is not valid'
      });
    }

    // Проверяем, что пользователь существует в базе
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, email_verified, created_at, updated_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User does not exist'
      });
    }

    // Возвращаем информацию о токене и пользователе
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        token: {
          valid: true,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          issuedAt: new Date(decoded.iat * 1000).toISOString()
        },
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
    console.error('Token verification endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
