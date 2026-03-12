import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// @desc    Get rooms for a hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
export const getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await Room.find({
            hotel: req.params.hotelId,
            isActive: true,
        }).populate('hotel', 'name location.city');

        res.json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        console.error('Error getting rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching rooms',
        });
    }
};

// @desc    Check room availability
// @route   GET /api/rooms/:id/availability
// @access  Public
export const checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Check-in and check-out dates are required',
            });
        }

        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const availableRooms = await room.getAvailableRooms(checkInDate, checkOutDate);

        res.json({
            success: true,
            data: {
                roomId: room._id,
                roomType: room.roomType,
                totalRooms: room.totalRooms,
                availableRooms,
                pricePerNight: room.pricePerNight,
            },
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking availability',
        });
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private (Manager/Admin)
export const createRoom = async (req, res) => {
    try {
        const {
            hotel,
            roomType,
            description,
            images,
            amenities,
            pricePerNight,
            maxOccupancy,
            totalRooms,
        } = req.body;

        const room = await Room.create({
            hotel,
            roomType,
            description,
            images: images || [],
            amenities: amenities || [],
            pricePerNight,
            maxOccupancy,
            totalRooms,
        });

        res.status(201).json({
            success: true,
            data: room,
            message: 'Room created successfully',
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating room',
        });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Manager/Admin)
export const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { ...req.body, version: room.version + 1 },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedRoom,
            message: 'Room updated successfully',
        });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating room',
        });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Soft delete
        room.isActive = false;
        await room.save();

        res.json({
            success: true,
            message: 'Room deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting room',
        });
    }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotel', 'name location');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        res.json({
            success: true,
            data: room,
        });
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching room details',
        });
    }
};
