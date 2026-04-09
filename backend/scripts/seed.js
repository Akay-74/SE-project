import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

dotenv.config();

const CITIES = [
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, pin: '400001' },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, pin: '110001' },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, pin: '560001' },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, pin: '600001' },
    { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, pin: '403001' },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, pin: '302001' }
];

const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&h=600&auto=format&fit=crop', // Classic luxury Suite
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&h=600&auto=format&fit=crop', // Modern minimalist hotel room
    'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?q=80&w=800&h=600&auto=format&fit=crop', // Boutique style bedroom
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&h=600&auto=format&fit=crop', // Spacious premium room
    'https://images.unsplash.com/photo-1729717949948-56b52db111dd?q=80&w=800&h=600&auto=format&fit=crop', // Infinity pool
    'https://images.unsplash.com/photo-1729717949712-1c51422693d1?q=80&w=800&h=600&auto=format&fit=crop', // Tropical resort pool
    'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=800&h=600&auto=format&fit=crop', // Modern high-rise hotel
    'https://images.unsplash.com/photo-1670337476682-522bd45a188d?q=80&w=800&h=600&auto=format&fit=crop', // Classic grand hotel
    'https://images.unsplash.com/photo-1677129667171-92abd8740fa3?q=80&w=800&h=600&auto=format&fit=crop', // Modern elegant lobby
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&h=600&auto=format&fit=crop'  // Grand lobby
];

const HOTEL_NAMES = [
    'Grand Oasis Resort', 'The Royal Palace', 'Taj Horizon', 'Blue Water Bay', 
    'Emerald Suites', 'Sunshine Inn', 'Silver Sands Hotel', 'City Center View',
    'Mountain Retreat', 'Valley View Resort', 'Oceanic Bliss', 'Urban Boutique Hotel'
];

const AMENITIES = ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service', 'Bar', 'Parking'];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB. Clearing existing data...');

        try { await User.collection.drop(); } catch(e) {}
        try { await Hotel.collection.drop(); } catch(e) {}
        try { await Room.collection.drop(); } catch(e) {}
        try { await Review.collection.drop(); } catch(e) {}

        console.log('Database cleared.');

        // Create admin
        await User.create({
            name: 'System Admin',
            email: 'admin@kamra.com',
            password: 'admin123',
            role: 'admin',
            authProvider: 'local',
        });

        // Create manager
        const manager = await User.create({
            name: 'Test Manager',
            email: 'manager@kamra.com',
            password: 'manager123',
            role: 'manager',
            authProvider: 'local',
        });

        // Create user
        const users = [];
        const testUser = await User.create({
            name: 'Test User',
            email: 'user@kamra.com',
            password: 'user123',
            role: 'user',
            authProvider: 'local',
        });
        users.push(testUser);
        
        // Create dummy users for reviews
        for (let i = 1; i <= 8; i++) {
            const reviewer = await User.create({
                name: `Reviewer ${i}`,
                email: `reviewer${i}@kamra.com`,
                password: 'user123',
                role: 'user',
                authProvider: 'local',
            });
            users.push(reviewer);
        }

        console.log('Users created.');

        // Create hotels
        const hotels = [];
        const COMMENTS = [
            "Amazing experience, highly recommended!",
            "Good value for money. Will visit again.",
            "The staff was very polite, but the room could be cleaner.",
            "Exceptional service and beautiful ambiance.",
            "Average stay. Nothing too special.",
            "Great location, easy to access everything.",
            "Loved the amenities, but food wasn't up to the mark.",
            "Perfect place for a weekend getaway."
        ];

        for (let i = 0; i < 15; i++) {
            const city = CITIES[i % CITIES.length];
            const name = HOTEL_NAMES[i % HOTEL_NAMES.length] + (i >= HOTEL_NAMES.length ? ` ${i}` : '');
            
            const hotel = await Hotel.create({
                name,
                description: `Experience luxury and comfort at ${name}, located in the heart of ${city.name}. We offer world-class amenities and exceptional service.`,
                location: {
                    city: city.name,
                    state: city.state,
                    address: `${Math.floor(Math.random() * 100) + 1} Main Street`,
                    pincode: city.pin,
                    coordinates: {
                        latitude: city.lat,
                        longitude: city.lng
                    }
                },
                images: [
                    HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)],
                    HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)]
                ],
                amenities: AMENITIES.slice(0, Math.floor(Math.random() * 5) + 3),
                manager: manager._id,
                rating: 0,
                totalReviews: 0,
                isActive: true
            });
            hotels.push(hotel);
            
            // Create reviews for this hotel
            const numReviews = Math.floor(Math.random() * 5) + 3; // 3 to 7 reviews
            for (let k = 0; k < numReviews; k++) {
                const reviewer = users[k % users.length];
                const reviewRating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
                
                await Review.create({
                    hotel: hotel._id,
                    user: reviewer._id,
                    rating: reviewRating,
                    comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)]
                });
            }
            
            // Create rooms for this hotel
            const numRooms = Math.floor(Math.random() * 3) + 2; // 2-4 Room types
            const roomTypes = ['Standard Room', 'Deluxe Room', 'Premium Suite', 'Executive Suite'];
            
            for(let j=0; j<numRooms; j++) {
                await Room.create({
                    hotel: hotel._id,
                    roomType: roomTypes[j],
                    description: `A beautiful ${roomTypes[j]} with stunning views and modern comforts.`,
                    images: [HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)]],
                    amenities: ['Free WiFi', 'AC', 'TV', 'Ensuite Bathroom'].slice(0, Math.floor(Math.random() * 3) + 2),
                    pricePerNight: Math.floor(Math.random() * 5000) + 1500 + (j * 2000), // Prices from 1500 to 12500
                    maxOccupancy: Math.floor(Math.random() * 3) + 2,
                    totalRooms: Math.floor(Math.random() * 15) + 5
                });
            }
        }

        console.log(`Successfully created ${hotels.length} hotels with rooms!`);
        console.log('--- TEST ACCOUNTS ---');
        console.log('Admin:   admin@kamra.com / admin123');
        console.log('Manager: manager@kamra.com / manager123');
        console.log('User:    user@kamra.com / user123');
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
