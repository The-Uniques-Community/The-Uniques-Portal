/**
 * @file isAuthenticated.js
 * @description Authentication and admin authorization middleware utilizing Bearer JWT tokens and Member model hydration.
 * @architecture Middleware security layer verifying Bearer tokens against MongoDB Member documents and enforcing admin privileges.
 * @agent_note Requires Bearer token in Authorization header; attaches hydrated Mongoose Member instance (excluding password) to req.user.
 */
import jwt from 'jsonwebtoken';
import User from '../models/user/userModel.js';

/**
 * @desc Verifies Bearer JWT from Authorization header, retrieves user from MongoDB, and attaches user document to req.user.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware callback
 * @mutates {Object} req.user - Hydrated User document excluding password field
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    
    try {
      // Verify token
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "the_uniques_portal_jwt_secret_dev_key" : undefined);
      if (!secret) {
        return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
      }
      const decoded = jwt.verify(token, secret);
      
      // Add user to request object
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this token'
        });
      }
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * @desc Restricts endpoint access strictly to authenticated members who hold the 'admin' role.
 * @param {import('express').Request} req - Express request with hydrated req.user
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware callback
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};