import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/database.js';
import configurePassport from './config/passport.js';
import setupAvailabilitySocket from './sockets/availabilitySocket.js';

// Import routes
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

// Connect to database
connectDB();

// Configure Passport
configurePassport();

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Setup Socket.io
const { broadcastAvailabilityUpdate } = setupAvailabilitySocket(io);

// Make io and broadcast function available to routes
app.set('io', io);
app.set('broadcastAvailability', broadcastAvailabilityUpdate);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io ready for real-time updates`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
