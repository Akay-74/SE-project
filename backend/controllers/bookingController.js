import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const {
            hotel,
            room,
            checkInDate,
            checkOutDate,
            numberOfRooms,
            guestDetails,
            paymentMethod,
        } = req.body;

        // Validate payment method
        const validPaymentMethods = ['card', 'upi', 'netbanking', 'wallet'];
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'A valid payment method is required. Prepayment is mandatory.',
            });
        }

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const now = new Date();

        if (checkIn < now) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date cannot be in the past',
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date',
            });
        }

        // Get room details
        const roomDetails = await Room.findById(room);

        if (!roomDetails) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Check availability
        const availableRooms = await roomDetails.getAvailableRooms(checkIn, checkOut);

        if (availableRooms < numberOfRooms) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableRooms} room(s) available for selected dates`,
            });
        }

        // Calculate total price
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = roomDetails.pricePerNight * nights * numberOfRooms;

        // Create booking with prepayment
        const booking = await Booking.create({
            user: req.user._id,
            hotel,
            room,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfRooms,
            totalPrice,
            guestDetails,
            paymentMethod,
            status: 'confirmed',
            paymentStatus: 'completed',
        });

        // Populate booking details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('hotel', 'name location images')
            .populate('room', 'roomType pricePerNight')
            .populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: populatedBooking,
            message: 'Booking created successfully',
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
        });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('hotel', 'name location images')
            .populate('room', 'roomType pricePerNight')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error('Error getting user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
        });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hotel', 'name location images amenities')
            .populate('room', 'roomType pricePerNight amenities maxOccupancy')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if user is authorized to view this booking
        if (
            booking.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            // Check if user is manager of the hotel
            const hotel = await Hotel.findById(booking.hotel._id);
            if (!hotel || hotel.manager.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this booking',
                });
            }
        }

        res.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking details',
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking',
            });
        }

        // Check if booking can be cancelled
        if (!booking.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be cancelled (less than 24 hours to check-in or already cancelled)',
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            data: booking,
            message: 'Booking cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
        });
    }
};

// @desc    Get hotel bookings (for managers)
// @route   GET /api/bookings/hotel/:hotelId
// @access  Private (Manager/Admin)
export const getHotelBookings = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        const query = { hotel: req.params.hotelId };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.checkInDate = {};
            if (startDate) query.checkInDate.$gte = new Date(startDate);
            if (endDate) query.checkInDate.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(query)
            .populate('room', 'roomType pricePerNight')
            .populate('user', 'name email')
            .sort({ checkInDate: -1 });

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error('Error getting hotel bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hotel bookings',
        });
    }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
export const getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.checkInDate = {};
            if (startDate) query.checkInDate.$gte = new Date(startDate);
            if (endDate) query.checkInDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('hotel', 'name location.city')
            .populate('room', 'roomType pricePerNight')
            .populate('user', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error getting all bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
        });
    }
};
