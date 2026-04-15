import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookingDetail.css';

const BookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Review state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [existingReview, setExistingReview] = useState(null);

    useEffect(() => { fetchBooking(); }, [id]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(id);
            setBooking(response.data);
            if (response.data.status === 'confirmed' || response.data.status === 'completed') {
                try {
                    const reviewRes = await reviewService.getUserReview(response.data.hotel._id);
                    if (reviewRes.data) setExistingReview(reviewRes.data);
                } catch (e) { /* No review */ }
            }
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Failed to load booking details');
        } finally { setLoading(false); }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setCancelling(true);
            const response = await bookingService.cancelBooking(id);
            setBooking(response.data);
            setMsg({ text: response.message, type: 'success' });
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to cancel', type: 'error' });
        } finally { setCancelling(false); }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            await reviewService.createReview({
                hotel: booking.hotel._id,
                rating: reviewRating,
                comment: reviewComment,
            });
            setMsg({ text: 'Review submitted successfully!', type: 'success' });
            setShowReviewForm(false);
            fetchBooking();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to submit review', type: 'error' });
        } finally { setSubmittingReview(false); }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const formatDateLong = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const getNights = () => {
        if (!booking) return 0;
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    if (loading) return <LoadingSpinner message="Loading booking details..." />;

    if (error || !booking) {
        return (
            <div className="bd-page">
                <div className="bd-container">
                    <div className="bd-error-state">
                        <h2>Booking Not Found</h2>
                        <p>{error || "We couldn't find this booking."}</p>
                        <button className="bd-btn-primary" onClick={() => navigate('/my-bookings')}>Back to Bookings</button>
                    </div>
                </div>
            </div>
        );
    }

    const canCancel = booking.status === 'confirmed' && new Date(booking.checkInDate) > new Date();
    const canReview = (booking.status === 'confirmed' || booking.status === 'completed') && !existingReview;
    const statusLabel = booking.status?.toUpperCase() || 'UNKNOWN';

    return (
        <div className="bd-page">
            <div className="bd-container">
                {/* Back Link */}
                <div className="bd-back-link" onClick={() => navigate('/my-bookings')}>
                    <span className="material-symbols-outlined bd-icon-sm">arrow_back</span>
                    <span>Back to Dashboard</span>
                </div>

                {/* Flash message */}
                {msg.text && <div className={`bd-msg bd-msg-${msg.type}`}>{msg.text}</div>}

                {/* Header */}
                <header className="bd-header">
                    <div className="bd-header-left">
                        <h1 className="bd-title">Booking Details</h1>
                        <div className="bd-ref-row">
                            <span className="bd-ref-text">Reference: <span className="bd-ref-code">{booking.bookingReference}</span></span>
                            <span className={`bd-status-pill bd-status-${booking.status}`}>{statusLabel}</span>
                        </div>
                    </div>
                </header>

                {/* Bento Grid */}
                <div className="bd-bento-grid">

                    {/* ─── 1. Hotel Details Card (8 cols) ─── */}
                    <div className="bd-card bd-card-hotel">
                        <div className="bd-hotel-inner">
                            {booking.hotel?.images?.[0] && (
                                <div className="bd-hotel-image">
                                    <img src={booking.hotel.images[0]} alt={booking.hotel?.name} />
                                </div>
                            )}
                            <div className="bd-hotel-info">
                                <div className="bd-hotel-top">
                                    <div>
                                        <p className="bd-label-tag">Featured Destination</p>
                                        <h2 className="bd-hotel-name">{booking.hotel?.name || 'Hotel'}</h2>
                                        <div className="bd-hotel-location">
                                            <span className="material-symbols-outlined bd-icon-sm">location_on</span>
                                            <span>{booking.hotel?.location?.city}{booking.hotel?.location?.state ? `, ${booking.hotel.location.state}` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bd-hotel-dates">
                                    <div>
                                        <span className="bd-micro-label">Check-in</span>
                                        <p className="bd-date-value">{formatDate(booking.checkInDate)}</p>
                                        <p className="bd-date-sub">From 3:00 PM</p>
                                    </div>
                                    <div>
                                        <span className="bd-micro-label">Check-out</span>
                                        <p className="bd-date-value">{formatDate(booking.checkOutDate)}</p>
                                        <p className="bd-date-sub">Until 12:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── 2. Stay Summary Sidebar (4 cols) ─── */}
                    <div className="bd-sidebar-stack">
                        <div className="bd-card bd-card-stay">
                            <h3 className="bd-card-title">Stay Summary</h3>
                            <div className="bd-stay-rows">
                                <div className="bd-stay-row">
                                    <span>Duration</span>
                                    <span className="bd-stay-val">{getNights()} Night{getNights() > 1 ? 's' : ''}</span>
                                </div>
                                <div className="bd-stay-row">
                                    <span>Room Type</span>
                                    <span className="bd-stay-val">{booking.room?.roomType || 'N/A'}</span>
                                </div>
                                <div className="bd-stay-row">
                                    <span>Rooms</span>
                                    <span className="bd-stay-val">{booking.numberOfRooms}</span>
                                </div>
                                <div className="bd-stay-row">
                                    <span>Guests</span>
                                    <span className="bd-stay-val">{booking.numberOfGuests || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Concierge Note */}
                        {booking.specialRequests && (
                            <div className="bd-concierge-note">
                                <div className="bd-concierge-inner">
                                    <span className="material-symbols-outlined bd-concierge-icon">concierge</span>
                                    <div>
                                        <p className="bd-concierge-title">Special Requests</p>
                                        <p className="bd-concierge-text">{booking.specialRequests}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── 3. Payment Information Card (8 cols) ─── */}
                    <div className="bd-card bd-card-payment">
                        <div className="bd-payment-header">
                            <h3 className="bd-payment-title">Payment Information</h3>
                            <span className={`bd-payment-badge bd-pay-${booking.paymentStatus}`}>
                                {booking.paymentStatus?.toUpperCase()}
                            </span>
                        </div>
                        <div className="bd-payment-grid">
                            <div>
                                <span className="bd-micro-label">Payment Method</span>
                                <div className="bd-pay-method">
                                    <div className="bd-pay-icon-box">
                                        <span className="material-symbols-outlined bd-icon-sm">credit_card</span>
                                    </div>
                                    <p className="bd-pay-method-text">{booking.paymentMethod}</p>
                                </div>
                            </div>
                            {booking.transactionId && (
                                <div>
                                    <span className="bd-micro-label">Transaction ID</span>
                                    <p className="bd-txn-id">{booking.transactionId}</p>
                                </div>
                            )}
                        </div>
                        <div className="bd-payment-footer">
                            <div>
                                <p className="bd-pay-note">Price includes all taxes and service fees.</p>
                            </div>
                            <div className="bd-total-block">
                                <span className="bd-micro-label">Total Amount Paid</span>
                                <p className="bd-total-amount">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        {booking.paymentStatus === 'refunded' && (
                            <div className="bd-refund-info">
                                <span className="material-symbols-outlined bd-icon-sm">info</span>
                                Refund of ₹{booking.totalPrice?.toLocaleString('en-IN')} will be processed within 5-7 business days.
                            </div>
                        )}
                    </div>

                    {/* ─── 4. Manage Booking Card (4 cols) ─── */}
                    <div className="bd-card bd-card-manage">
                        <div>
                            <h3 className="bd-card-title">Manage Booking</h3>
                            <div className="bd-manage-actions">
                                {canReview && !showReviewForm && (
                                    <button className="bd-manage-btn" onClick={() => setShowReviewForm(true)}>
                                        <span>Leave a Review</span>
                                        <span className="material-symbols-outlined bd-chevron">chevron_right</span>
                                    </button>
                                )}
                                {canCancel && (
                                    <button className="bd-manage-btn bd-manage-danger" onClick={handleCancel} disabled={cancelling}>
                                        <span>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</span>
                                        <span className="material-symbols-outlined bd-chevron">close</span>
                                    </button>
                                )}
                                <button className="bd-manage-btn" onClick={() => navigate(`/hotel/${booking.hotel?._id}`)}>
                                    <span>View Hotel</span>
                                    <span className="material-symbols-outlined bd-chevron">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="bd-concierge-link">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                            Need Help? Contact Concierge
                        </div>
                    </div>

                    {/* ─── 5. Review Section (full width) ─── */}
                    {existingReview && (
                        <div className="bd-card bd-card-review-full">
                            <h3 className="bd-card-title">Your Review</h3>
                            <div className="bd-review-display">
                                <div className="bd-review-stars">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: s <= existingReview.rating ? '#f59e0b' : '#e2e8f0' }}>star</span>
                                    ))}
                                </div>
                                <p className="bd-review-comment">"{existingReview.comment}"</p>
                            </div>
                        </div>
                    )}

                    {canReview && showReviewForm && (
                        <div className="bd-card bd-card-review-full">
                            <h3 className="bd-card-title">Write a Review</h3>
                            <form onSubmit={handleSubmitReview} className="bd-review-form">
                                <div className="bd-rating-selector">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" className="bd-star-btn" onClick={() => setReviewRating(s)}>
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: s <= reviewRating ? '#f59e0b' : '#e2e8f0' }}>star</span>
                                        </button>
                                    ))}
                                    <span className="bd-rating-text">{reviewRating}/5</span>
                                </div>
                                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." rows="4" required minLength={10} />
                                <div className="bd-review-actions">
                                    <button type="button" className="bd-btn-ghost" onClick={() => setShowReviewForm(false)}>Cancel</button>
                                    <button type="submit" className="bd-btn-primary" disabled={submittingReview}>
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
