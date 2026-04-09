import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;

        const query = {};
        if (role) {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-__v')
            .populate('managedHotels', 'name location.city')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'manager', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
            message: 'User role updated successfully',
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
        });
    }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin)
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
            message: 'User deactivated successfully',
        });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating user',
        });
    }
};

// @desc    Reactivate user
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private (Admin)
export const reactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user,
            message: 'User reactivated successfully',
        });
    } catch (error) {
        console.error('Error reactivating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error reactivating user',
        });
    }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin)
export const resetUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reset password for Google OAuth accounts',
            });
        }

        user.password = newPassword; // pre-save hook will hash it
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
        });
    }
};

// @desc    Assign managed hotels to a manager user
// @route   PUT /api/admin/users/:id/managed-hotels
// @access  Private (Admin)
export const assignManagedHotels = async (req, res) => {
    try {
        const { hotelIds } = req.body;

        if (!Array.isArray(hotelIds)) {
            return res.status(400).json({
                success: false,
                message: 'hotelIds must be an array',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { managedHotels: hotelIds },
            { new: true }
        )
            .select('-__v')
            .populate('managedHotels', 'name location.city');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update hotel.manager field for newly assigned hotels
        if (hotelIds.length > 0) {
            await Hotel.updateMany(
                { _id: { $in: hotelIds } },
                { manager: user._id }
            );
        }

        res.json({
            success: true,
            data: user,
            message: 'Managed hotels updated successfully',
        });
    } catch (error) {
        console.error('Error assigning managed hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning managed hotels',
        });
    }
};

// @desc    Create a new manager account
// @route   POST /api/admin/users/create-manager
// @access  Private (Admin)
export const createManager = async (req, res) => {
    try {
        const { name, email, password, hotelIds = [] } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'manager',
            authProvider: 'local',
            managedHotels: hotelIds,
        });

        if (hotelIds.length > 0) {
            await Hotel.updateMany(
                { _id: { $in: hotelIds } },
                { manager: user._id }
            );
        }

        const populatedUser = await User.findById(user._id)
            .select('-__v')
            .populate('managedHotels', 'name location.city');

        res.status(201).json({
            success: true,
            data: populatedUser,
            message: 'Manager account created successfully',
        });
    } catch (error) {
        console.error('Error creating manager:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating manager account',
        });
    }
};

// @desc    Get all hotels (admin)
// @route   GET /api/admin/hotels
// @access  Private (Admin)
export const getAllHotels = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const hotels = await Hotel.find()
            .populate('manager', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Hotel.countDocuments();

        res.json({
            success: true,
            data: hotels,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error getting hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hotels',
        });
    }
};

// @desc    Deactivate / delete a hotel (admin)
// @route   DELETE /api/admin/hotels/:id
// @access  Private (Admin)
export const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        res.json({
            success: true,
            message: 'Hotel deactivated successfully',
        });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating hotel',
        });
    }
};

// @desc    Generate booking reports
// @route   GET /api/admin/reports/bookings
// @access  Private (Admin)
export const generateBookingReport = async (req, res) => {
    try {
        const { startDate, endDate, status, hotel, format = 'json' } = req.query;

        const query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (status) {
            query.status = status;
        }

        if (hotel) {
            query.hotel = hotel;
        }

        const bookings = await Booking.find(query)
            .populate('hotel', 'name location.city')
            .populate('room', 'roomType pricePerNight')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const stats = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
            confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
            cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
            pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        };

        if (format === 'csv') {
            const csv = [
                'Booking Reference,Hotel,Room Type,Guest Name,Check-In,Check-Out,Total Price,Status,Payment Status',
                ...bookings.map(
                    (b) =>
                        `${b.bookingReference},${b.hotel.name},${b.room.roomType},${b.guestDetails.name},${b.checkInDate.toISOString().split('T')[0]},${b.checkOutDate.toISOString().split('T')[0]},${b.totalPrice},${b.status},${b.paymentStatus}`
                ),
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=booking-report.csv');
            return res.send(csv);
        }

        res.json({
            success: true,
            data: {
                bookings,
                statistics: stats,
            },
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalManagers = await User.countDocuments({ role: 'manager' });
        const totalHotels = await Hotel.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('hotel', 'name')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalManagers,
                totalHotels,
                totalBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentBookings,
            },
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
        });
    }
};
