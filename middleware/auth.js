const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied',
      });
    }

    // Check if token starts with 'Bearer '
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;

    // Optional debug logging (enable with NODE_ENV=development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Decoded token:', { userId: decoded.userId, iat: decoded.iat, exp: decoded.exp });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token is not valid. Please log in again or check token format.',
    });
  }
};

// Warn if JWT_SECRET is not set (for production awareness)
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in .env. Using default secret "your-secret-key". This is insecure for production!');
}

module.exports = auth;