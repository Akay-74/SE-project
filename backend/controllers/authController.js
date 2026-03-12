import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register new user with email/password
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Validate role - prevent admin role assignment during signup
        let userRole = 'user'; // Default role
        if (role) {
            if (role === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot register as admin. Please contact system administrator.',
                });
            }
            if (['user', 'manager'].includes(role)) {
                userRole = role;
            }
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            authProvider: 'local',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
        });
    }
};

// @desc    Login with email/password
// @route   POST /api/auth/login
// @access  Public
export const loginWithPassword = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if user registered with Google
        if (user.authProvider === 'google') {
            return res.status(400).json({
                success: false,
                message: 'This account uses Google Sign-In. Please login with Google.',
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
        });
    }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
    try {
        // req.user is now an object with { user, isNewUser }
        const { user, isNewUser } = req.user;
        const token = generateToken(user._id);

        // If new user, redirect to role selection page
        if (isNewUser) {
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&needsRole=true`);
        } else {
            // Existing user, redirect normally
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        }
    } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-__v')
            .populate('managedHotels', 'name location.city');

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out',
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    });
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
    try {
        console.log('Verify token - req.user:', req.user);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found in request',
            });
        }

        res.json({
            success: true,
            data: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
                avatar: req.user.avatar,
            },
        });
    } catch (error) {
        console.error('Error in verifyToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying token',
        });
    }
};

// @desc    Set user role (for OAuth users after signup)
// @route   PATCH /api/auth/role
// @access  Private
export const setUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        // Validate role
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required',
            });
        }

        // Prevent admin role assignment
        if (role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot set admin role. Please contact system administrator.',
            });
        }

        // Validate role is either user or manager
        if (!['user', 'manager'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either user or manager',
            });
        }

        // Update user role
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            message: 'Role updated successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Error in setUserRole:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating role',
        });
    }
};
