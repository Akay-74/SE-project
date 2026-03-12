import express from 'express';
import {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getHotelBookings,
    getAllBookings,
} from '../controllers/bookingController.js';
import { authenticate, authorizeRoles, authorizeHotelManager } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', authenticate, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id/cancel', authenticate, cancelBooking);

// Manager routes
router.get(
    '/hotel/:hotelId',
    authenticate,
    authorizeRoles('manager', 'admin'),
    authorizeHotelManager,
    getHotelBookings
);

// Admin routes
router.get(
    '/admin/all',
    authenticate,
    authorizeRoles('admin'),
    getAllBookings
);

export default router;
