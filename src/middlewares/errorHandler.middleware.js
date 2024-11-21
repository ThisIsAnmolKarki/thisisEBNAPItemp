// src/middlewares/errorHandler.middleware.js

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Handle Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
  
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference: The referenced record does not exist',
        field: err.fields
      });
    }
  
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry',
        field: err.fields
      });
    }
  
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
  
    // Handle custom business errors
    if (err.name === 'BusinessError') {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message
      });
    }
  
    // Handle rate limit errors
    if (err.name === 'RateLimitError') {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
  
    // Default error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    });
  };
  
  // Custom error class for business-related errors
  export class BusinessError extends Error {
    constructor(message, statusCode = 400) {
      super(message);
      this.name = 'BusinessError';
      this.statusCode = statusCode;
    }
  }