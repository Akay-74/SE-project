import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
            index: true,
        },
        roomType: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
            },
        ],
        amenities: [
            {
                type: String,
            },
        ],
        pricePerNight: {
            type: Number,
            required: true,
            min: 0,
        },
        maxOccupancy: {
            type: Number,
            required: true,
            min: 1,
        },
        totalRooms: {
            type: Number,
            required: true,
            min: 1,
        },
        version: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for hotel and room type
roomSchema.index({ hotel: 1, roomType: 1 });

// Method to get available rooms for a date range
roomSchema.methods.getAvailableRooms = async function (checkIn, checkOut) {
    const Booking = mongoose.model('Booking');

    // Find overlapping bookings
    const overlappingBookings = await Booking.find({
        room: this._id,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                checkInDate: { $lt: checkOut },
                checkOutDate: { $gt: checkIn },
            },
        ],
    });

    // Calculate total booked rooms
    const bookedRooms = overlappingBookings.reduce(
        (sum, booking) => sum + booking.numberOfRooms,
        0
    );

    return this.totalRooms - bookedRooms;
};

const Room = mongoose.model('Room', roomSchema);

export default Room;
