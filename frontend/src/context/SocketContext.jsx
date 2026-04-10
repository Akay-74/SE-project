import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '');
        const socketInstance = io(socketUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: false, // Don't auto-connect immediately
            reconnection: true,
            reconnectionAttempts: 5, // Limit to 5 attempts
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.warn('⚠️ Socket connection error:', error.message);
            // Backend might not be running - don't spam reconnections
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}/5`);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('❌ Socket reconnection failed after 5 attempts. Is the backend running?');
        });

        // Connect manually
        socketInstance.connect();

        setSocket(socketInstance);

        return () => {
            console.log('🔌 Disconnecting socket...');
            socketInstance.disconnect();
        };
    }, []);

    const joinRoom = (roomId) => {
        if (socket && connected) {
            socket.emit('join-room', roomId);
        }
    };

    const leaveRoom = (roomId) => {
        if (socket && connected) {
            socket.emit('leave-room', roomId);
        }
    };

    const checkAvailability = (roomId, checkIn, checkOut) => {
        if (socket && connected) {
            socket.emit('check-availability', { roomId, checkIn, checkOut });
        }
    };

    const value = {
        socket,
        connected,
        joinRoom,
        leaveRoom,
        checkAvailability,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
