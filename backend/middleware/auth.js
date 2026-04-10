import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authenticate user with JWT
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Log debug info only in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Token decoded:', decoded);
        }

        // Get user from token
        const user = await User.findById(decoded.id).select('-__v');
        
        // Log debug info only in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('User found:', user);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Authorization denied.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Authorize specific roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Authorize hotel manager for specific hotel
export const authorizeHotelManager = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId || req.body.hotel || req.params.id;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                message: 'Hotel ID is required.'
            });
        }

        // Admin can access all hotels
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user is manager of this hotel
        if (req.user.role === 'manager' && req.user.isManagerOf(hotelId)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You are not authorized to manage this hotel.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during authorization.'
        });
    }
};
