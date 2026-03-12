import api from './api';

export const hotelService = {
    // Search hotels
    searchHotels: async (params) => {
        const response = await api.get('/hotels/search', { params });
        return response.data;
    },

    // Get hotel by ID
    getHotelById: async (id) => {
        const response = await api.get(`/hotels/${id}`);
        return response.data;
    },

    // Create hotel (manager/admin)
    createHotel: async (hotelData) => {
        const response = await api.post('/hotels', hotelData);
        return response.data;
    },

    // Update hotel (manager/admin)
    updateHotel: async (id, hotelData) => {
        const response = await api.put(`/hotels/${id}`, hotelData);
        return response.data;
    },

    // Get manager's hotels
    getManagerHotels: async () => {
        const response = await api.get('/hotels/manager/my-hotels');
        return response.data;
    },

    // Get rooms for hotel
    getRoomsByHotel: async (hotelId) => {
        const response = await api.get(`/rooms/hotel/${hotelId}`);
        return response.data;
    },

    // Get room by ID
    getRoomById: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}`);
        return response.data;
    },

    // Check room availability
    checkAvailability: async (roomId, checkIn, checkOut) => {
        const response = await api.get(`/rooms/${roomId}/availability`, {
            params: { checkIn, checkOut },
        });
        return response.data;
    },

    // Create room (manager/admin)
    createRoom: async (roomData) => {
        const response = await api.post('/rooms', roomData);
        return response.data;
    },

    // Update room (manager/admin)
    updateRoom: async (id, roomData) => {
        const response = await api.put(`/rooms/${id}`, roomData);
        return response.data;
    },
};
