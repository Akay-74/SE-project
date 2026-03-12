import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

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
            // Generate CSV
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
