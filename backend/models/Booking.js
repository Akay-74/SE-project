import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
            index: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
            index: true,
        },
        checkInDate: {
            type: Date,
            required: true,
            index: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
            index: true,
        },
        numberOfRooms: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
            index: true,
        },
        // Payment fields for future integration
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet'],
            required: [true, 'Payment method is required. Prepayment is mandatory.'],
        },
        transactionId: {
            type: String,
            default: null,
        },
        // Guest details
        guestDetails: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            specialRequests: {
                type: String,
                default: '',
            },
        },
        bookingReference: {
            type: String,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, checkInDate: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1, status: 1 });

// Generate booking reference before saving
bookingSchema.pre('save', function (next) {
    if (!this.bookingReference) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.bookingReference = `BK${timestamp}${random}`;
    }
    next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
    const now = new Date();
    const checkIn = new Date(this.checkInDate);
    const hoursDiff = (checkIn - now) / (1000 * 60 * 60);

    // Can cancel if check-in is more than 24 hours away and status is not already cancelled
    return hoursDiff > 24 && this.status !== 'cancelled';
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
