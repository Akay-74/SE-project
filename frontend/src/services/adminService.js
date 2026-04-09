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

    // Reactivate user
    reactivateUser: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/reactivate`);
        return response.data;
    },

    // Reset user password
    resetUserPassword: async (userId, newPassword) => {
        const response = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
        return response.data;
    },

    // Assign managed hotels to a manager
    assignManagedHotels: async (userId, hotelIds) => {
        const response = await api.put(`/admin/users/${userId}/managed-hotels`, { hotelIds });
        return response.data;
    },

    // Create a new manager account
    createManager: async (data) => {
        const response = await api.post('/admin/users/create-manager', data);
        return response.data;
    },

    // Get all hotels
    getAllHotels: async (params) => {
        const response = await api.get('/admin/hotels', { params });
        return response.data;
    },

    // Deactivate a hotel
    deleteHotel: async (hotelId) => {
        const response = await api.delete(`/admin/hotels/${hotelId}`);
        return response.data;
    },

    // Generate booking report
    generateBookingReport: async (params) => {
        const response = await api.get('/admin/reports/bookings', { params });
        return response.data;
    },
};
