import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            city: {
                type: String,
                required: true,
                index: true,
            },
            state: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
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
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
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

// Compound indexes for search optimization
hotelSchema.index({ 'location.city': 1, isActive: 1 });
hotelSchema.index({ name: 'text', description: 'text' });

// Virtual for room count
hotelSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'hotel',
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
