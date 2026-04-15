import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaMapMarkerAlt, FaStar, FaArrowLeft, FaWifi, FaParking,
    FaSwimmingPool, FaDumbbell, FaUtensils, FaUsers, FaBed, FaCheckCircle
} from 'react-icons/fa';
import './HotelDetails.css';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [reviewMsg, setReviewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => { fetchHotelDetails(); }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
                hotelService.getHotelById(id),
                hotelService.getRoomsByHotel(id),
                reviewService.getHotelReviews(id, { limit: 20 }),
            ]);
            setHotel(hotelRes.data);
            setRooms(roomsRes.data || []);
            setReviews(reviewsRes.data || []);
            setReviewsTotal(reviewsRes.pagination?.total || 0);

            // Check if current user has already reviewed
            if (isAuthenticated) {
                try {
                    const userRevRes = await reviewService.getUserReview(id);
                    if (userRevRes.data) setUserReview(userRevRes.data);
                } catch (e) { }
            }
        } catch (err) {
            console.error('Error fetching hotel details:', err);
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
                                                onClick={() => navigate(`/book/${room._id}`)}
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

                    {/* Reviews Section */}
                    <section className="hotel-section">
                        <h2><FaStar /> Reviews ({reviewsTotal})</h2>

                        {reviewMsg && (
                            <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                                {reviewMsg}
                            </div>
                        )}

                        {/* Review Form */}
                        {isAuthenticated && !userReview && (
                            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                {!showReviewForm ? (
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(true)}>
                                        <FaStar /> Write a Review
                                    </button>
                                ) : (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Write Your Review</h4>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            try {
                                                setSubmittingReview(true);
                                                await reviewService.createReview({ hotel: id, rating: reviewRating, comment: reviewComment });
                                                setReviewMsg('Review submitted successfully!');
                                                setShowReviewForm(false);
                                                setReviewComment('');
                                                // Refresh
                                                const [revRes, userRevRes] = await Promise.all([
                                                    reviewService.getHotelReviews(id, { limit: 20 }),
                                                    reviewService.getUserReview(id),
                                                ]);
                                                setReviews(revRes.data || []);
                                                setReviewsTotal(revRes.pagination?.total || 0);
                                                if (userRevRes.data) setUserReview(userRevRes.data);
                                                setTimeout(() => setReviewMsg(''), 3000);
                                            } catch (err) {
                                                setReviewMsg(err.response?.data?.message || 'Failed to submit review');
                                                setTimeout(() => setReviewMsg(''), 4000);
                                            } finally {
                                                setSubmittingReview(false);
                                            }
                                        }}>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--spacing-md)' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <button key={s} type="button" onClick={() => setReviewRating(s)} style={{
                                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: 0,
                                                        color: s <= reviewRating ? '#f59e0b' : 'rgba(255,255,255,0.15)', transition: 'transform 0.2s'
                                                    }}><FaStar /></button>
                                                ))}
                                                <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>{reviewRating}/5</span>
                                            </div>
                                            <textarea
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                                placeholder="Share your experience..."
                                                rows="3"
                                                required
                                                minLength={10}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                                            />
                                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReviewForm(false)}>Cancel</button>
                                                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                                                    {submittingReview ? 'Submitting...' : 'Submit'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {userReview && (
                            <div style={{ background: 'rgba(139,92,246,0.08)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-lg)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--spacing-sm)' }}>
                                    <strong style={{ color: 'var(--text-primary)', marginRight: '8px' }}>Your Review</strong>
                                    {[1, 2, 3, 4, 5].map(s => <FaStar key={s} style={{ color: s <= userReview.rating ? '#f59e0b' : 'rgba(255,255,255,0.15)', fontSize: '0.9rem' }} />)}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{userReview.comment}</p>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>No reviews yet. Be the first to review!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {reviews.filter(r => r._id !== userReview?._id).map(review => (
                                    <div key={review._id} style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                                            <img src={review.user?.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                            <strong style={{ color: 'var(--text-primary)' }}>{review.user?.name}</strong>
                                            <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                                                {[1, 2, 3, 4, 5].map(s => <FaStar key={s} style={{ color: s <= review.rating ? '#f59e0b' : 'rgba(255,255,255,0.15)', fontSize: '0.8rem' }} />)}
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{review.comment}</p>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-sm)', display: 'block' }}>
                                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
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
