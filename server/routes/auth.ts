import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
} from '../controllers/authController';
import { authenticateToken, authRateLimit } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/refresh', refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router; 