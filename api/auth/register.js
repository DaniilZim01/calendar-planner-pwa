import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase env not configured: SUPABASE_URL and SUPABASE_ANON_KEY/SERVICE_ROLE_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not configured');
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { login, email, password, name, phone } = req.body;

    // Basic validation
    if (!login || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Login, password, and name are required'
      });
    }

    // Check if login already exists
    const { data: existingLogin } = await supabase
      .from('users')
      .select('id')
      .eq('login', login)
      .maybeSingle();

    if (existingLogin) {
      return res.status(409).json({ success: false, message: 'Login already taken' });
    }

    // If email provided, check uniqueness
    let existingUser = null;
    if (email) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      existingUser = data;
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        login,
        email: email || null,
        name,
        phone: phone || null,
        password_hash: passwordHash,
        email_verified: false
      })
      .select('id, login, email, name, phone, email_verified, created_at')
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          login: newUser.login,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          emailVerified: newUser.email_verified
        },
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
} 