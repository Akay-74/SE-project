import api from './api';

export const bookingService = {
    // Create booking
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // Get user bookings
    getUserBookings: async () => {
        const response = await api.get('/bookings/my-bookings');
        return response.data;
    },

    // Get booking by ID
    getBookingById: async (id) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    // Cancel booking
    cancelBooking: async (id) => {
        const response = await api.put(`/bookings/${id}/cancel`);
        return response.data;
    },

    // Get hotel bookings (manager/admin)
    getHotelBookings: async (hotelId, params) => {
        const response = await api.get(`/bookings/hotel/${hotelId}`, { params });
        return response.data;
    },

    // Get all bookings (admin)
    getAllBookings: async (params) => {
        const response = await api.get('/bookings/admin/all', { params });
        return response.data;
    },
};
