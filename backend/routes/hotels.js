import express from 'express';
import {
    searchHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getManagerHotels,
} from '../controllers/hotelController.js';
import { authenticate, authorizeRoles, authorizeHotelManager } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchHotels);
router.get('/:id', getHotelById);

// Manager/Admin routes
router.post(
    '/',
    authenticate,
    authorizeRoles('manager', 'admin'),
    createHotel
);

router.get(
    '/manager/my-hotels',
    authenticate,
    authorizeRoles('manager', 'admin'),
    getManagerHotels
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles('manager', 'admin'),
    authorizeHotelManager,
    updateHotel
);

// Admin only routes
router.delete(
    '/:id',
    authenticate,
    authorizeRoles('admin'),
    deleteHotel
);

export default router;
