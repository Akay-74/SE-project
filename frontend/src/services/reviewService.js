import api from './api';

export const reviewService = {
    // Get reviews for a hotel
    getHotelReviews: async (hotelId, params = {}) => {
        const response = await api.get(`/reviews/hotel/${hotelId}`, { params });
        return response.data;
    },

    // Create a review
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    // Get user's review for a specific hotel
    getUserReview: async (hotelId) => {
        const response = await api.get(`/reviews/user/${hotelId}`);
        return response.data;
    },

    // Update a review
    updateReview: async (id, reviewData) => {
        const response = await api.put(`/reviews/${id}`, reviewData);
        return response.data;
    },

    // Delete a review
    deleteReview: async (id) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },
};
