import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate user using JWT token
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    // Verify user still exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId)
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Add user to request object
    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.userId)
        });
        
        if (user) {
          req.user = payload;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue even if auth fails
  }
}

/**
 * Middleware to check if user has required role (for future use)
 */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // For now, all authenticated users have the same permissions
    // In the future, you can add role-based access control here
    next();
  };
}

/**
 * Middleware to check if user owns the resource
 */
export function requireOwnership(resourceUserId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'Access denied - you can only access your own resources',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting middleware for auth endpoints
 */
export function authRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Simple rate limiting - in production, use a proper rate limiting library
  // like express-rate-limit or redis-based rate limiting
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Store rate limit data in memory (not suitable for production with multiple instances)
  if (!global.authRateLimit) {
    global.authRateLimit = new Map();
  }

  const rateLimitData = global.authRateLimit.get(clientIP);
  
  if (rateLimitData) {
    const { count, resetTime } = rateLimitData;
    
    if (now > resetTime) {
      // Reset rate limit
      global.authRateLimit.set(clientIP, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 minutes
    } else if (count >= 5) { // 5 attempts per 15 minutes
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    } else {
      global.authRateLimit.set(clientIP, { count: count + 1, resetTime });
    }
  } else {
    global.authRateLimit.set(clientIP, { count: 1, resetTime: now + 15 * 60 * 1000 });
  }

  next();
}

// Extend global namespace for rate limiting
declare global {
  var authRateLimit: Map<string, { count: number; resetTime: number }> | undefined;
} 