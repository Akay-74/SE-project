import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/dashboard/StatusBadge';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaBed,
    FaEye,
    FaTimesCircle,
    FaStar,
    FaSuitcase,
} from 'react-icons/fa';
import './UserDashboard.css';

const TAB_FILTERS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('upcoming');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getUserBookings();
            setBookings(response.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await bookingService.cancelBooking(bookingId);
            fetchBookings();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getFilteredBookings = () => {
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return bookings.filter(b =>
                    new Date(b.checkInDate) > now && b.status !== 'cancelled'
                );
            case 'completed':
                return bookings.filter(b =>
                    new Date(b.checkOutDate) < now || b.status === 'completed'
                );
            case 'cancelled':
                return bookings.filter(b => b.status === 'cancelled');
            default:
                return bookings;
        }
    };

    const getStats = () => {
        const now = new Date();
        return {
            total: bookings.length,
            upcoming: bookings.filter(b =>
                new Date(b.checkInDate) > now && b.status !== 'cancelled'
            ).length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
        };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getNights = (checkIn, checkOut) => {
        const diffMs = new Date(checkOut) - new Date(checkIn);
        return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    };

    if (loading) {
        return <LoadingSpinner message="Loading your bookings..." />;
    }

    const stats = getStats();
    const filteredBookings = getFilteredBookings();

    return (
        <div className="my-bookings-page">
            <div className="container">
                {/* Hero Header */}
                <div className="bookings-hero">
                    <div className="bookings-hero-text">
                        <span className="bookings-label">
                            <FaSuitcase /> My Bookings
                        </span>
                        <h1>Your Journeys</h1>
                        <p className="bookings-subtitle">
                            Manage your upcoming adventures and relive your favorite memories.
                        </p>
                    </div>
                    <div className="bookings-stats-inline">
                        <div className="inline-stat">
                            <span className="inline-stat-value">{stats.total}</span>
                            <span className="inline-stat-label">Total</span>
                        </div>
                        <div className="inline-stat-divider" />
                        <div className="inline-stat">
                            <span className="inline-stat-value inline-stat-upcoming">{stats.upcoming}</span>
                            <span className="inline-stat-label">Upcoming</span>
                        </div>
                        <div className="inline-stat-divider" />
                        <div className="inline-stat">
                            <span className="inline-stat-value inline-stat-completed">{stats.completed}</span>
                            <span className="inline-stat-label">Completed</span>
                        </div>
                        <div className="inline-stat-divider" />
                        <div className="inline-stat">
                            <span className="inline-stat-value inline-stat-cancelled">{stats.cancelled}</span>
                            <span className="inline-stat-label">Cancelled</span>
                        </div>
                    </div>
                </div>

                {/* Segmented Control */}
                <div className="segmented-control">
                    {TAB_FILTERS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`segment-btn ${filter === tab.key ? 'active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                        >
                            {tab.label}
                            {tab.key === 'upcoming' && stats.upcoming > 0 && (
                                <span className="segment-count">{stats.upcoming}</span>
                            )}
                            {tab.key === 'completed' && stats.completed > 0 && (
                                <span className="segment-count">{stats.completed}</span>
                            )}
                            {tab.key === 'cancelled' && stats.cancelled > 0 && (
                                <span className="segment-count">{stats.cancelled}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        {error}
                    </div>
                )}

                {/* Bookings Grid */}
                <div className="bookings-grid">
                    {filteredBookings.length === 0 ? (
                        <div className="empty-journeys">
                            <div className="empty-journeys-icon">
                                <FaCalendarAlt />
                            </div>
                            <h3>No {filter} bookings</h3>
                            <p>
                                {filter === 'upcoming'
                                    ? "You don't have any upcoming trips. Time to plan your next adventure!"
                                    : filter === 'completed'
                                        ? "You haven't completed any trips yet."
                                        : 'No cancelled bookings found.'}
                            </p>
                            {filter === 'upcoming' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/search')}
                                >
                                    Explore Hotels
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredBookings.map((booking, index) => (
                            <div
                                key={booking._id}
                                className="journey-card"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                {/* Card Image */}
                                <div className="journey-card-image">
                                    {booking.hotel?.images?.[0] ? (
                                        <img
                                            src={booking.hotel.images[0]}
                                            alt={booking.hotel?.name}
                                        />
                                    ) : (
                                        <div className="journey-card-image-placeholder">
                                            <FaBed />
                                        </div>
                                    )}
                                    <div className="journey-card-badge">
                                        <StatusBadge status={booking.status} type="booking" />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="journey-card-body">
                                    <div className="journey-card-header">
                                        <h3 className="journey-hotel-name">
                                            {booking.hotel?.name || 'Hotel'}
                                        </h3>
                                        {booking.hotel?.location && (
                                            <p className="journey-location">
                                                <FaMapMarkerAlt />
                                                {booking.hotel.location.city}
                                                {booking.hotel.location.state
                                                    ? `, ${booking.hotel.location.state}`
                                                    : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="journey-details-grid">
                                        <div className="journey-detail-item">
                                            <span className="journey-detail-label">DATES</span>
                                            <span className="journey-detail-value">
                                                {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
                                            </span>
                                        </div>
                                        <div className="journey-detail-item">
                                            <span className="journey-detail-label">DURATION</span>
                                            <span className="journey-detail-value">
                                                {getNights(booking.checkInDate, booking.checkOutDate)} night(s)
                                            </span>
                                        </div>
                                        <div className="journey-detail-item">
                                            <span className="journey-detail-label">ROOM</span>
                                            <span className="journey-detail-value">
                                                {booking.room?.roomType || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="journey-detail-item">
                                            <span className="journey-detail-label">REFERENCE</span>
                                            <span className="journey-detail-value journey-ref">
                                                {booking.bookingReference}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="journey-card-footer">
                                        <div className="journey-price">
                                            <span className="journey-price-label">Total</span>
                                            <span className="journey-price-value">
                                                ₹{booking.totalPrice?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="journey-actions">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => navigate(`/booking/${booking._id}`)}
                                            >
                                                <FaEye /> View Details
                                            </button>
                                            {booking.status === 'confirmed' &&
                                                new Date(booking.checkInDate) > new Date() && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                    >
                                                        <FaTimesCircle /> Cancel
                                                    </button>
                                                )}
                                            {booking.status === 'completed' && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => navigate(`/booking/${booking._id}`)}
                                                >
                                                    <FaStar /> Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
