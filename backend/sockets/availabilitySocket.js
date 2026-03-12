import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

const setupAvailabilitySocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

        // Join room for specific hotel/room updates
        socket.on('join-room', (roomId) => {
            socket.join(`room-${roomId}`);
            console.log(`Client ${socket.id} joined room-${roomId}`);
        });

        // Leave room
        socket.on('leave-room', (roomId) => {
            socket.leave(`room-${roomId}`);
            console.log(`Client ${socket.id} left room-${roomId}`);
        });

        // Check availability in real-time
        socket.on('check-availability', async ({ roomId, checkIn, checkOut }) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('availability-error', { message: 'Room not found' });
                    return;
                }

                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                const availableRooms = await room.getAvailableRooms(checkInDate, checkOutDate);

                socket.emit('availability-update', {
                    roomId,
                    availableRooms,
                    totalRooms: room.totalRooms,
                });
            } catch (error) {
                console.error('Error checking availability:', error);
                socket.emit('availability-error', { message: 'Error checking availability' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    // Function to broadcast availability updates
    const broadcastAvailabilityUpdate = async (roomId) => {
        try {
            const room = await Room.findById(roomId);
            if (room) {
                io.to(`room-${roomId}`).emit('availability-changed', {
                    roomId,
                    totalRooms: room.totalRooms,
                    message: 'Room availability has been updated',
                });
            }
        } catch (error) {
            console.error('Error broadcasting availability:', error);
        }
    };

    // Export broadcast function for use in controllers
    return { broadcastAvailabilityUpdate };
};

export default setupAvailabilitySocket;
