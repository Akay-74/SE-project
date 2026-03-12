import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaMapMarkerAlt, FaStar, FaArrowLeft, FaWifi, FaParking, FaSwimmingPool, FaDumbbell, FaUtensils } from 'react-icons/fa';
import './HotelDetails.css';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        fetchHotelDetails();
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getHotelById(id);
            setHotel(response.data);
            setRooms(response.data.rooms || []);
        } catch (err) {
            console.error('Error fetching hotel details:', err);
            setError('Failed to load hotel details');
        } finally {
            setLoading(false);
        }
    };

    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <FaWifi />;
        if (amenityLower.includes('parking')) return <FaParking />;
        if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return <FaSwimmingPool />;
        if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <FaDumbbell />;
        if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return <FaUtensils />;
        return null;
    };

    const handleBookRoom = (room) => {
        navigate(`/booking/${room._id}`);
    };

    if (loading) {
        return <LoadingSpinner message="Loading hotel details..." />;
    }

    if (error || !hotel) {
        return (
            <div className="container" style={{ padding: 'var(--spacing-2xl)' }}>
                <div className="error-message">{error || 'Hotel not found'}</div>
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="hotel-details-page">
            {/* Header */}
            <div className="hotel-details-header">
                <div className="container">
                    <button className="btn btn-ghost back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back to Search
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="hotel-hero">
                {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="hotel-hero-image" />
                ) : (
                    <div className="hotel-hero-placeholder">
                        <FaMapMarkerAlt />
                    </div>
                )}
                <div className="hotel-hero-overlay">
                    <div className="container">
                        <h1 className="hotel-name">{hotel.name}</h1>
                        <div className="hotel-meta">
                            <div className="hotel-location">
                                <FaMapMarkerAlt />
                                <span>{hotel.location.address}, {hotel.location.city}, {hotel.location.state}</span>
                            </div>
                            {hotel.rating > 0 && (
                                <div className="hotel-rating-large">
                                    <FaStar className="star-icon" />
                                    <span>{hotel.rating.toFixed(1)}</span>
                                    {hotel.totalReviews > 0 && (
                                        <span className="reviews-count">({hotel.totalReviews} reviews)</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container hotel-details-content">
                {/* About Section */}
                <section className="hotel-section">
                    <h2>About This Hotel</h2>
                    <p className="hotel-description-full">{hotel.description}</p>
                </section>

                {/* Amenities Section */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <section className="hotel-section">
                        <h2>Amenities</h2>
                        <div className="amenities-grid">
                            {hotel.amenities.map((amenity, index) => (
                                <div key={index} className="amenity-item">
                                    {getAmenityIcon(amenity)}
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Rooms Section */}
                <section className="hotel-section">
                    <h2>Available Rooms</h2>
                    {rooms.length === 0 ? (
                        <div className="no-rooms">
                            <p>No rooms available at this hotel yet.</p>
                        </div>
                    ) : (
                        <div className="rooms-list">
                            {rooms.map((room) => (
                                <div key={room._id} className="room-card">
                                    <div className="room-image">
                                        {room.images && room.images[0] ? (
                                            <img src={room.images[0]} alt={room.roomType} />
                                        ) : (
                                            <div className="room-image-placeholder">
                                                <FaMapMarkerAlt />
                                            </div>
                                        )}
                                    </div>
                                    <div className="room-details">
                                        <div className="room-header">
                                            <h3>{room.roomType}</h3>
                                            <div className="room-price">
                                                <span className="price-amount">₹{room.pricePerNight}</span>
                                                <span className="price-period">/night</span>
                                            </div>
                                        </div>
                                        <p className="room-description">{room.description}</p>
                                        <div className="room-info">
                                            <div className="room-info-item">
                                                <strong>Max Occupancy:</strong> {room.maxOccupancy} guests
                                            </div>
                                            <div className="room-info-item">
                                                <strong>Available:</strong> {room.totalRooms} rooms
                                            </div>
                                        </div>
                                        {room.amenities && room.amenities.length > 0 && (
                                            <div className="room-amenities">
                                                {room.amenities.slice(0, 4).map((amenity, index) => (
                                                    <span key={index} className="room-amenity-tag">
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {room.amenities.length > 4 && (
                                                    <span className="room-amenity-tag">
                                                        +{room.amenities.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleBookRoom(room)}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Location Section */}
                <section className="hotel-section">
                    <h2>Location</h2>
                    <div className="location-info">
                        <FaMapMarkerAlt className="location-icon" />
                        <div>
                            <p><strong>{hotel.name}</strong></p>
                            <p>{hotel.location.address}</p>
                            <p>{hotel.location.city}, {hotel.location.state} {hotel.location.pincode}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HotelDetails;
