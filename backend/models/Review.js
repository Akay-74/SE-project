import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from reviewing the same hotel twice
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

// Update hotel rating after saving or removing a review
reviewSchema.statics.calculateAverageRating = async function (hotelId) {
    const obj = await this.aggregate([
        {
            $match: { hotel: hotelId },
        },
        {
            $group: {
                _id: '$hotel',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        if (obj.length > 0) {
            await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
                rating: obj[0].averageRating.toFixed(1),
                totalReviews: obj[0].totalReviews,
            });
        } else {
            await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
                rating: 0,
                totalReviews: 0,
            });
        }
    } catch (error) {
        console.error(error);
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.hotel);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.hotel);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
