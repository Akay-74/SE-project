import express from 'express';
import {
    getRoomsByHotel,
    checkAvailability,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomById,
} from '../controllers/roomController.js';
import { authenticate, authorizeRoles, authorizeHotelManager } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/hotel/:hotelId', getRoomsByHotel);
router.get('/:id', getRoomById);
router.get('/:id/availability', checkAvailability);

// Manager/Admin routes
router.post(
    '/',
    authenticate,
    authorizeRoles('manager', 'admin'),
    createRoom
);

router.put(
    '/:id',
    authenticate,
    authorizeRoles('manager', 'admin'),
    updateRoom
);

// Admin only routes
router.delete(
    '/:id',
    authenticate,
    authorizeRoles('admin'),
    deleteRoom
);

export default router;
