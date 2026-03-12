import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Search hotels
// @route   GET /api/hotels/search
// @access  Public
export const searchHotels = async (req, res) => {
    try {
        const { city, name, minPrice, maxPrice, amenities, rating, page = 1, limit = 10 } = req.query;

        const query = { isActive: true };

        // Filter by city
        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        // Filter by name (text search)
        if (name) {
            query.$text = { $search: name };
        }

        // Filter by rating
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let hotels = await Hotel.find(query)
            .populate('manager', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1, createdAt: -1 });

        // Filter by price range if specified (requires checking rooms)
        if (minPrice || maxPrice) {
            const hotelIds = hotels.map((h) => h._id);
            const priceQuery = { hotel: { $in: hotelIds }, isActive: true };

            if (minPrice) priceQuery.pricePerNight = { $gte: parseFloat(minPrice) };
            if (maxPrice) {
                priceQuery.pricePerNight = priceQuery.pricePerNight || {};
                priceQuery.pricePerNight.$lte = parseFloat(maxPrice);
            }

            const roomsInRange = await Room.find(priceQuery).distinct('hotel');
            hotels = hotels.filter((h) => roomsInRange.some((id) => id.equals(h._id)));
        }

        // Filter by amenities
        if (amenities) {
            const amenitiesArray = amenities.split(',').map((a) => a.trim());
            hotels = hotels.filter((h) =>
                amenitiesArray.every((amenity) =>
                    h.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
                )
            );
        }

        const total = await Hotel.countDocuments(query);

        res.json({
            success: true,
            data: hotels,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error searching hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching hotels',
        });
    }
};

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
export const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id)
            .populate('manager', 'name email');

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        // Get rooms for this hotel
        const rooms = await Room.find({ hotel: hotel._id, isActive: true });

        res.json({
            success: true,
            data: {
                ...hotel.toObject(),
                rooms,
            },
        });
    } catch (error) {
        console.error('Error getting hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hotel details',
        });
    }
};

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private (Manager/Admin)
export const createHotel = async (req, res) => {
    try {
        const { name, description, location, images, amenities } = req.body;

        const hotel = await Hotel.create({
            name,
            description,
            location,
            images: images || [],
            amenities: amenities || [],
            manager: req.user._id,
        });

        // Add hotel to user's managedHotels if they're a manager
        if (req.user.role === 'manager') {
            await User.findByIdAndUpdate(req.user._id, {
                $push: { managedHotels: hotel._id },
            });
        }

        res.status(201).json({
            success: true,
            data: hotel,
            message: 'Hotel created successfully',
        });
    } catch (error) {
        console.error('Error creating hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hotel',
        });
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Manager/Admin)
export const updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedHotel,
            message: 'Hotel updated successfully',
        });
    } catch (error) {
        console.error('Error updating hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating hotel',
        });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin)
export const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        // Soft delete
        hotel.isActive = false;
        await hotel.save();

        res.json({
            success: true,
            message: 'Hotel deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting hotel',
        });
    }
};

// @desc    Get manager's hotels
// @route   GET /api/hotels/manager/my-hotels
// @access  Private (Manager)
export const getManagerHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({
            manager: req.user._id,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: hotels,
        });
    } catch (error) {
        console.error('Error getting manager hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hotels',
        });
    }
};
