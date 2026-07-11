const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validateMiddleware');

const router = express.Router();

// Register route with fields validation
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
      .isIn(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'])
      .withMessage('Must be a valid system role (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)'),
    validateFields,
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validateFields,
  ],
  login
);

// Token rotation endpoint
router.post('/refresh', refreshToken);

// Logout endpoint
router.post('/logout', logout);

// Profile endpoint
router.get('/me', protect, getMe);

module.exports = router;
