import express from 'express';
import {
    getAllUsers,
    updateUserRole,
    deactivateUser,
    getAllHotels,
    generateBookingReport,
    getDashboardStats,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(authenticate, authorizeRoles('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/deactivate', deactivateUser);

// Hotel management
router.get('/hotels', getAllHotels);

// Reports
router.get('/reports/bookings', generateBookingReport);

// Dashboard stats
router.get('/stats', getDashboardStats);

export default router;
