import express from 'express';
import {
    getHotelReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReviewForHotel,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/hotel/:hotelId', getHotelReviews);

// Private routes
router.post('/', authenticate, createReview);
router.get('/user/:hotelId', authenticate, getUserReviewForHotel);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
