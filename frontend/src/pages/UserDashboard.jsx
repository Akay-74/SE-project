import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/dashboard/StatusBadge';
import StatCard from '../components/dashboard/StatCard';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

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
            fetchBookings(); // Refresh bookings
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
            case 'past':
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner message="Loading your bookings..." />;
    }

    const stats = getStats();
    const filteredBookings = getFilteredBookings();

    return (
        <div className="user-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>My Bookings</h1>
                        <p>Welcome back, {user?.name}!</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Bookings"
                        value={stats.total}
                        icon={FaCalendarAlt}
                        color="primary"
                    />
                    <StatCard
                        title="Upcoming"
                        value={stats.upcoming}
                        icon={FaClock}
                        color="warning"
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        icon={FaCheckCircle}
                        color="success"
                    />
                    <StatCard
                        title="Cancelled"
                        value={stats.cancelled}
                        icon={FaTimesCircle}
                        color="danger"
                    />
                </div>

                {/* Filters */}
                <div className="booking-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Bookings
                    </button>
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                <div className="bookings-list">
                    {filteredBookings.length === 0 ? (
                        <div className="empty-state">
                            <FaCalendarAlt className="empty-icon" />
                            <h3>No bookings found</h3>
                            <p>
                                {filter === 'all'
                                    ? "You haven't made any bookings yet. Start exploring hotels!"
                                    : `No ${filter} bookings found.`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-card-header">
                                    <div className="booking-info">
                                        <h3>{booking.hotel?.name || 'Hotel'}</h3>
                                        <p className="booking-reference">
                                            Ref: {booking.bookingReference}
                                        </p>
                                    </div>
                                    <StatusBadge status={booking.status} type="booking" />
                                </div>

                                <div className="booking-card-body">
                                    <div className="booking-detail">
                                        <span className="detail-label">Room Type:</span>
                                        <span className="detail-value">{booking.room?.roomType || 'N/A'}</span>
                                    </div>
                                    <div className="booking-detail">
                                        <span className="detail-label">Check-in:</span>
                                        <span className="detail-value">{formatDate(booking.checkInDate)}</span>
                                    </div>
                                    <div className="booking-detail">
                                        <span className="detail-label">Check-out:</span>
                                        <span className="detail-value">{formatDate(booking.checkOutDate)}</span>
                                    </div>
                                    <div className="booking-detail">
                                        <span className="detail-label">Guests:</span>
                                        <span className="detail-value">{booking.numberOfGuests}</span>
                                    </div>
                                    <div className="booking-detail">
                                        <span className="detail-label">Total Price:</span>
                                        <span className="detail-value price">₹{booking.totalPrice}</span>
                                    </div>
                                    <div className="booking-detail">
                                        <span className="detail-label">Payment:</span>
                                        <StatusBadge status={booking.paymentStatus} type="payment" />
                                    </div>
                                </div>

                                <div className="booking-card-footer">
                                    {booking.status === 'confirmed' && new Date(booking.checkInDate) > new Date() && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleCancelBooking(booking._id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                    {booking.status === 'completed' && (
                                        <button className="btn btn-ghost btn-sm">
                                            Leave Review
                                        </button>
                                    )}
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
