import api from './api';

export const adminService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get all users
    getAllUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    // Deactivate user
    deactivateUser: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/deactivate`);
        return response.data;
    },

    // Get all hotels
    getAllHotels: async (params) => {
        const response = await api.get('/admin/hotels', { params });
        return response.data;
    },

    // Generate booking report
    generateBookingReport: async (params) => {
        const response = await api.get('/admin/reports/bookings', { params });
        return response.data;
    },
};
