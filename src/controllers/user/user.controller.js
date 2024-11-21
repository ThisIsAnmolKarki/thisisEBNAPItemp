// src/controllers/users/user.controller.js

import { createUserService } from "../../services/user/user.service.js"
export const createUser = async (req, res) => {
    try {
      const validRoles = ['user', 'admin', 'moderator'];
      const { role, password, username } = req.body;
  
      // Validate role
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Please use one of: ${validRoles.join(', ')}`
        });
      }
  
      // Password validation
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
        });
      }
  
      // Username validation
      if (username && (username.length < 8 || username.length > 20)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 8 and 20 characters'
        });
      }
  
      await createUserService(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: req.body.username
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        return res.status(409).json({
          success: false,
          message: `${field} already exists`
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  };
  

