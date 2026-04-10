import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import {
    googleCallback,
    getProfile,
    logout,
    verifyToken,
    register,
    loginWithPassword,
    setUserRole,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['user', 'manager'])
        .withMessage('Role must be either user or manager'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// @route   POST /api/auth/register
// @desc    Register with email/password
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login with email/password
// @access  Public
router.post('/login', loginValidation, loginWithPassword);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL}/`,
            session: false,
        })(req, res, next);
    },
    googleCallback
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', authenticate, verifyToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

// @route   PATCH /api/auth/role
// @desc    Set user role (for OAuth users)
// @access  Private
router.patch('/role', authenticate, setUserRole);

export default router;
