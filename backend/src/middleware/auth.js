import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rescuedrone_super_secret_key_12345';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
