import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// @desc    Get reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
export const getHotelReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ hotel: req.params.hotelId })
            .populate('user', 'name avatar')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ hotel: req.params.hotelId });

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
        });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { hotel, rating, comment } = req.body;

        if (!hotel || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Hotel, rating, and comment are required',
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        // Check if hotel exists
        const hotelExists = await Hotel.findById(hotel);
        if (!hotelExists) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        // Check if user has a completed/confirmed booking at this hotel
        const hasBooking = await Booking.findOne({
            user: req.user._id,
            hotel,
            status: { $in: ['confirmed', 'completed'] },
        });

        if (!hasBooking) {
            return res.status(403).json({
                success: false,
                message: 'You can only review hotels where you have a confirmed or completed booking',
            });
        }

        // Check if user already reviewed this hotel
        const existingReview = await Review.findOne({
            hotel,
            user: req.user._id,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this hotel. You can update your existing review.',
            });
        }

        const review = await Review.create({
            hotel,
            user: req.user._id,
            rating: parseInt(rating),
            comment: comment.trim(),
        });

        const populatedReview = await Review.findById(review._id).populate(
            'user',
            'name avatar'
        );

        res.status(201).json({
            success: true,
            data: populatedReview,
            message: 'Review submitted successfully',
        });
    } catch (error) {
        console.error('Error creating review:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this hotel',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating review',
        });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review',
            });
        }

        if (rating) review.rating = parseInt(rating);
        if (comment) review.comment = comment.trim();

        await review.save();

        const populatedReview = await Review.findById(review._id).populate(
            'user',
            'name avatar'
        );

        res.json({
            success: true,
            data: populatedReview,
            message: 'Review updated successfully',
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review',
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review',
            });
        }

        const hotelId = review.hotel;
        await Review.findByIdAndDelete(req.params.id);

        // Recalculate hotel rating
        await Review.calculateAverageRating(hotelId);

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
        });
    }
};

// @desc    Get user's review for a specific hotel
// @route   GET /api/reviews/user/:hotelId
// @access  Private
export const getUserReviewForHotel = async (req, res) => {
    try {
        const review = await Review.findOne({
            hotel: req.params.hotelId,
            user: req.user._id,
        }).populate('user', 'name avatar');

        res.json({
            success: true,
            data: review, // null if not found
        });
    } catch (error) {
        console.error('Error getting user review:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
        });
    }
};
