const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  let { statusCode = 500, message, code = 'INTERNAL_ERROR' } = err;

  // Postgres unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with this value already exists';
    code = 'DUPLICATE_ENTRY';
  }
  // Postgres foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
    code = 'FOREIGN_KEY_VIOLATION';
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log only server-side errors
  if (statusCode >= 500) {
    logger.error('Server error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
