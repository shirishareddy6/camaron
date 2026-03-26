const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { query } = require('../config/database');

const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401, 'UNAUTHENTICATED');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Verify user still exists and is active
  const { rows } = await query(
    'SELECT id, role, phone, is_active FROM users WHERE id = $1',
    [decoded.sub]
  );
  if (!rows.length || !rows[0].is_active) {
    throw new AppError('User not found or deactivated', 401, 'UNAUTHENTICATED');
  }

  req.user = rows[0];
  next();
};

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  }
  next();
};

module.exports = { authenticate, authorize };
