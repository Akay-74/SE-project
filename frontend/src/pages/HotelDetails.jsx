import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaMapMarkerAlt, FaStar, FaArrowLeft, FaWifi, FaParking,
    FaSwimmingPool, FaDumbbell, FaUtensils, FaUsers, FaBed, FaCheckCircle
} from 'react-icons/fa';
import './HotelDetails.css';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => { fetchHotelDetails(); }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getHotelById(id);
            setHotel(response.data);
            setRooms(response.data.rooms || []);
        } catch (err) {
            setError('Failed to load hotel details');
        } finally {
            setLoading(false);
        }
    };

    const getAmenityIcon = (amenity) => {
        const a = amenity.toLowerCase();
        if (a.includes('wifi') || a.includes('internet')) return <FaWifi />;
        if (a.includes('parking')) return <FaParking />;
        if (a.includes('pool') || a.includes('swimming')) return <FaSwimmingPool />;
        if (a.includes('gym') || a.includes('fitness')) return <FaDumbbell />;
        if (a.includes('restaurant') || a.includes('dining')) return <FaUtensils />;
        return <FaCheckCircle />;
    };

    const renderStars = (rating) =>
        Array.from({ length: 5 }, (_, i) => (
            <FaStar key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '14px' }} />
        ));

    if (loading) return <LoadingSpinner message="Loading hotel details..." />;

    if (error || !hotel) return (
        <div className="container" style={{ padding: 'var(--spacing-3xl)' }}>
            <div className="alert alert-error">{error || 'Hotel not found'}</div>
            <button className="btn btn-outline mt-lg" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Go Back
            </button>
        </div>
    );

    return (
        <div className="hotel-details-page">
            {/* Top Bar */}
            <div className="hotel-details-topbar">
                <div className="container">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back to Search
                    </button>
                </div>
            </div>

            {/* Hero */}
            <div className="hotel-hero">
                {hotel.images?.length > 0 ? (
                    <img src={hotel.images[activeImage] || hotel.images[0]} alt={hotel.name} className="hotel-hero-image" />
                ) : (
                    <div className="hotel-hero-placeholder">🏨</div>
                )}
                <div className="hotel-hero-overlay">
                    <div className="container">
                        <h1 className="hotel-name">{hotel.name}</h1>
                        <div className="hotel-meta">
                            <div className="hotel-location">
                                <FaMapMarkerAlt />
                                <span>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.state}</span>
                            </div>
                            {hotel.rating > 0 && (
                                <div className="hotel-rating-large">
                                    <FaStar style={{ color: '#f59e0b' }} />
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

            <div className="hotel-details-content">
                {/* Left Column */}
                <div>
                    {/* About */}
                    <section className="hotel-section">
                        <h2>About This Hotel</h2>
                        <p className="hotel-description-full">{hotel.description}</p>
                    </section>

                    {/* Amenities */}
                    {hotel.amenities?.length > 0 && (
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

                    {/* Rooms */}
                    <section className="hotel-section">
                        <h2><FaBed /> Available Rooms</h2>
                        {rooms.length === 0 ? (
                            <div className="no-rooms">
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No rooms available at this time.</p>
                            </div>
                        ) : (
                            <div className="rooms-list">
                                {rooms.map((room) => (
                                    <div key={room._id} className="room-card">
                                        <div className="room-image">
                                            {room.images?.[0] ? (
                                                <img src={room.images[0]} alt={room.roomType} />
                                            ) : (
                                                <div className="room-image-placeholder">🛏️</div>
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
                                                    <FaUsers style={{ color: 'var(--primary)' }} />
                                                    <strong>Max:</strong> {room.maxOccupancy} guests
                                                </div>
                                                <div className="room-info-item">
                                                    <FaBed style={{ color: 'var(--primary)' }} />
                                                    <strong>Available:</strong> {room.totalRooms} rooms
                                                </div>
                                            </div>
                                            {room.amenities?.length > 0 && (
                                                <div className="room-amenities">
                                                    {room.amenities.slice(0, 4).map((a, i) => (
                                                        <span key={i} className="room-amenity-tag">{a}</span>
                                                    ))}
                                                    {room.amenities.length > 4 && (
                                                        <span className="room-amenity-tag">+{room.amenities.length - 4} more</span>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate(`/booking/${room._id}`)}
                                            >
                                                Book Now — ₹{room.pricePerNight}/night
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Location */}
                    <section className="hotel-section">
                        <h2><FaMapMarkerAlt /> Location</h2>
                        <div className="location-card">
                            <div className="location-icon-wrap">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="location-text">
                                <p><strong>{hotel.name}</strong></p>
                                <p>{hotel.location?.address}</p>
                                <p>{hotel.location?.city}, {hotel.location?.state} {hotel.location?.pincode}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="hotel-sidebar">
                    <div className="hotel-quick-info">
                        <h3>Quick Info</h3>
                        <div className="quick-info-row">
                            <span className="quick-info-label">Rating</span>
                            <span className="quick-info-value" style={{ display: 'flex', gap: '2px' }}>
                                {hotel.rating > 0 ? (
                                    <>{renderStars(hotel.rating)} {hotel.rating.toFixed(1)}</>
                                ) : 'Not rated'}
                            </span>
                        </div>
                        <div className="quick-info-row">
                            <span className="quick-info-label">Reviews</span>
                            <span className="quick-info-value">{hotel.totalReviews || 0}</span>
                        </div>
                        <div className="quick-info-row">
                            <span className="quick-info-label">Rooms</span>
                            <span className="quick-info-value">{rooms.length} types</span>
                        </div>
                        <div className="quick-info-row">
                            <span className="quick-info-label">City</span>
                            <span className="quick-info-value">{hotel.location?.city}</span>
                        </div>
                        {rooms.length > 0 && (
                            <div className="quick-info-row">
                                <span className="quick-info-label">From</span>
                                <span className="quick-info-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                                    ₹{Math.min(...rooms.map(r => r.pricePerNight))}/night
                                </span>
                            </div>
                        )}
                        {rooms.length > 0 && (
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
                                onClick={() => {
                                    const roomsSection = document.querySelector('.rooms-list');
                                    roomsSection?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                View Rooms
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
