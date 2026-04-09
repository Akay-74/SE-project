import express from 'express';
import {
    getAllUsers,
    updateUserRole,
    deactivateUser,
    reactivateUser,
    resetUserPassword,
    assignManagedHotels,
    createManager,
    getAllHotels,
    deleteHotel,
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
router.put('/users/:id/reactivate', reactivateUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.put('/users/:id/managed-hotels', assignManagedHotels);
router.post('/users/create-manager', createManager);

// Hotel management
router.get('/hotels', getAllHotels);
router.delete('/hotels/:id', deleteHotel);

// Reports
router.get('/reports/bookings', generateBookingReport);

// Dashboard stats
router.get('/stats', getDashboardStats);

export default router;
