import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';

export function authenticateToken(req, res, next) {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'No token provided'
    });
  }

  try {
    // Проверяем JWT токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем данные пользователя в request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    
    next();
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
}

// Middleware для проверки роли (для будущего использования)
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Здесь можно добавить проверку роли пользователя
    // Пока просто пропускаем
    next();
  };
}
