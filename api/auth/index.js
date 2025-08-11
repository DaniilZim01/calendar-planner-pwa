import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../lib/auth-middleware.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export default async function handler(req, res) {
  const action = (req.query?.action || '').toString();

  if (req.method === 'POST' && action === 'login') return login(req, res);
  if (req.method === 'POST' && action === 'register') return register(req, res);
  if (req.method === 'POST' && action === 'refresh') return refresh(req, res);
  if (req.method === 'POST' && action === 'logout') return withAuth(req, res, logout);
  if (req.method === 'GET' && action === 'profile') return withAuth(req, res, getProfile);
  if (req.method === 'PUT' && action === 'update-profile') return withAuth(req, res, updateProfile);
  if (req.method === 'POST' && action === 'verify') return withAuth(req, res, verifyToken);
  if (req.method === 'PUT' && action === 'change-password') return withAuth(req, res, changePassword);

  return res.status(404).json({ success: false, message: 'Unknown auth action' });
}

async function withAuth(req, res, next) {
  try {
    await new Promise((resolve, reject) => authenticateToken(req, res, (e) => (e ? reject(e) : resolve())));
    return next(req, res);
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ success: false, message: error.message || 'Unauthorized' });
  }
}

async function register(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const { email, password, name, phone } = req.body || {};
  if (!email || !password || !name) return badRequest(res, 'Email, password, and name are required');

  const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
  if (existingUser) return res.status(409).json({ success: false, message: 'User with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ email, name, phone: phone || null, password_hash: passwordHash, email_verified: false })
    .select('id, email, name, phone, email_verified, created_at')
    .single();
  if (error) return serverError(res, 'Failed to create user');

  const tokens = issueTokens(newUser);
  return res.status(201).json({ success: true, message: 'User registered successfully', data: { user: apiUser(newUser), ...tokens } });
}

async function login(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const { email, password } = req.body || {};
  if (!email || !password) return badRequest(res, 'Email and password are required');

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, phone, password_hash, email_verified, created_at')
    .eq('email', email)
    .single();
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const tokens = issueTokens(user);
  return res.status(200).json({ success: true, message: 'Login successful', data: { user: apiUser(user), ...tokens } });
}

async function refresh(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  const { refreshToken } = req.body || {};
  if (!refreshToken) return badRequest(res, 'Refresh token required');
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const { data: user } = await supabase.from('users').select('id, email, name, phone, email_verified').eq('id', payload.userId).single();
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const tokens = issueTokens(user);
    return res.json({ success: true, message: 'Token refreshed', data: tokens });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

async function logout(_req, res) {
  return res.json({ success: true, message: 'Logout successful', data: { message: 'User logged out successfully' } });
}

async function getProfile(req, res) {
  const { data: user } = await supabase.from('users').select('id, email, name, phone, email_verified, created_at').eq('id', req.user.userId).single();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, phone: user.phone, emailVerified: user.email_verified } });
}

async function updateProfile(req, res) {
  const { name, phone } = req.body || {};
  const { data: updated, error } = await supabase
    .from('users')
    .update({ name, phone, updated_at: new Date().toISOString() })
    .eq('id', req.user.userId)
    .select('id, email, name, phone, email_verified, updated_at')
    .single();
  if (error) return serverError(res, 'Failed to update profile');
  return res.json({ success: true, message: 'Profile updated successfully', data: updated });
}

async function verifyToken(_req, res) {
  return res.json({ success: true, data: { valid: true } });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return badRequest(res, 'Both currentPassword and newPassword are required');
  const { data: user } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('id', req.user.userId)
    .single();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid current password' });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const { error } = await supabase.from('users').update({ password_hash: passwordHash, updated_at: new Date().toISOString() }).eq('id', req.user.userId);
  if (error) return serverError(res, 'Failed to change password');
  return res.json({ success: true, message: 'Password changed successfully' });
}

// Helpers
function issueTokens(user) {
  const accessToken = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function apiUser(u) { return { id: u.id, email: u.email, name: u.name, phone: u.phone, emailVerified: u.email_verified }; }
function methodNotAllowed(res) { return res.status(405).json({ success: false, message: 'Method not allowed' }); }
function badRequest(res, message) { return res.status(400).json({ success: false, message }); }
function serverError(res, message) { return res.status(500).json({ success: false, message }); }


